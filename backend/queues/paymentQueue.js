const { Queue, Worker } = require("bullmq");
const IORedis = require("ioredis");
const { logger } = require("../utils/logger");

const PAYMENT_QUEUE_ENABLED =
  String(process.env.PAYMENT_QUEUE_ENABLED || "true").trim().toLowerCase() === "true";
const PAYMENT_QUEUE_REDIS_URL = String(
  process.env.PAYMENT_QUEUE_REDIS_URL || process.env.REDIS_URL || ""
).trim();
const PAYMENT_QUEUE_PREFIX = String(process.env.PAYMENT_QUEUE_PREFIX || "portfolio").trim();

const RECONCILIATION_QUEUE_NAME = String(
  process.env.PAYMENT_RECON_QUEUE_NAME || "payment-reconciliation"
).trim();

const RECONCILIATION_WORKER_CONCURRENCY =
  Number.parseInt(process.env.PAYMENT_RECON_WORKER_CONCURRENCY, 10) || 2;

const PAYMENT_QUEUE_DIAGNOSTIC_JOB_STATES = [
  "waiting",
  "active",
  "completed",
  "failed",
  "delayed",
  "paused",
];

let queueConnection = null;
let reconciliationQueue = null;
let reconciliationWorker = null;
let workersStarted = false;

const isPaymentQueueReady = () => PAYMENT_QUEUE_ENABLED && Boolean(PAYMENT_QUEUE_REDIS_URL);

const createRedisConnection = () =>
  new IORedis(PAYMENT_QUEUE_REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
  });

const ensureQueueConnection = () => {
  if (!isPaymentQueueReady()) {
    return null;
  }

  if (!queueConnection) {
    queueConnection = createRedisConnection();
    queueConnection.on("error", (error) => {
      logger.error(
        {
          err: error,
        },
        "Payment queue Redis connection error"
      );
    });
  }

  return queueConnection;
};

const ensureReconciliationQueue = () => {
  if (!reconciliationQueue) {
    const connection = ensureQueueConnection();
    if (!connection) {
      return null;
    }

    reconciliationQueue = new Queue(RECONCILIATION_QUEUE_NAME, {
      connection,
      prefix: PAYMENT_QUEUE_PREFIX || "portfolio",
      defaultJobOptions: {
        removeOnComplete: 500,
        removeOnFail: 1000,
      },
    });
  }

  return reconciliationQueue;
};

const isDuplicateJobError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("job") && message.includes("already");
};

const enqueuePaymentReconciliationJob = async ({
  type,
  normalizedOrderId,
  emailDispatchQueued,
  attemptNumber,
  delayMs = 0,
}) => {
  if (!isPaymentQueueReady()) {
    return false;
  }

  const queue = ensureReconciliationQueue();
  if (!queue) {
    return false;
  }

  const orderId = String(normalizedOrderId || "").trim();
  if (!orderId) {
    return false;
  }

  const normalizedAttempt = Number.parseInt(attemptNumber, 10) || 1;
  const jobId = `${type}:${orderId}:attempt:${normalizedAttempt}`;

  try {
    await queue.add(
      "reconcile-order",
      {
        type,
        normalizedOrderId: orderId,
        emailDispatchQueued: Boolean(emailDispatchQueued),
        attemptNumber: normalizedAttempt,
      },
      {
        jobId,
        delay: Math.max(0, Number.parseInt(delayMs, 10) || 0),
      }
    );

    return true;
  } catch (error) {
    if (isDuplicateJobError(error)) {
      return true;
    }

    throw error;
  }
};

const attachWorkerLogging = (worker, workerName) => {
  worker.on("ready", () => {
    logger.info(
      {
        worker: workerName,
      },
      "Payment queue worker is ready"
    );
  });

  worker.on("failed", (job, error) => {
    logger.error(
      {
        err: error,
        worker: workerName,
        jobId: job?.id,
        jobName: job?.name,
      },
      "Payment queue worker job failed"
    );
  });

  worker.on("error", (error) => {
    logger.error(
      {
        err: error,
        worker: workerName,
      },
      "Payment queue worker error"
    );
  });
};

const startPaymentQueueWorkers = ({ processReconciliationJob }) => {
  if (workersStarted) {
    return true;
  }

  if (!isPaymentQueueReady()) {
    return false;
  }

  if (typeof processReconciliationJob !== "function") {
    throw new TypeError("Queue worker reconciliation handler must be a function");
  }

  reconciliationWorker = new Worker(
    RECONCILIATION_QUEUE_NAME,
    async (job) => {
      await processReconciliationJob(job.data || {});
    },
    {
      connection: createRedisConnection(),
      prefix: PAYMENT_QUEUE_PREFIX || "portfolio",
      concurrency: RECONCILIATION_WORKER_CONCURRENCY,
    }
  );

  attachWorkerLogging(reconciliationWorker, RECONCILIATION_QUEUE_NAME);

  workersStarted = true;
  logger.info("Payment reconciliation queue worker started");
  return true;
};

const closePaymentQueueWorkers = async () => {
  const closers = [];

  if (reconciliationWorker) {
    closers.push(reconciliationWorker.close());
    reconciliationWorker = null;
  }

  if (reconciliationQueue) {
    closers.push(reconciliationQueue.close());
    reconciliationQueue = null;
  }

  if (queueConnection) {
    closers.push(queueConnection.quit());
    queueConnection = null;
  }

  await Promise.allSettled(closers);
  workersStarted = false;
};

const getPaymentQueueStatus = () => ({
  enabled: PAYMENT_QUEUE_ENABLED,
  configured: Boolean(PAYMENT_QUEUE_REDIS_URL),
  ready: isPaymentQueueReady(),
  workersStarted,
  queueNames: {
    reconciliation: RECONCILIATION_QUEUE_NAME,
  },
});

const sanitizeFailedSampleLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 5;
  }
  return Math.min(parsed, 25);
};

const summarizeQueueJob = (job) => {
  const data = job?.data || {};
  return {
    id: String(job?.id || ""),
    name: String(job?.name || ""),
    attemptsMade: Number(job?.attemptsMade || 0),
    failedReason: String(job?.failedReason || "").slice(0, 300),
    createdAt: Number(job?.timestamp || 0) || undefined,
    processedAt: Number(job?.processedOn || 0) || undefined,
    finishedAt: Number(job?.finishedOn || 0) || undefined,
    data: {
      type: String(data.type || ""),
      normalizedOrderId: String(data.normalizedOrderId || ""),
      attemptNumber: Number(data.attemptNumber || 0) || undefined,
    },
  };
};

const getQueueDiagnostics = async ({ queue, failedSampleLimit }) => {
  const [counts, failedJobs] = await Promise.all([
    queue.getJobCounts(...PAYMENT_QUEUE_DIAGNOSTIC_JOB_STATES),
    queue.getJobs(["failed"], 0, Math.max(0, failedSampleLimit - 1), false),
  ]);

  return {
    counts,
    recentFailedJobs: failedJobs.map(summarizeQueueJob),
  };
};

const getPaymentQueueDiagnostics = async ({ failedSampleLimit = 5 } = {}) => {
  const baseStatus = getPaymentQueueStatus();
  const normalizedLimit = sanitizeFailedSampleLimit(failedSampleLimit);

  if (!baseStatus.ready) {
    return {
      ...baseStatus,
      diagnostics: null,
      failedSampleLimit: normalizedLimit,
    };
  }

  try {
    const reconQueue = ensureReconciliationQueue();
    if (!reconQueue) {
      return {
        ...baseStatus,
        diagnostics: null,
        diagnosticsError: "queue_unavailable",
        failedSampleLimit: normalizedLimit,
      };
    }

    const reconciliation = await getQueueDiagnostics({
      queue: reconQueue,
      failedSampleLimit: normalizedLimit,
    });

    return {
      ...baseStatus,
      diagnostics: {
        reconciliation,
      },
      failedSampleLimit: normalizedLimit,
    };
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      "Failed to fetch payment queue diagnostics"
    );

    return {
      ...baseStatus,
      diagnostics: null,
      diagnosticsError: "diagnostics_failed",
      failedSampleLimit: normalizedLimit,
    };
  }
};

module.exports = {
  isPaymentQueueReady,
  enqueuePaymentReconciliationJob,
  startPaymentQueueWorkers,
  closePaymentQueueWorkers,
  getPaymentQueueStatus,
  getPaymentQueueDiagnostics,
};

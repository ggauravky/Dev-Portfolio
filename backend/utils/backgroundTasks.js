const { logger } = require("./logger");

const pendingTasks = new Set();

const scheduleBackgroundTask = ({ name, context = {}, task, taskLogger = logger }) => {
  let job;
  job = new Promise((resolve) => setImmediate(resolve))
    .then(task)
    .catch((error) => {
      taskLogger.error({ ...context, err: error, backgroundTask: name }, "Background task failed");
    })
    .finally(() => pendingTasks.delete(job));
  pendingTasks.add(job);
  return job;
};

const waitForBackgroundTasks = async ({ timeoutMs = 5000 } = {}) => {
  if (!pendingTasks.size) return;
  let timeout;
  await Promise.race([
    Promise.allSettled([...pendingTasks]),
    new Promise((resolve) => {
      timeout = setTimeout(resolve, timeoutMs);
      timeout.unref?.();
    }),
  ]);
  if (timeout) clearTimeout(timeout);
};

module.exports = {
  scheduleBackgroundTask,
  waitForBackgroundTasks,
};

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const path = require("node:path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDatabase = require("../config/database");
const User = require("../models/User");
const Booking = require("../models/Booking");
const SupportPayment = require("../models/SupportPayment");
const { logger } = require("../utils/logger");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const printUsage = () => {
  // Keep CLI help short so operators can quickly rerun with corrected flags.
  logger.info(
    {
      usage: [
        "npm run migrate:backfill-user-links -- [--dry-run] [--mongo-uri <mongodb-uri>]",
        "npm run migrate:backfill-user-links:dry -- [--mongo-uri <mongodb-uri>]",
      ],
      examples: [
        "npm run migrate:backfill-user-links:dry",
        "npm run migrate:backfill-user-links -- --mongo-uri \"mongodb://127.0.0.1:27017/dev_portfolio\"",
      ],
      notes: [
        "Use --mongo-uri when default MONGODB_URI is unavailable in this environment.",
        "You can also set MONGODB_URI_DIRECT to avoid passing --mongo-uri every run.",
        "In restricted DNS networks, direct mongodb:// URIs can work when mongodb+srv:// fails.",
      ],
    },
    "Legacy userId backfill script usage"
  );
};

const parseArgs = (argv) => {
  let dryRun = false;
  let showHelp = false;
  let mongoUri = "";

  for (let index = 0; index < argv.length; index += 1) {
    const token = String(argv[index] || "").trim();
    if (!token) {
      continue;
    }

    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (token === "--help" || token === "-h") {
      showHelp = true;
      continue;
    }

    if (token.startsWith("--mongo-uri=")) {
      mongoUri = token.slice("--mongo-uri=".length).trim();
      continue;
    }

    if (token === "--mongo-uri") {
      const next = String(argv[index + 1] || "").trim();
      if (next && !next.startsWith("--")) {
        mongoUri = next;
        index += 1;
      }
    }
  }

  return {
    dryRun,
    showHelp,
    mongoUri,
  };
};

const collectPendingEmails = async () => {
  const [bookingEmailsRaw, supportEmailsRaw] = await Promise.all([
    Booking.distinct("email", {
      userId: null,
      email: { $exists: true, $type: "string", $ne: "" },
    }),
    SupportPayment.distinct("email", {
      userId: null,
      email: { $exists: true, $type: "string", $ne: "" },
    }),
  ]);

  const bookingEmails = bookingEmailsRaw.map(normalizeEmail).filter(Boolean);
  const supportEmails = supportEmailsRaw.map(normalizeEmail).filter(Boolean);

  return {
    bookingEmails,
    supportEmails,
    allEmails: [...new Set([...bookingEmails, ...supportEmails])],
  };
};

const buildUserEmailMap = async (emails) => {
  if (emails.length === 0) {
    return new Map();
  }

  const users = await User.find({
    email: { $in: emails },
  })
    .select("_id email")
    .lean();

  const byEmail = new Map();
  for (const user of users) {
    byEmail.set(normalizeEmail(user.email), String(user._id));
  }

  return byEmail;
};

const backfillForCollection = async ({
  model,
  collectionLabel,
  userEmailMap,
  dryRun,
}) => {
  let updatedCount = 0;
  let matchedCount = 0;

  for (const [email, userId] of userEmailMap.entries()) {
    const filter = { userId: null, email };

    if (dryRun) {
      const count = await model.countDocuments(filter);
      matchedCount += count;
      continue;
    }

    const result = await model.updateMany(filter, {
      $set: {
        userId,
      },
    });

    matchedCount += Number(result.matchedCount || 0);
    updatedCount += Number(result.modifiedCount || 0);
  }

  logger.info(
    {
      collection: collectionLabel,
      matchedCount,
      updatedCount,
      dryRun,
    },
    "Backfill summary for collection"
  );

  return { matchedCount, updatedCount };
};

const run = async () => {
  const { dryRun, showHelp, mongoUri } = parseArgs(process.argv.slice(2));
  const envMongoUriOverride = String(process.env.MONGODB_URI_DIRECT || "").trim();

  if (showHelp) {
    printUsage();
    return;
  }

  const resolvedMongoUri = String(mongoUri || envMongoUriOverride || "").trim();
  if (resolvedMongoUri) {
    process.env.MONGODB_URI = resolvedMongoUri;
    logger.info(
      {
        dryRun,
        usingMongoUriOverride: true,
        overrideSource: mongoUri ? "cli" : "env:MONGODB_URI_DIRECT",
      },
      "Using CLI-provided MongoDB URI override"
    );
  }

  if (!String(process.env.MONGODB_URI || "").trim()) {
    throw new Error(
      "MONGODB_URI is missing. Set it in backend/.env or pass --mongo-uri <mongodb-uri>."
    );
  }

  const connection = await connectDatabase();
  if (!connection) {
    throw new Error(
      "Database connection is unavailable. If SRV DNS lookup is blocked in your network, pass --mongo-uri with a direct mongodb:// URI and retry."
    );
  }

  const { bookingEmails, supportEmails, allEmails } = await collectPendingEmails();
  const userEmailMap = await buildUserEmailMap(allEmails);

  const unmatchedEmails = allEmails.filter((email) => !userEmailMap.has(email));

  logger.info(
    {
      dryRun,
      bookingEmailsPending: bookingEmails.length,
      supportEmailsPending: supportEmails.length,
      uniqueEmailsPending: allEmails.length,
      matchedUserEmails: userEmailMap.size,
      unmatchedEmails: unmatchedEmails.length,
    },
    "Starting legacy userId backfill"
  );

  const [bookingSummary, supportSummary] = await Promise.all([
    backfillForCollection({
      model: Booking,
      collectionLabel: "bookings",
      userEmailMap,
      dryRun,
    }),
    backfillForCollection({
      model: SupportPayment,
      collectionLabel: "support_payments",
      userEmailMap,
      dryRun,
    }),
  ]);

  logger.info(
    {
      dryRun,
      unmatchedEmails: unmatchedEmails.slice(0, 50),
      unmatchedEmailCount: unmatchedEmails.length,
      totals: {
        matched:
          Number(bookingSummary.matchedCount || 0) + Number(supportSummary.matchedCount || 0),
        updated:
          Number(bookingSummary.updatedCount || 0) + Number(supportSummary.updatedCount || 0),
      },
    },
    "Legacy userId backfill finished"
  );
};

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error({ err: error }, "Legacy userId backfill failed");
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      logger.error({ err: disconnectError }, "Failed to disconnect MongoDB");
    }
    process.exit(1);
  });

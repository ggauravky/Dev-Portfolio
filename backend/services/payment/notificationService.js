const Booking = require("../../models/Booking");
const SupportPayment = require("../../models/SupportPayment");
const { logger } = require("../../utils/logger");
const {
  generateServiceConfirmationPdf,
  generateSupportReceiptPdf,
} = require("../../utils/pdfGenerator");
const {
  generateServiceConfirmationImage,
  generateSupportReceiptImage,
} = require("../../utils/receiptImage");
const {
  sendServiceReceiptEmail,
  sendSupportReceiptEmail,
  sendAdminPaymentNotificationEmail,
} = require("../../utils/email");
const { recordActivityEvent } = require("../activityService");

const PAYMENT_EMAIL_NOTIFICATIONS_ENABLED =
  String(process.env.PAYMENT_EMAIL_NOTIFICATIONS_ENABLED || "true").trim().toLowerCase() === "true";

const normalizeText = (value, maxLength = 200) =>
  String(value || "")
    .trim()
    .slice(0, maxLength);

const summarizeError = (value, fallback = "notification_failed") =>
  normalizeText(value || fallback, 160) || fallback;

const getModelByKind = (kind) => (kind === "support" ? SupportPayment : Booking);

const buildAttachments = async ({ kind, record, reqLogger }) => {
  const effectiveLogger = reqLogger || logger;

  try {
    if (kind === "support") {
      const pdf = await generateSupportReceiptPdf({ supportPayment: record });
      if (normalizeText(pdf?.contentBase64)) {
        return [pdf];
      }
    } else {
      const pdf = await generateServiceConfirmationPdf({ booking: record });
      if (normalizeText(pdf?.contentBase64)) {
        return [pdf];
      }
    }
  } catch (error) {
    effectiveLogger.warn(
      {
        err: error,
        kind,
        orderId: record?.orderId,
      },
      "Receipt PDF generation failed; trying image fallback"
    );
  }

  try {
    if (kind === "support") {
      const image = await generateSupportReceiptImage({ supportPayment: record });
      if (normalizeText(image?.contentBase64)) {
        return [image];
      }
    } else {
      const image = await generateServiceConfirmationImage({ booking: record });
      if (normalizeText(image?.contentBase64)) {
        return [image];
      }
    }
  } catch (error) {
    effectiveLogger.warn(
      {
        err: error,
        kind,
        orderId: record?.orderId,
      },
      "Receipt image fallback generation failed"
    );
  }

  return [];
};

const updateNotificationMetadata = async ({ kind, recordId, setFields }) => {
  const Model = getModelByKind(kind);
  await Model.updateOne(
    { _id: recordId },
    {
      $set: setFields,
    }
  );
};

const emitActivity = async ({ kind, record, actionType, title, status, eventKey, metadata = {} }) => {
  const paymentId = normalizeText(record?.paymentId, 120);
  const orderId = normalizeText(record?.orderId, 120);

  await recordActivityEvent({
    eventKey,
    userId: record?.userId || null,
    userEmail: normalizeText(record?.email, 320).toLowerCase(),
    domain: "payment",
    actionType,
    title,
    status,
    amount: Number(record?.amount || 0),
    orderId,
    paymentId,
    transactionId: paymentId || orderId,
    receiptKind: kind,
    receiptOrderId: orderId,
    metadata,
  });
};

const sendUserReceiptIfNeeded = async ({ kind, record, attachments, reqLogger }) => {
  const effectiveLogger = reqLogger || logger;
  const recordId = String(record?._id || "").trim();

  if (!recordId || record?.receiptEmailSentAt) {
    return {
      sent: false,
      skipped: true,
      reason: "already_sent",
    };
  }

  const sendResult =
    kind === "support"
      ? await sendSupportReceiptEmail({ supportPayment: record, attachments })
      : await sendServiceReceiptEmail({ booking: record, attachments });

  if (!sendResult.sent) {
    await updateNotificationMetadata({
      kind,
      recordId,
      setFields: {
        receiptEmailLastAttemptAt: new Date(),
        receiptEmailError: summarizeError(sendResult.reason),
      },
    });

    if (!sendResult.skipped) {
      effectiveLogger.warn(
        {
          kind,
          orderId: record?.orderId,
          reason: sendResult.reason,
          error: sendResult.error,
        },
        "User receipt email was not delivered"
      );
    }

    await emitActivity({
      kind,
      record,
      actionType: "user_email_sent",
      title: "User payment email delivery failed",
      status: "failed",
      eventKey: `email:user:${kind}:${record.orderId}:failed`,
      metadata: {
        reason: summarizeError(sendResult.reason),
      },
    });

    return sendResult;
  }

  await updateNotificationMetadata({
    kind,
    recordId,
    setFields: {
      receiptEmailSentAt: new Date(),
      receiptEmailLastAttemptAt: new Date(),
      receiptEmailRecipient: normalizeText(record?.email, 320).toLowerCase(),
      receiptEmailMessageId: normalizeText(sendResult.messageId || sendResult.providerId, 200),
      receiptEmailError: "",
    },
  });

  await emitActivity({
    kind,
    record,
    actionType: "user_email_sent",
    title: "User payment email sent",
    status: "success",
    eventKey: `email:user:${kind}:${record.orderId}:${normalizeText(record.paymentId, 120)}`,
    metadata: {
      messageId: normalizeText(sendResult.messageId || sendResult.providerId, 200),
    },
  });

  return sendResult;
};

const sendAdminReceiptIfNeeded = async ({ kind, record, attachments, reqLogger }) => {
  const effectiveLogger = reqLogger || logger;
  const recordId = String(record?._id || "").trim();

  if (!recordId || record?.adminEmailSentAt) {
    return {
      sent: false,
      skipped: true,
      reason: "already_sent",
    };
  }

  const sendResult = await sendAdminPaymentNotificationEmail({
    kind,
    record,
    attachments,
  });

  if (!sendResult.sent) {
    await updateNotificationMetadata({
      kind,
      recordId,
      setFields: {
        adminEmailLastAttemptAt: new Date(),
        adminEmailError: summarizeError(sendResult.reason),
      },
    });

    if (!sendResult.skipped) {
      effectiveLogger.warn(
        {
          kind,
          orderId: record?.orderId,
          reason: sendResult.reason,
          error: sendResult.error,
        },
        "Admin payment email was not delivered"
      );
    }

    await emitActivity({
      kind,
      record,
      actionType: "admin_email_sent",
      title: "Admin payment email delivery failed",
      status: "failed",
      eventKey: `email:admin:${kind}:${record.orderId}:failed`,
      metadata: {
        reason: summarizeError(sendResult.reason),
      },
    });

    return sendResult;
  }

  await updateNotificationMetadata({
    kind,
    recordId,
    setFields: {
      adminEmailSentAt: new Date(),
      adminEmailLastAttemptAt: new Date(),
      adminEmailMessageId: normalizeText(sendResult.messageId || sendResult.providerId, 200),
      adminEmailError: "",
    },
  });

  await emitActivity({
    kind,
    record,
    actionType: "admin_email_sent",
    title: "Admin payment email sent",
    status: "success",
    eventKey: `email:admin:${kind}:${record.orderId}:${normalizeText(record.paymentId, 120)}`,
    metadata: {
      messageId: normalizeText(sendResult.messageId || sendResult.providerId, 200),
    },
  });

  return sendResult;
};

const dispatchPaidNotifications = async ({ kind, record, reqLogger }) => {
  const effectiveLogger = reqLogger || logger;

  if (!PAYMENT_EMAIL_NOTIFICATIONS_ENABLED) {
    return {
      sent: false,
      skipped: true,
      reason: "notifications_disabled",
    };
  }

  if (String(record?.paymentStatus || "").trim().toLowerCase() !== "paid") {
    return {
      sent: false,
      skipped: true,
      reason: "payment_not_paid",
    };
  }

  const attachments = await buildAttachments({ kind, record, reqLogger: effectiveLogger });

  if (attachments.length) {
    await emitActivity({
      kind,
      record,
      actionType: "pdf_generated",
      title: "Payment receipt generated",
      status: "success",
      eventKey: `receipt:generated:${kind}:${record.orderId}:${normalizeText(record.paymentId, 120)}`,
      metadata: {
        attachmentName: normalizeText(attachments[0]?.name, 120),
      },
    });
  }

  const [userEmailResult, adminEmailResult] = await Promise.all([
    sendUserReceiptIfNeeded({ kind, record, attachments, reqLogger: effectiveLogger }),
    sendAdminReceiptIfNeeded({ kind, record, attachments, reqLogger: effectiveLogger }),
  ]);

  return {
    sent: Boolean(userEmailResult?.sent || adminEmailResult?.sent),
    userEmailResult,
    adminEmailResult,
  };
};

const logReceiptDownloadedActivity = async ({ kind, record, metadata = {} }) => {
  await emitActivity({
    kind,
    record,
    actionType: "receipt_downloaded",
    title: "Receipt downloaded",
    status: "success",
    eventKey: "",
    metadata,
  });
};

module.exports = {
  dispatchPaidNotifications,
  logReceiptDownloadedActivity,
};

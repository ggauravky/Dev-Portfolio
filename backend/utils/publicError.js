const normalizeStatus = (value) => {
  const status = Number(value);
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;
};

const buildPublicErrorPayload = (error, { production = false, requestId } = {}) => {
  const status = normalizeStatus(error?.status);
  const fallbackMessage = status === 503 ? "Service temporarily unavailable" : "Internal server error";
  const canExposeMessage = !production || status < 500;

  return {
    status,
    payload: {
      success: false,
      message: canExposeMessage ? error?.message || fallbackMessage : fallbackMessage,
      ...(requestId ? { requestId } : {}),
      ...(!production && error?.stack ? { stack: error.stack } : {}),
    },
  };
};

module.exports = {
  buildPublicErrorPayload,
};

const SUPPORT_MIN_AMOUNT_INR = 5;
const SUPPORT_MAX_AMOUNT_INR = 100000;

const parseSupportAmountInr = (value) => {
  const amount = Number(value);
  if (
    !Number.isSafeInteger(amount) ||
    amount < SUPPORT_MIN_AMOUNT_INR ||
    amount > SUPPORT_MAX_AMOUNT_INR
  ) {
    const error = new Error(
      amount < SUPPORT_MIN_AMOUNT_INR
        ? `Minimum support amount is INR ${SUPPORT_MIN_AMOUNT_INR}.`
        : `Support amount must be between INR ${SUPPORT_MIN_AMOUNT_INR} and INR ${SUPPORT_MAX_AMOUNT_INR}`
    );
    error.status = 400;
    error.code = "INVALID_SUPPORT_AMOUNT";
    throw error;
  }
  return amount;
};

module.exports = {
  SUPPORT_MAX_AMOUNT_INR,
  SUPPORT_MIN_AMOUNT_INR,
  parseSupportAmountInr,
};

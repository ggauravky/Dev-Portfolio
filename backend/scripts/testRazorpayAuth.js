const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const {
  getGatewayDiagnostics,
  testGatewayAuthentication,
} = require("../services/payment/razorpayGateway");

const normalize = (value, maxLength = 160) =>
  String(value || "").trim().slice(0, maxLength);

const readProviderError = (error) => {
  const providerError = error?.error || error?.response?.data?.error || {};
  return {
    status: Number(error?.statusCode || error?.response?.status || error?.status) || 0,
    message: normalize(providerError.description || providerError.reason || error?.message || "Request failed"),
  };
};

const run = async () => {
  const diagnostics = getGatewayDiagnostics();

  console.log("Razorpay configuration:");
  console.log(`Mode: ${diagnostics.keyMode.toUpperCase()}`);
  console.log(`Key configured: ${diagnostics.keyConfigured ? "yes" : "no"}`);
  console.log(`Secret configured: ${diagnostics.secretConfigured ? "yes" : "no"}`);

  try {
    await testGatewayAuthentication();
    console.log("Razorpay authentication: PASS");
  } catch (error) {
    const provider = readProviderError(error);
    console.log("Razorpay authentication: FAIL");
    if (provider.status) console.log(`HTTP status: ${provider.status}`);
    console.log(`Provider message: ${provider.message}`);
    process.exitCode = 1;
  }
};

void run();

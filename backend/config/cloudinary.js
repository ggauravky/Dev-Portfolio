// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const cloudinary = require("cloudinary").v2;

const getCloudinaryConfig = () => ({
  cloudName: String(process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
  apiKey: String(process.env.CLOUDINARY_API_KEY || "").trim(),
  apiSecret: String(process.env.CLOUDINARY_API_SECRET || "").trim(),
});

const isCloudinaryConfigured = () => Object.values(getCloudinaryConfig()).every(Boolean);

const configureCloudinary = () => {
  const config = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });
  return cloudinary;
};

configureCloudinary();

module.exports = {
  cloudinary,
  configureCloudinary,
  getCloudinaryConfig,
  isCloudinaryConfigured,
};

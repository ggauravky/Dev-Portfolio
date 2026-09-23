const multer = require("multer");

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const avatarFileFilter = (req, file, callback) => {
  if (!ALLOWED_AVATAR_MIME_TYPES.has(String(file?.mimetype || "").toLowerCase())) {
    const error = new Error("Choose a JPEG, PNG, or WebP image");
    error.code = "AVATAR_TYPE_INVALID";
    error.status = 400;
    callback(error);
    return;
  }

  callback(null, true);
};

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: MAX_AVATAR_BYTES,
    files: 1,
    fields: 0,
    parts: 1,
  },
}).single("avatar");

const handleAvatarUpload = (req, res, next) => {
  avatarUpload(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const isTooLarge = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE";
    const isUnexpectedField = error instanceof multer.MulterError && error.code === "LIMIT_UNEXPECTED_FILE";
    return res.status(400).json({
      success: false,
      code: isTooLarge ? "AVATAR_TOO_LARGE" : error.code || "AVATAR_UPLOAD_INVALID",
      message: isTooLarge
        ? "Profile image must be 5 MB or smaller"
        : isUnexpectedField
          ? 'Upload one image using the "avatar" field'
          : error.message || "Profile image could not be read",
    });
  });
};

module.exports = {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_BYTES,
  avatarFileFilter,
  handleAvatarUpload,
};

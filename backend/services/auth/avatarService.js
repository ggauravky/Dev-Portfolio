const { randomUUID } = require("node:crypto");
const cloudinary = require("../../config/cloudinary");

const DEFAULT_AVATAR_FOLDER = "dev-portfolio/user-avatars";

const getAvatarFolder = () =>
  String(process.env.CLOUDINARY_AVATAR_FOLDER || DEFAULT_AVATAR_FOLDER)
    .trim()
    .replace(/^\/+|\/+$/g, "") || DEFAULT_AVATAR_FOLDER;

const isCloudinaryConfigured = () =>
  ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].every((key) =>
    Boolean(String(process.env[key] || "").trim())
  );

const uploadAvatar = ({ buffer, userId, client = cloudinary }) => {
  if (!isCloudinaryConfigured()) {
    const error = new Error("Profile image uploads are not configured right now");
    error.code = "CLOUDINARY_NOT_CONFIGURED";
    error.status = 503;
    throw error;
  }

  const folder = `${getAvatarFolder()}/${String(userId)}`;
  const publicId = randomUUID();

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
        transformation: [{ width: 512, height: 512, crop: "fill", gravity: "auto" }],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.public_id || !result?.secure_url) {
          const invalidResultError = new Error("Image provider returned an invalid upload result");
          invalidResultError.code = "CLOUDINARY_UPLOAD_INVALID";
          reject(invalidResultError);
          return;
        }

        resolve({
          publicId: result.public_id,
          url: client.url(result.public_id, {
            secure: true,
            width: 512,
            height: 512,
            crop: "fill",
            gravity: "auto",
            quality: "auto",
            fetch_format: "auto",
          }),
        });
      }
    );

    stream.end(buffer);
  });
};

const deleteAvatar = async (publicId, { client = cloudinary } = {}) => {
  const safePublicId = String(publicId || "").trim();
  if (!safePublicId || !isCloudinaryConfigured()) return { result: "not_found" };
  return client.uploader.destroy(safePublicId, { resource_type: "image", invalidate: true });
};

module.exports = {
  DEFAULT_AVATAR_FOLDER,
  deleteAvatar,
  getAvatarFolder,
  isCloudinaryConfigured,
  uploadAvatar,
};

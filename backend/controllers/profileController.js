const User = require("../models/User");
const { logger } = require("../utils/logger");
const { deleteAvatar, uploadAvatar } = require("../services/auth/avatarService");
const { PROFILE_SELECT, serializeUser } = require("../services/auth/userProfileService");

const defaultDependencies = {
  deleteAvatar,
  uploadAvatar,
};

let profileDependencies = { ...defaultDependencies };

const findProfile = (userId) => User.findById(userId).select(PROFILE_SELECT);

exports.uploadProfileAvatar = async (req, res) => {
  if (!req.authUser?.id) {
    return res.status(401).json({ success: false, message: "Please sign in first" });
  }
  if (!req.file?.buffer?.length) {
    return res.status(400).json({ success: false, message: "Choose an image to upload" });
  }

  const currentUser = await findProfile(req.authUser.id);
  if (!currentUser) {
    return res.status(404).json({ success: false, message: "User profile not found" });
  }

  let uploaded;
  try {
    uploaded = await profileDependencies.uploadAvatar({
      buffer: req.file.buffer,
      userId: currentUser._id,
    });
  } catch (error) {
    (req.log || logger).warn(
      { category: error?.code || error?.name || "AVATAR_UPLOAD_FAILED", userId: req.authUser.id },
      "Profile avatar upload failed"
    );
    return res.status(error?.status || 502).json({
      success: false,
      message: error?.status === 503
        ? error.message
        : "Profile image could not be uploaded. Please try again.",
    });
  }

  const oldPublicId = String(currentUser.avatarPublicId || "").trim();
  const updatedUser = await User.findByIdAndUpdate(
    currentUser._id,
    { $set: { avatarUrl: uploaded.url, avatarPublicId: uploaded.publicId } },
    { new: true, runValidators: true, fields: PROFILE_SELECT }
  );

  if (!updatedUser) {
    await profileDependencies.deleteAvatar(uploaded.publicId).catch(() => undefined);
    return res.status(404).json({ success: false, message: "User profile not found" });
  }

  if (oldPublicId && oldPublicId !== uploaded.publicId) {
    await profileDependencies.deleteAvatar(oldPublicId).catch((error) => {
      (req.log || logger).warn(
        { category: error?.code || error?.name || "AVATAR_CLEANUP_FAILED", userId: req.authUser.id },
        "Old profile avatar cleanup failed"
      );
    });
  }

  return res.status(200).json({
    success: true,
    message: "Profile image updated",
    data: { user: serializeUser(updatedUser) },
  });
};

exports.deleteProfileAvatar = async (req, res) => {
  if (!req.authUser?.id) {
    return res.status(401).json({ success: false, message: "Please sign in first" });
  }

  const currentUser = await findProfile(req.authUser.id);
  if (!currentUser) {
    return res.status(404).json({ success: false, message: "User profile not found" });
  }

  const oldPublicId = String(currentUser.avatarPublicId || "").trim();
  currentUser.avatarUrl = "";
  currentUser.avatarPublicId = "";
  await currentUser.save();

  if (oldPublicId) {
    await profileDependencies.deleteAvatar(oldPublicId).catch((error) => {
      (req.log || logger).warn(
        { category: error?.code || error?.name || "AVATAR_DELETE_FAILED", userId: req.authUser.id },
        "Profile avatar provider cleanup failed"
      );
    });
  }

  return res.status(200).json({
    success: true,
    message: "Custom profile image removed",
    data: { user: serializeUser(currentUser) },
  });
};

exports._test = {
  resetDependencies() {
    profileDependencies = { ...defaultDependencies };
  },
  setDependencies(overrides) {
    profileDependencies = { ...profileDependencies, ...overrides };
  },
};

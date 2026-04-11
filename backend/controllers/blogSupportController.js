// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const BlogPost = require("../models/BlogPost");
const Support = require("../models/Support");
const { logger } = require("../utils/logger");

const normalizeSlug = (value) => String(value || "").trim().toLowerCase();
const normalizeTitle = (value) => String(value || "").trim().slice(0, 220);
const normalizeContent = (value) => String(value || "").trim().slice(0, 120000);

const buildFallbackTitle = (slug) =>
  String(slug || "blog-post")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Blog Post";

const toPublicSupportData = (supportCount, supported) => ({
  supported: Boolean(supported),
  totalSupporters: Number.isFinite(Number(supportCount)) ? Number(supportCount) : 0,
});

const ensureBlogPostExists = async ({ slug, title, content }) => {
  const normalizedSlug = normalizeSlug(slug);
  const normalizedTitle = normalizeTitle(title) || buildFallbackTitle(normalizedSlug);
  const normalizedContent = normalizeContent(content);

  let blogPost = await BlogPost.findOne({ slug: normalizedSlug });

  if (!blogPost) {
    blogPost = await BlogPost.create({
      slug: normalizedSlug,
      title: normalizedTitle,
      content: normalizedContent,
    });
    return blogPost;
  }

  const shouldUpdateTitle = normalizedTitle && normalizedTitle !== blogPost.title;
  const shouldUpdateContent = normalizedContent && normalizedContent !== blogPost.content;

  if (shouldUpdateTitle || shouldUpdateContent) {
    if (shouldUpdateTitle) {
      blogPost.title = normalizedTitle;
    }
    if (shouldUpdateContent) {
      blogPost.content = normalizedContent;
    }
    await blogPost.save();
  }

  return blogPost;
};

const parseSlugs = (rawSlugs) => {
  return String(rawSlugs || "")
    .split(",")
    .map((value) => normalizeSlug(value))
    .filter((value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
    .slice(0, 100);
};

exports.getSupportStatus = async (req, res) => {
  const slug = normalizeSlug(req.query.slug);

  const blogPost = await BlogPost.findOne({ slug }).select("_id supportCount");
  if (!blogPost) {
    return res.status(200).json({
      success: true,
      message: "Support status fetched",
      data: toPublicSupportData(0, false),
    });
  }

  let supported = false;

  if (req.authUser?.id) {
    supported = Boolean(
      await Support.exists({
        userId: req.authUser.id,
        blogPostId: blogPost._id,
      })
    );
  }

  return res.status(200).json({
    success: true,
    message: "Support status fetched",
    data: toPublicSupportData(blogPost.supportCount, supported),
  });
};

exports.getSupportCounts = async (req, res) => {
  const slugs = parseSlugs(req.query.slugs);

  if (slugs.length === 0) {
    return res.status(200).json({
      success: true,
      message: "Support counts fetched",
      data: {
        counts: {},
      },
    });
  }

  const posts = await BlogPost.find({ slug: { $in: slugs } }).select("slug supportCount");
  const counts = Object.fromEntries(slugs.map((slug) => [slug, 0]));

  posts.forEach((post) => {
    counts[post.slug] = Number(post.supportCount) || 0;
  });

  return res.status(200).json({
    success: true,
    message: "Support counts fetched",
    data: {
      counts,
    },
  });
};

exports.supportBlogPost = async (req, res) => {
  const reqLogger = req.log || logger;

  try {
    const { slug, title, content } = req.body;
    const blogPost = await ensureBlogPostExists({ slug, title, content });

    let alreadySupported = false;

    try {
      const supportResult = await Support.updateOne(
        {
          userId: req.authUser.id,
          blogPostId: blogPost._id,
        },
        {
          $setOnInsert: {
            userId: req.authUser.id,
            blogPostId: blogPost._id,
          },
        },
        {
          upsert: true,
        }
      );

      alreadySupported = Number(supportResult.upsertedCount || 0) === 0;
    } catch (error) {
      if (Number(error?.code) === 11000) {
        alreadySupported = true;
      } else {
        throw error;
      }
    }

    if (!alreadySupported) {
      await BlogPost.updateOne(
        { _id: blogPost._id },
        {
          $inc: {
            supportCount: 1,
          },
        }
      );
    }

    const updatedPost = await BlogPost.findById(blogPost._id).select("supportCount");

    return res.status(200).json({
      success: true,
      message: alreadySupported ? "Already supported" : "Thanks for supporting",
      data: {
        alreadySupported,
        supported: true,
        totalSupporters: Number(updatedPost?.supportCount || 0),
      },
    });
  } catch (error) {
    reqLogger.error({ err: error }, "Blog support action failed");
    return res.status(500).json({
      success: false,
      message: "Unable to process support right now",
    });
  }
};

exports.getMySupports = async (req, res) => {
  try {
    const supports = await Support.find({ userId: req.authUser.id })
      .sort({ createdAt: -1 })
      .populate("blogPostId", "title slug supportCount")
      .lean();

    const items = supports
      .filter((record) => record.blogPostId)
      .map((record) => ({
        id: String(record._id),
        createdAt: record.createdAt,
        blog: {
          id: String(record.blogPostId._id),
          title: record.blogPostId.title,
          slug: record.blogPostId.slug,
          supportCount: Number(record.blogPostId.supportCount || 0),
        },
      }));

    return res.status(200).json({
      success: true,
      message: "Your supports fetched",
      data: {
        items,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch my supports");
    return res.status(500).json({
      success: false,
      message: "Unable to fetch your supports",
    });
  }
};

# Engineering Notes authoring guide

The public blog collection lives in `src/data/blogsData.js`. Historical posts live in `src/data/archivedBlogsData.js` and should not be moved back into the public collection merely to make an old URL resolve; `getBlogBySlug` already keeps those routes working.

## Add an article

Add one record to `blogsData` with a unique `id` and `slug`, a title, category, excerpt, repository-authored HTML `content`, cover metadata, tags, author, status, and featured flag.

Use one of the exported `BLOG_CATEGORIES` values:

- `SYSTEM_DESIGN`
- `ENGINEERING_DEEP_DIVES`
- `HOW_I_BUILT_IT`

Publication states are deliberate:

- `preview` is visible on the blog and may be featured, but is excluded from the sitemap, has no synthetic date or reading time, and is marked `noindex`.
- `published` is public, indexable, eligible for Latest writing and related articles, and may enter the sitemap.
- `archived` is assigned only by the archive resolver. Archived articles retain their direct URLs and historical support identity, but stay out of current discovery lists.

For a published article, use an ISO `publishedDate` such as `2026-10-12`, a human-readable `date` if the interface needs one, and an honest `readTime`. Leave all three `null` for an undated preview. Set `featured: true` only when the article should be eligible for the featured slot and Home teaser.

## Covers and diagrams

Place cover assets in `public/images/blogs/` and reference them with an absolute public path such as `/images/blogs/example.svg`. Provide a descriptive `imageAlt`. SVG diagrams should include a `viewBox`, `<title>`, and `<desc>` so they resize cleanly and remain understandable to assistive technology.

Article HTML supports responsive `img`, `svg`, `figure`, and `figcaption` elements. Keep diagrams free of fixed page widths; the reader constrains them to the text column automatically.

## Long-form content

Content is trusted, repository-owned HTML. The reader supports:

- `h2` and `h3` headings, which receive stable anchors and create a desktop table of contents when at least three are present
- paragraphs, ordered and unordered lists, links, horizontal rules, and blockquotes
- inline `code` and `pre > code` blocks; code blocks receive a copy control at runtime
- wide tables, which scroll inside their own container instead of widening the page
- responsive figures, diagrams, images, and captions

Escape HTML characters inside code examples. Do not insert unsanitized user-provided HTML into article content.

## Series and discovery

The optional `series` field can group future multi-part articles; use `null` when no series exists. Public selectors control the blog index, Home teaser, command palette, related articles, and sitemap, so new discovery surfaces should use those selectors instead of importing the archive directly.

Before publishing, run:

```sh
npm run test:blog
npm run build
git diff --check
```

Then inspect the blog index, the article at desktop and mobile widths, category filtering, the table of contents, code copying, tables, diagrams, and document-level horizontal overflow.

# Engineering Notes Blog Redesign

## Intent

Redesign `/blog` and `/blog/:slug` as a calm, premium engineering publication while preserving the existing portfolio shell, all seven historical articles, their routes, and support history. The public editorial collection initially contains only one deliberately labeled Uber system-design preview.

## Information architecture

The blog homepage contains a left-aligned editorial hero, public-content search, four text-first category tabs, a category-aware featured preview, three topic descriptions, a published-article list that is omitted when empty, and the existing newsletter form in a restrained presentation. Archived content never appears in public listings.

The article page contains breadcrumbs, category/status metadata, title, excerpt, author, cover image, a narrow long-form reading column, an optional desktop table of contents for articles with at least three headings, share/copy actions, a compact author footer, related published articles when available, and a return link. The Uber preview has no fake date, read time, TOC, related posts, or support solicitation.

## Visual system

Blog-scoped tokens use `#090909`, `#111111`, `#151515`, `#262626`, `#F5F5F5`, `#A1A1AA`, `#71717A`, and `#C5F82A`. Lime is limited to focus, selection, links, and reading progress. Existing Plus Jakarta Sans and Space Mono assets are reused to avoid another font dependency and global changes. Layouts use restrained borders, generous spacing, and minimal motion with reduced-motion support.

## Content architecture

`src/data/blogsData.js` owns the active public collection, publishing states, categories, and selectors. `src/data/archivedBlogsData.js` preserves the seven existing records verbatim. `getBlogBySlug` resolves active or archived content so old URLs keep working. Public, published, featured, category, and related selectors never leak archived content into active discovery.

The new Uber record uses slug `uber-system-design`, status `preview`, the supplied excerpt and two-sentence content, and `/images/blogs/uber-system-design.svg`. It has no publication date or fabricated reading time.

## Reader architecture

Trusted repository-authored HTML remains the compatibility format. A reusable article-content component renders it, assigns stable IDs to real headings, derives a TOC, and progressively adds code-copy controls. Blog-scoped CSS supports paragraphs, headings, lists, tables, blockquotes, responsive figures, captions, inline code, and horizontally scrollable code blocks. Archived content is not rewritten.

## Integrations

The Home blog teaser consumes public featured content and adapts to one preview without empty grid columns. Command Palette searches public content only and labels preview records honestly. Sitemap generation includes only `published` articles. SEO marks previews `noindex` and avoids synthetic article dates; archived pages keep their existing index behavior unless explicitly changed. Newsletter and blog-support service behavior remain unchanged, with support hidden only for the new incomplete preview.

## Performance, accessibility, and responsive behavior

No new runtime dependency is required. Above-the-fold covers load eagerly; below-fold imagery keeps the existing lazy-image system. Interactions use semantic elements, 44px targets, visible focus states, keyboard-operable tabs, responsive single-column mobile layouts, and contained overflow for code/tables only. The page must remain free of horizontal document overflow from 320px upward.

## Verification

Automated selector tests cover publishing states, archived lookup, category filtering, and related-post exclusion. Production build and `git diff --check` are mandatory. Browser QA covers `/blog`, the Uber preview, an archived URL, search/filter empty states, newsletter UI, copy link, TOC hiding, responsive widths, console output, image loading, and horizontal overflow.

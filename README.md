# Gaurav Kumar Yadav - Developer Portfolio

Production portfolio for Gaurav Kumar Yadav, focused on Python, AI/ML, and full-stack development.

## Live URLs

- Portfolio: [https://ggauravky.vercel.app](https://ggauravky.vercel.app)
- Admin Panel: [https://ggauravkyadmin.vercel.app](https://ggauravkyadmin.vercel.app)
- Backend API: [https://dev-portfolio-ojfs.onrender.com](https://dev-portfolio-ojfs.onrender.com)

## Stack

Frontend:

- React 18 + Vite
- Tailwind CSS
- Framer Motion
- React Router

Backend:

- Node.js + Express
- MongoDB + Mongoose
- Gemini API integration
- Security middleware (Helmet, rate-limit, mongo-sanitize, validators)

Observability:

- pino structured logs
- Request IDs on every request
- Optional Sentry error monitoring

## Architecture

Monorepo layout:

- src/: React app (pages, components, hooks, utilities)
- backend/: Express API and Mongo models
- api/: Vercel serverless handlers
- shared/: shared chatbot core + privacy utilities
- public/: static assets, robots, sitemap
- scripts/: build-time utilities (sitemap, data sync, image variants)

Chatbot logic is centralized in shared modules and reused by backend and serverless entrypoints.

## Features

- Multi-page portfolio (home/about/skills/projects/blog/contact/links)
- AI chatbot with fallback logic and chat analytics
- Contact + newsletter APIs
- Project and blog detail pages with SEO metadata
- Responsive image pipeline with AVIF/WebP variants + srcset
- Build-time sitemap generation for static + blog + project routes

## Local Development

Prerequisites:

- Node.js 18+
- npm 9+
- MongoDB Atlas connection string

Install:

```bash
npm install
cd backend
npm install
cd ..
```

Run frontend:

```bash
npm run dev
```

Run backend:

```bash
cd backend
npm run dev
```

## Environment Variables

Root .env:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_web_client_id.apps.googleusercontent.com
```

Backend .env:

```env
MONGODB_URI=your_mongodb_connection_string
# Optional direct URI fallback for migration scripts when SRV DNS is blocked
MONGODB_URI_DIRECT=
PORT=5000
PORT_RETRIES=10
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Chatbot
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash

# Chat analytics privacy
CHATLOG_RETENTION_DAYS=60
CHAT_HASH_SALT=replace_with_strong_random_secret

# Admin/API security
ADMIN_KEY=replace_with_secure_admin_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
CHAT_RATE_LIMIT_MAX=30

# Transactional emails via Brevo (auth, newsletter, bookings, support)
BREVO_ENABLED=true
BREVO_API_KEY=xkeysib_your_brevo_api_key
BREVO_SENDER_EMAIL=hello@your-verified-domain.com
BREVO_SENDER_NAME=Gaurav Kumar
BREVO_REPLY_TO_EMAIL=support@your-verified-domain.com
BREVO_ADMIN_NOTIFICATION_EMAIL=admin@your-verified-domain.com
EMAIL_APP_NAME=Gaurav Kumar Portfolio
EMAIL_SUPPORT_URL=https://your-app-name.vercel.app/contact
EMAIL_SERVICES_URL=https://your-app-name.vercel.app/services
EMAIL_BLOG_URL=https://your-app-name.vercel.app/blog

# Observability (optional)
LOG_LEVEL=debug
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1
```

## Legacy User Link Backfill

Backfills legacy records so bookings/support payments are linked to userId by email.

Dry run:

```bash
cd backend
npm run migrate:backfill-user-links:dry
```

Run migration:

```bash
cd backend
npm run migrate:backfill-user-links
```

Show migration help/options:

```bash
cd backend
npm run migrate:backfill-user-links:help
```

If your network blocks DNS SRV lookups (for mongodb+srv URIs), run using a direct mongodb:// URI:

```bash
cd backend
npm run migrate:backfill-user-links:dry -- --mongo-uri "mongodb://host1:27017,host2:27017,host3:27017/db_name?replicaSet=yourReplicaSet&tls=true&authSource=admin"
```

## Build and Production

Build command:

```bash
npm run build
```

Build pipeline includes:

1. Sync chat data
2. Generate responsive image variants
3. Generate sitemap
4. Vite production build

Preview build:

```bash
npm run preview
```

## Deployment Flow

Frontend (Vercel):

1. Import repository in Vercel
2. Set root env vars (VITE_API_URL, VITE_GOOGLE_CLIENT_ID)
3. Deploy from main branch

Backend (Render):

1. Create Web Service from backend directory
2. Build command: npm install
3. Start command: node server.js
4. Add backend env vars from section above

## API Endpoints (Core)

- GET /health
- POST /api/contact
- POST /api/newsletter/subscribe
- POST /api/newsletter/unsubscribe
- POST /api/chat
- GET /api/chat/privacy-policy

## SEO and Indexing

- robots.txt: [public/robots.txt](public/robots.txt)
- sitemap.xml: generated into [public/sitemap.xml](public/sitemap.xml)
- canonical, Open Graph, Twitter, and JSON-LD: managed via [src/hooks/useSEO.jsx](src/hooks/useSEO.jsx)

## Image Performance Strategy

- Source images: public/images/projects and public/images/blogs
- Generated variants: 480, 768, 1200 widths
- Formats: AVIF, WebP, and fallback originals
- Runtime delivery: LazyImage component with picture + srcset + sizes

Generate variants manually:

```bash
npm run generate:image-variants
```

## Security Notes

- Proprietary project (not open source for reuse)
- Chat analytics store hashed network identifiers, not raw IP/user-agent
- MongoDB TTL automatically expires chat logs (30 to 90 day window)

See:

- [backend/PRIVACY_RETENTION.md](backend/PRIVACY_RETENTION.md)
- [LICENSE](LICENSE)

## License

Copyright (c) 2026 Gaurav Kumar Yadav.
All rights reserved.

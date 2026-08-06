# Deployment Guide & Production Playbook

This playbook covers local environment setup, frontend deployment on **Vercel**, and backend deployment on **Render / Vercel**.

---

## 1. Local Development Setup

### Prerequisites
- **Node.js**: $\ge 20.0.0$
- **npm**: $\ge 10.0.0$

### Environment Configuration
Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dev-portfolio
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
FRONTEND_URL=http://localhost:5173
```

### Installation & Launch
```bash
# Terminal 1 — Frontend
npm install
npm run dev

# Terminal 2 — Backend
cd backend
npm install
npm run dev
```

---

## 2. Vercel Deployment (Frontend)

1. Connect your GitHub repository to Vercel.
2. Select **Vite** preset framework.
3. Configure Environment Variables:
   - `VITE_API_URL`: Backend Production API URL.
4. Deployment Output: Built to `dist/` automatically.

---

## 3. Production Build Verification

Verify that production build and image variants generate cleanly before deploying:

```bash
npm run build
```

# Deployment Guide & Production Playbook

This playbook covers local environment setup, frontend deployment on **Vercel**, and backend deployment on **Render**.

---

## 1. Local Development Setup

### Prerequisites
- **Node.js**: $\ge 20.0.0$
- **npm**: $\ge 10.0.0$

### Environment Configuration
Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dev-portfolio
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_oauth_web_client_id.apps.googleusercontent.com
AUTH_JWT_SECRET=replace_with_at_least_32_random_characters
AUTH_SESSION_TTL_SECONDS=604800
AUTH_WELCOME_BACK_COOLDOWN_HOURS=24
RAZORPAY_ENABLED=false
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_api_key_secret
RAZORPAY_WEBHOOK_SECRET=your_separate_webhook_secret
EMAIL_ENABLED=true
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_smtp_login
BREVO_SMTP_PASS=your_brevo_smtp_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=Gaurav Kumar Yadav
BREVO_REPLY_TO_EMAIL=
BREVO_REPLY_TO_NAME=
PAYMENT_EMAIL_NOTIFICATIONS_ENABLED=true
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
   - `VITE_API_URL`: Render backend origin, without a trailing `/api` path.
4. Deployment Output: Built to `dist/` automatically.

---

## 3. Production Build Verification

Verify that production build and image variants generate cleanly before deploying:

```bash
npm run build
```

---

## 4. Google Identity Services Setup

Create one OAuth 2.0 client with application type **Web application** in Google Cloud. Configure the consent-screen branding and keep only the default authentication scopes (`openid`, `email`, and `profile`). No Google API access, client secret, redirect URI, access token, or refresh token is required for this popup-button flow.

Add these exact **Authorized JavaScript origins**:

- `http://localhost:5173`
- `https://ggauravky.vercel.app`
- Any additional production custom origin that actually hosts the frontend

Set the same public web client ID as `GOOGLE_CLIENT_ID` on the Render backend. The frontend fetches it from `GET /api/auth/config`; do not create `VITE_GOOGLE_CLIENT_ID`.

For Render, set `FRONTEND_URL` to the exact Vercel production origin. Add preview/custom origins only as exact comma-separated values in `AUTH_ALLOWED_ORIGINS`; wildcard Vercel origins are intentionally rejected. The current Vercel-to-Render deployment is cross-site, so the production session cookie uses `SameSite=None; Secure`. If both applications later move under the same site, set `AUTH_COOKIE_SAME_SITE=lax`.

## 5. Razorpay Setup

1. Create API keys in Razorpay Dashboard and configure test keys first.
2. Enable automatic capture so fulfilment occurs only for captured payments.
3. Add `<BACKEND_URL>/api/payment/webhook/razorpay` as the webhook endpoint.
4. Select `payment.captured`, `payment.failed`, and `order.paid` events.
5. Set a webhook secret and store it as `RAZORPAY_WEBHOOK_SECRET`. It is different from `RAZORPAY_KEY_SECRET`.
6. Keep `RAZORPAY_ENABLED=false` until MongoDB, keys, webhook, and Brevo settings are verified; then change it to `true` and redeploy.

Test and live modes use the same code. Switching modes requires the matching Razorpay key ID, key secret, dashboard webhook, and webhook secret. Never place either secret in `VITE_*` variables.

## 6. Brevo SMTP Receipt Email Setup

Create a Brevo SMTP key and copy the SMTP Login from the Brevo SMTP settings. Set the login as `BREVO_SMTP_USER` and the SMTP key as `BREVO_SMTP_PASS`; do not use a Brevo API key or normal account password. Configure `BREVO_SENDER_EMAIL` with an individual sender address already verified in Brevo. A custom domain is not required.

The backend uses one reusable NodeMailer SMTP transporter. Port `587` uses `secure=false`. If Render blocks that port, try port `2525` with `secure=false`, or port `465` with `secure=true`, by changing only `BREVO_SMTP_PORT`. Receipt PDFs remain in memory and are attached directly as buffers.

Set `TEST_EMAIL_TO` locally and run `npm run test:email` inside `backend/` for one controlled delivery test. This command is not exposed as an HTTP endpoint.

## 7. Payment Verification

Run `npm test` inside `backend/`, then `npm run build` at the repository root. In Razorpay test mode, verify a successful payment, checkout dismissal, failed payment, duplicate verification, webhook retry, owned receipt download, activity history, and receipt email attachment before enabling live keys.

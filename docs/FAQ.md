# Frequently Asked Questions (FAQ)

### 1. What technologies power this portfolio?
The frontend is built using **React 18**, **Vite 5**, **Tailwind CSS 3.4**, and **Framer Motion 12**. The backend API is powered by **Express.js**, **MongoDB Atlas**, and **Mongoose**. Paid services use Razorpay Standard Checkout with server-controlled pricing and verification.

### 2. Does the portfolio store card or UPI credentials?
No. Card numbers, CVVs, UPI PINs, and bank credentials remain inside Razorpay Checkout. The backend stores only booking data and the Razorpay identifiers required for verification and receipts.

### 3. How are payment receipts protected?
The PDF receipt endpoint requires the signed-in owner of a paid transaction. Query-string email addresses are not accepted for receipt access.

### 4. How do I launch the Command Palette?
Press `⌘ + K` on macOS or `Ctrl + K` on Windows/Linux, or click the **Search ⌘K** button in the header navigation bar.

### 5. How does responsive image variant generation work?
Building the project via `npm run build` runs `scripts/generate-image-variants.js` using `sharp`. This generates 402 optimized AVIF and WebP images across 9 resolution widths for crisp rendering on high-DPI displays.

### 6. Is the project open-source?
Yes, the codebase is licensed under the [MIT License](../LICENSE). You are free to fork, customize, and build upon it.

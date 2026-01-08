<div align="center">

# 🚀 Gaurav Kumar Yadav - Developer Portfolio

### Python Developer | AI & Data Science | Full Stack Web Development

**Student Developer from Lucknow, India 🇮🇳 | Open for Internships & Freelance Projects**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-success?style=for-the-badge)](https://ggauravky.vercel.app)
[![Backend API](https://img.shields.io/badge/⚡_Backend-Online-blue?style=for-the-badge)](https://dev-portfolio-ojfs.onrender.com)
[![Stars](https://img.shields.io/github/stars/ggauravky/Dev-Portfolio?style=for-the-badge&logo=github)](https://github.com/ggauravky/Dev-Portfolio)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react" alt="React"/>
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js" alt="Node.js"/>
<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" alt="MongoDB"/>
<img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite" alt="Vite"/>

### 🔗 [View Live Portfolio →](https://ggauravky.vercel.app/)

</div>

---

## ✨ Key Features

<table>
  <tr>
    <td>🎨 <b>Modern UI/UX</b></td>
    <td>Beautiful gradient designs with smooth animations</td>
  </tr>
  <tr>
    <td>📱 <b>Fully Responsive</b></td>
    <td>Perfect experience on mobile, tablet, and desktop</td>
  </tr>
  <tr>
    <td>⚡ <b>Lightning Fast</b></td>
    <td>Optimized with Vite for instant loading</td>
  </tr>
  <tr>
    <td>📬 <b>Contact System</b></td>
    <td>Working contact form with MongoDB storage</td>
  </tr>
  <tr>
    <td>🔍 <b>SEO Ready</b></td>
    <td>Optimized for Google and all search engines</td>
  </tr>
  <tr>
    <td>🌙 <b>Dark Theme</b></td>
    <td>Eye-friendly dark mode design</td>
  </tr>
  <tr>
    <td>🔒 <b>Secure</b></td>
    <td>Input validation, rate limiting, and security headers</td>
  </tr>
  <tr>
    <td>🎯 <b>Dynamic Pages</b></td>
    <td>Home, About, Skills, Projects, Contact, Links</td>
  </tr>
</table>

## 🛠️ Built With

<div align="center">

<table>
<tr>
<td align="center" width="50%">

### 🎨 Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</td>
<td align="center" width="50%">

### ⚙️ Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)

</td>
</tr>
<tr>
<td align="center" width="50%">

### 🔒 Security

![Helmet](https://img.shields.io/badge/Helmet-000000?style=for-the-badge)
![CORS](https://img.shields.io/badge/CORS-000000?style=for-the-badge)
![Validator](https://img.shields.io/badge/Express_Validator-000000?style=for-the-badge)
![Rate Limit](https://img.shields.io/badge/Rate_Limiter-000000?style=for-the-badge)

</td>
<td align="center" width="50%">

### 🚀 Deployment

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

</td>
</tr>
</table>

</div>

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
MongoDB database
Git
```

### Installation

1️⃣ **Clone the repository**

```bash
git clone https://github.com/ggauravky/Dev-Portfolio.git
cd Dev-Portfolio
```

2️⃣ **Install frontend dependencies**

```bash
npm install
```

3️⃣ **Install backend dependencies**

```bash
cd backend
npm install
cd ..
```

4️⃣ **Setup environment variables**

Create `.env` in root:

```env
VITE_API_URL=http://localhost:5000
```

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5️⃣ **Run the project**

```bash
# Start backend (from backend folder)
cd backend
npm start

# Start frontend (from root folder)
npm run dev
```

🎉 Open [http://localhost:5173](http://localhost:5173) in your browser!

## 📁 Project Structure

```
Dev-Portfolio/
│
├── 📂 src/                      # Frontend source code
│   ├── 📂 components/           # Reusable components
│   │   ├── Navbar.jsx          # Navigation bar
│   │   └── Navbar.css          # Navbar styles
│   ├── 📂 pages/               # Page components
│   │   ├── Home.jsx            # Home page
│   │   ├── About.jsx           # About page
│   │   ├── Skills.jsx          # Skills showcase
│   │   ├── Projects.jsx        # Projects portfolio
│   │   ├── Contact.jsx         # Contact form
│   │   └── Links.jsx           # Social links
│   ├── 📂 hooks/               # Custom React hooks
│   │   └── useSEO.jsx          # SEO optimization
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
│
├── 📂 backend/                  # Backend source code
│   ├── 📂 controllers/          # Request handlers
│   │   └── contactController.js
│   ├── 📂 models/              # Database schemas
│   │   └── Contact.js
│   ├── 📂 routes/              # API routes
│   │   └── contactRoutes.js
│   ├── 📂 middleware/          # Custom middleware
│   │   ├── validator.js        # Input validation
│   │   └── rateLimiter.js      # Rate limiting
│   ├── 📂 config/              # Configuration
│   │   └── database.js         # MongoDB setup
│   └── server.js               # Express server
│
├── 📂 public/                   # Static assets
│   ├── 📂 images/              # Images
│   ├── robots.txt              # SEO crawlers
│   └── sitemap.xml             # Site structure
│
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind setup
└── vercel.json                 # Vercel config
```

## 🌐 Deployment Guide

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or push to GitHub and import in Vercel dashboard
```

**Environment Variables on Vercel:**

- `VITE_API_URL` → Your backend URL (without trailing slash)

### Deploy Backend to Render

1. Create new Web Service
2. Connect your GitHub repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables:
   - `MONGODB_URI`
   - `FRONTEND_URL`
   - `PORT`
   - `NODE_ENV=production`

## 📄 API Documentation

### Endpoints

| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| GET    | `/health`      | Check server status |
| POST   | `/api/contact` | Submit contact form |

### POST /api/contact

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Hello",
  "message": "Your message here"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully!",
  "contactId": "507f1f77bcf86cd799439011"
}
```

## 🔒 Security Features

- ✅ Input validation with express-validator
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ MongoDB injection prevention
- ✅ XSS protection with Helmet
- ✅ CORS configuration
- ✅ Secure HTTP headers
- ✅ Data sanitization

## 📈 Performance Metrics

| Metric                    | Score  |
| ------------------------- | ------ |
| 🚀 Performance            | 95+    |
| ♿ Accessibility          | 100    |
| 💡 Best Practices         | 100    |
| 🔍 SEO                    | 100    |
| ⚡ First Contentful Paint | < 1.5s |
| 🎯 Time to Interactive    | < 3s   |

## 🎨 Color Palette

```css
Background:   #0f172a  /* Slate 900 */
Text:         #e2e8f0  /* Slate 200 */
Primary:      #3b82f6  /* Blue 500 */
Secondary:    #8b5cf6  /* Purple 500 */
Accent:       #06b6d4  /* Cyan 500 */
```

## 🤝 Contributing

Contributions make the open source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Author

<div align="center">

### Gaurav Kumar Yadav

**Full Stack Developer | BCA Student | AI Enthusiast**

[![Portfolio](https://img.shields.io/badge/Portfolio-ggauravky.vercel.app-blue?style=for-the-badge&logo=vercel)](https://ggauravky.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-ggauravky-181717?style=for-the-badge&logo=github)](https://github.com/ggauravky)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Gaurav-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/ggauravky)

</div>

## 📞 Contact

Have questions? Reach out through the [contact form](https://ggauravky.vercel.app/contact) or email directly.

## 🌟 Show Your Support

If this project helped you, give it a ⭐️!

<div align="center">

### Made with ❤️ and ☕ by Gaurav Kumar Yadav

**[⬆ Back to Top](#-developer-portfolio)**

</div>

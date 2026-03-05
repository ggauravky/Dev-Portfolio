<div align="center">

# 🤝 Contributing to Dev-Portfolio

<img src="https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=for-the-badge&logo=github&logoColor=white" alt="Contributions Welcome"/>
<img src="https://img.shields.io/badge/Code_of_Conduct-Enforced-blueviolet?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="Code of Conduct"/>
<img src="https://img.shields.io/badge/License-All_Rights_Reserved-red?style=for-the-badge&logo=lock&logoColor=white" alt="License"/>

**Thank you for considering contributing!** 🎉  
Bug reports, suggestions, and improvements are always appreciated.

</div>

---

## 📋 Table of Contents

- [⚠️ Important — License Notice](#️-important--license-notice)
- [🐛 Reporting Bugs](#-reporting-bugs)
- [💡 Suggesting Features](#-suggesting-features)
- [🔧 Submitting a Pull Request](#-submitting-a-pull-request)
- [🛠️ Development Setup](#️-development-setup)
- [📐 Code Style Guide](#-code-style-guide)
- [💬 Communication](#-communication)

---

## ⚠️ Important — License Notice

> This repository is **proprietary** — source code is shared for **educational reference only**.
>
> By contributing (opening an issue, commenting, or submitting a pull request), you agree that:
> - Any contribution you submit may be incorporated into the project at the maintainer's discretion
> - You **do not acquire** any ownership, license, or rights to the codebase
> - Your contribution is made under the same [proprietary license](LICENSE) as the rest of the project

Forks are permitted **only** for the purpose of submitting a pull request back to this repository.

---

## 🐛 Reporting Bugs

Found something broken? Please help by filing a detailed bug report.

### Before You Report
- 🔍 Search [existing issues](https://github.com/ggauravky/Dev-Portfolio/issues) to avoid duplicates
- 🌐 Try reproducting on [the live site](https://ggauravky.vercel.app) first
- 🔄 Check if the issue persists after a hard refresh (`Ctrl + Shift + R`)

### How to Report
Use the **[🐛 Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)** and include:

| Field | What to provide |
| ----- | --------------- |
| **Title** | Short, specific summary (e.g. `Blog page blank on Firefox 124`) |
| **Steps to reproduce** | Exact numbered steps |
| **Expected behavior** | What should happen |
| **Actual behavior** | What actually happens |
| **Environment** | Browser, OS, screen size |
| **Screenshots** | Attach if visual |
| **Console errors** | Open DevTools → Console → paste any errors |

---

## 💡 Suggesting Features

Have an idea for an improvement? We'd love to hear it!

Use the **[✨ Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)** and describe:
- What problem does your idea solve?
- What should the feature look like?
- Any alternatives you've considered?

> Note: Feature requests may be closed if they conflict with the project's design direction or are out of scope.

---

## 🔧 Submitting a Pull Request

Pull requests are welcome for **bug fixes**, **typo corrections**, and **performance improvements**.

### PR Checklist
Before submitting, verify:

- [ ] The change is focused — one fix per PR
- [ ] Existing behavior is not broken
- [ ] Code follows the [style guide](#-code-style-guide) below
- [ ] The PR description clearly explains the problem and solution
- [ ] Screenshots are attached if the change is visual

### PR Process

```
1. Fork → 2. Branch → 3. Change → 4. Test → 5. PR
```

1. **Fork** this repository
2. **Create a branch** with a descriptive name:
   ```bash
   git checkout -b fix/navbar-mobile-overflow
   git checkout -b perf/lazy-load-blog-images
   ```
3. **Make your change** — keep it minimal and focused
4. **Test locally** — run `npm run dev` and verify your fix
5. **Submit a PR** using the [pull request template](.github/PULL_REQUEST_TEMPLATE.md)

---

## 🛠️ Development Setup

### Prerequisites

| Tool | Version |
| ---- | ------- |
| Node.js | 18+ |
| npm | 9+ |
| Git | Any recent version |

### Local Development

```bash
# 1. Clone your fork
git clone https://github.com/<YOUR_USERNAME>/Dev-Portfolio.git
cd Dev-Portfolio

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Setup environment variables
cp .env.example .env          # edit with your values
cp backend/.env.example backend/.env  # edit with your values

# 5. Start development server
npm run dev          # frontend → http://localhost:5173
cd backend && npm start  # backend  → http://localhost:5000
```

### Available Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 📐 Code Style Guide

This project follows consistent conventions — please match the existing style:

### JavaScript / JSX
```js
// ✅ Functional components only
function MyComponent({ title }) {
    const [count, setCount] = useState(0)
    // ...
}

// ✅ Named exports for components
export function SkeletonCard() { ... }
export default function Blog() { ... }

// ✅ Single quotes, no semicolons
const name = 'Gaurav'

// ❌ Avoid class components
// ❌ Avoid default anonymous arrow function exports
```

### CSS / Tailwind
- Prefer **Tailwind utility classes** over custom CSS
- Use custom CSS only for animations and complex selectors
- Follow existing BEM-like naming for custom class names

### Commits
Use clear, descriptive commit messages:
```
fix: navbar not closing on mobile after navigation
feat: add skeleton loader to Skills page
perf: preload Blog chunk on app start
style: fix blog card image aspect ratio on iOS
```

---

## 💬 Communication

| Channel | Use for |
| ------- | ------- |
| 🐛 [GitHub Issues](https://github.com/ggauravky/Dev-Portfolio/issues) | Bug reports, feature requests |
| 🔄 [Pull Requests](https://github.com/ggauravky/Dev-Portfolio/pulls) | Code contributions |
| 📧 [kumar.gaurav.yadav2007@gmail.com](mailto:kumar.gaurav.yadav2007@gmail.com) | Security issues, private matters |
| 🌐 [Portfolio Contact Form](https://ggauravky.vercel.app/contact) | General questions |

---

## 🙏 Acknowledgements

Everyone who files a quality bug report or submits an accepted PR will be mentioned in the project's release notes.

---

<div align="center">

**Thank you for taking the time to contribute! ❤️**

[⬆ Back to Top](#-contributing-to-dev-portfolio)

**© 2026 Gaurav Kumar Yadav — All Rights Reserved**

</div>

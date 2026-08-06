# Contributing to Dev-Portfolio

Thank you for your interest in contributing to **Dev-Portfolio**! We welcome bug reports, documentation updates, design feedback, and pull requests.

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## How Can I Contribute?

### 1. Reporting Bugs
- Search existing [GitHub Issues](https://github.com/ggauravky/Dev-Portfolio/issues) to verify the bug has not already been reported.
- Open a new bug report using our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).
- Include clear steps to reproduce, expected behavior, device/browser details, and error logs.

### 2. Requesting Features
- Open a feature request using our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).
- Describe the problem your feature solves and why it would benefit the portfolio ecosystem.

### 3. Submitting Pull Requests
Follow this workflow when opening a Pull Request:

1. **Fork the Repository**: Create a personal fork on GitHub.
2. **Clone & Install**:
   ```bash
   git clone https://github.com/<your-username>/Dev-Portfolio.git
   cd Dev-Portfolio
   npm install
   ```
3. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/short-description
   # or for bug fixes:
   git checkout -b fix/short-description
   ```
4. **Code & Test**:
   - Ensure clean code formatting.
   - Verify local production build:
     ```bash
     npm run build
     ```
5. **Commit Conventions**:
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(ui): add new project card hover state`
   - `fix(navbar): resolve mobile drawer overflow`
   - `docs(readme): update deployment instructions`
6. **Push & Open PR**:
   Push to your fork and submit a Pull Request against `main`. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

---

## Code Style & Formatting

- **JavaScript / React**: Use functional components with standard ES6+ syntax.
- **Styling**: Prefer Tailwind CSS utility classes aligned with our Obsidian design tokens.
- **Accessibility**: Ensure interactive elements have accessible labels (`aria-label`) and visible focus states.

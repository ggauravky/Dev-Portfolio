<div align="center">

# 🔐 Security Policy

<img src="https://img.shields.io/badge/Security-Actively_Maintained-success?style=for-the-badge&logo=shield&logoColor=white" alt="Security Maintained"/>
<img src="https://img.shields.io/badge/Disclosure-Responsible-blue?style=for-the-badge&logo=lock&logoColor=white" alt="Responsible Disclosure"/>
<img src="https://img.shields.io/badge/Response_Time-48h-orange?style=for-the-badge&logo=clock&logoColor=white" alt="Response Time"/>

</div>

---

## 📋 Supported Versions

Only the latest version on the **`main`** branch receives security updates.

| Version / Branch | Supported          |
| ---------------- | :----------------: |
| `main` (latest)  | ✅ Actively patched |
| Older tags       | ❌ Not supported    |
| Forks            | ❌ Not supported    |

---

## 🚨 Reporting a Vulnerability

> **Please do NOT open a public GitHub Issue for security vulnerabilities.**  
> Public disclosure before a patch is ready puts all users at risk.

### Preferred: Email (Fastest Response)

Send a detailed report to:

**📧 [kumar.gaurav.yadav2007@gmail.com](mailto:kumar.gaurav.yadav2007@gmail.com)**

Use the subject line: `[SECURITY] <short description>`

### Alternative: Security.txt

Our machine-readable security contact is available at:
[`/.well-known/security.txt`](https://ggauravky.vercel.app/.well-known/security.txt)

---

## 📝 What to Include in Your Report

A good vulnerability report helps us fix the issue faster. Please include:

```
1. 📍 Affected URL / component / file
2. 🔍 Type of vulnerability (e.g., XSS, SSRF, injection, auth bypass, ...)
3. 📋 Step-by-step reproduction instructions
4. 💥 Potential impact / what an attacker could achieve
5. 🌐 Your environment (browser, OS, Node version if relevant)
6. 📸 Screenshots or a proof-of-concept (non-destructive only)
```

---

## ⏱️ Response Timeline

| Stage                        | Target time |
| ---------------------------- | ----------- |
| 📬 Initial acknowledgement   | ≤ 48 hours  |
| 🔍 Triage & severity rating  | ≤ 5 days    |
| 🛠️ Patch / mitigation        | ≤ 14 days   |
| 📢 Public disclosure (if any)| After patch |

---

## 🏆 Responsible Disclosure Hall of Fame

Researchers who report valid vulnerabilities and follow responsible disclosure will be credited here (with permission).

*No entries yet — be the first!*

---

## 🔒 Security Measures Already in Place

The portfolio implements the following defenses:

| Layer | Measure |
| ----- | ------- |
| 🌐 HTTP Headers | Helmet.js — strict CSP, HSTS, X-Frame-Options |
| 🚦 Rate Limiting | 100 req / 15 min per IP on all API endpoints |
| ✅ Input Validation | express-validator on every form endpoint |
| 🧹 Data Sanitization | MongoDB injection prevention via Mongoose |
| 🔐 CORS | Strict origin allowlist — no wildcard |
| 🛡️ XSS | `dangerouslySetInnerHTML` only on trusted, sanitized blog HTML |
| 🔏 Fingerprinting | Origin token `ggauravky-4f9e-orig-portfolio-2026` for clone detection |

---

## ❌ Out of Scope

The following are **not** considered security vulnerabilities for this project:

- Issues in forked or cloned copies of this repository
- Social engineering attacks targeting the author
- Self-XSS or attacks requiring physical access to a victim's device
- Denial-of-service via brute-force without a meaningful exploit path
- Bugs in third-party dependencies (please report those upstream)
- Missing security headers on static assets served by Vercel/Render (platform controlled)

---

## ⚖️ Legal

Authorized security research is welcome. Any testing must be:
- Limited to **your own** accounts / data
- **Non-destructive** — never delete, modify, or exfiltrate real user data
- Performed against the **live site** only if no sandbox data is affected

Unauthorized access, data exfiltration, or destructive testing will be reported to relevant authorities.

---

<div align="center">

**© 2026 Gaurav Kumar Yadav — All Rights Reserved**  
[Portfolio](https://ggauravky.vercel.app) · [GitHub](https://github.com/ggauravky) · [Report Issue](mailto:kumar.gaurav.yadav2007@gmail.com)

</div>

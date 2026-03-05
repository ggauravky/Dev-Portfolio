# DMCA Takedown Templates

Use these ready-made templates when you find an unauthorized clone.
Fill in the `[ ]` fields and send.

---

## Template A — GitHub DMCA Takedown

**File at:** https://github.com/contact/dmca  
**Or email:** copyright@github.com

```
Subject: DMCA Takedown Notice — Unauthorized copy of Dev-Portfolio

To the GitHub DMCA Agent,

I am the original author and sole copyright owner of the work described below.
I have a good faith belief that the repository listed below infringes my copyright.

─── ORIGINAL WORK ───────────────────────────────────────────────
Repository : https://github.com/ggauravky/Dev-Portfolio
Live site  : https://ggauravky.vercel.app
Owner      : Gaurav Kumar Yadav
Contact    : kumar.gaurav.yadav2007@gmail.com
License    : All Rights Reserved (see LICENSE file in repository)

Identifying fingerprints present in original:
  - HTML meta tag   : <meta name="origin-token" content="ggauravky-4f9e-orig-portfolio-2026" />
  - JSON fingerprint: "fingerprint": "ggauravky-4f9e-orig-portfolio-2026"
  - JS bundle banner: /*! © 2026 Gaurav Kumar Yadav — All Rights Reserved ... */
  - CSS custom prop : --_cp: 'ggauravky-2026-all-rights-reserved'

─── INFRINGING WORK ─────────────────────────────────────────────
Repository URL : [PASTE INFRINGING GITHUB REPO URL]
Specific files : [LIST FILES OR "all" if entire repo]
Deployed at    : [PASTE DEPLOYED URL IF KNOWN]

─── STATEMENT ────────────────────────────────────────────────────
I have a good faith belief that use of the copyrighted material described
above on the infringing pages is not authorized by the copyright owner,
its agent, or the law.

The information in this notice is accurate and, under penalty of perjury,
I am the owner, or an agent authorized to act on behalf of the owner, of
an exclusive right that is allegedly infringed.

I request that GitHub immediately remove or disable access to the infringing
repository/pages listed above.

Signed,
Gaurav Kumar Yadav
kumar.gaurav.yadav2007@gmail.com
Date: [TODAY'S DATE]
```

---

## Template B — Google DMCA (for indexed/deployed clones)

**File at:** https://www.google.com/webmasters/tools/dmca-notice  
**Or use:** Google Search Console → Legal Removals → DMCA

```
Subject: DMCA Content Removal — Unauthorized clone of ggauravky.vercel.app

Original work:
  URL   : https://ggauravky.vercel.app
  Owner : Gaurav Kumar Yadav (kumar.gaurav.yadav2007@gmail.com)
  Source: https://github.com/ggauravky/Dev-Portfolio

Infringing URL(s):
  [PASTE EACH INFRINGING URL ON A SEPARATE LINE]

Description of infringement:
  The above URL(s) host an unauthorized copy of my original developer
  portfolio created at https://ggauravky.vercel.app. The infringing
  site(s) reproduce substantial portions of my codebase, UI design,
  content, and personal data without permission.

  Identifying proof (fingerprints only I would have):
    - origin-token meta tag : ggauravky-4f9e-orig-portfolio-2026
    - JSON data fingerprint  : ggauravky-4f9e-orig-portfolio-2026

I have a good faith belief that the disputed use is not authorized by me,
my agent, or the law (17 U.S.C. § 512).

Under penalty of perjury, I am the copyright owner of the work described.

Gaurav Kumar Yadav
kumar.gaurav.yadav2007@gmail.com
Date: [TODAY'S DATE]
```

---

## Template C — Vercel / Netlify / Render hosting takedown

**Vercel abuse:** https://vercel.com/legal/privacy-policy (abuse section) or abuse@vercel.com  
**Netlify abuse:** https://www.netlify.com/abuse/  
**Render abuse:** https://render.com/abuse

```
Subject: Copyright Infringement — Unauthorized copy hosted on your platform

To the Trust & Safety / Abuse Team,

I am the original copyright owner of the portfolio at https://ggauravky.vercel.app.
An unauthorized copy of my work is hosted on your platform at:

  [PASTE INFRINGING URL]

This copy reproduces my source code and design without authorization.
My original repository with timestamps is at:
  https://github.com/ggauravky/Dev-Portfolio

Identifiable fingerprint in the infringing copy:
  <meta name="origin-token" content="ggauravky-4f9e-orig-portfolio-2026" />

Please remove or suspend the infringing deployment immediately.

Gaurav Kumar Yadav
kumar.gaurav.yadav2007@gmail.com
Date: [TODAY'S DATE]
```

---

## How to find clones (proactive search)

Run these searches periodically:

| Search engine | Query |
|---|---|
| Google | `"ggauravky-4f9e-orig-portfolio-2026"` |
| Google | `"Gaurav Kumar Yadav" site:github.com -site:github.com/ggauravky` |
| Google | `"ggauravky-2026-all-rights-reserved"` |
| GitHub | Search `ggauravky-4f9e-orig-portfolio-2026` in code search |
| Bing | `"ggauravky-4f9e-orig-portfolio-2026"` |

If a clone still has the fingerprints, it's trivially provable in a DMCA notice.
If they stripped the fingerprints, the obfuscated JS bundle structure still matches.

---

## Quick reference

| Fingerprint | Location |
|---|---|
| `ggauravky-4f9e-orig-portfolio-2026` | HTML meta, robots.txt, sitemap.xml, manifest.json, all gauravData.json |
| `/*! © 2026 Gaurav Kumar Yadav ...*/` | Every compiled JS chunk (27 files) |
| `--_cp: 'ggauravky-2026-all-rights-reserved'` | Compiled CSS bundle |
| `_copyright.honeypot` field | All gauravData.json copies |
| `<!-- Copyright ... Fingerprint: ggauravky-4f9e...` | favicon.svg |

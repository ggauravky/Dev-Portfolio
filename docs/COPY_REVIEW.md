# Copy review

Every copy change made during the redesign, page by page. Each one uses facts already in the repo. **⚠ confirm** means the owner should check the wording or the fact before it ships. All ⚠ rows were resolved by the owner on 2026-11-13: ✔ kept, ↩ reverted, ✎ edited.

## P3 — Home and colophon footer (2026-11-12)

| # | Where | Old | New | Source fact | ⚠ confirm |
|---|---|---|---|---|---|
| 1 | Hero pill | "Welcome to my portfolio" | *(removed)* | Banned welcome pill (DESIGN "shared fixes") | |
| 2 | Hero | "// AI/ML & Web Developer" | "AI/ML and web developer." (start of the lede) | Old hero label and SEO title | |
| 3 | Hero lede | *(none; role tags "Python", "AI & ML", "Full Stack")* | "I build machine learning projects and web products with Python, React and Node.js." | Old About "What I Do" card | ✔ kept |
| 4 | Hero meta | "BCA at BBDU Lucknow, India" | Rail: "Lucknow, India" / "BCA, BBD University" | Old hero status line | |
| 5 | Hero status | "Open for Internships & Freelance" pill + "Available!" badge | One line: "Open for internships & freelance" (from `siteStatus`) | Owner supplied in P3 | |
| 6 | Hero CTAs | "Book Service", "View Projects", "Contact Me" | "View projects", "Book a service", "Contact" | Same destinations | |
| 7 | Hero | Marquee "Developer · AI/ML · Full-Stack · Python · Innovator" | *(removed)* | Banned ghost marquee; "Innovator" is generic | |
| 8 | About eyebrow / intro | "Get to know me" / "My journey as a student developer and what drives my passion for engineering" | *(removed; heading "About")* | Banned caps eyebrow; filler | |
| 9 | About | "I am Gaurav Kumar Yadav, a BCA student … I am focused on becoming an AI/ML Developer and Web Developer by solving real-world problems with practical, user-first software." | "I'm a BCA student at BBD University (BBDU), Lucknow, working towards AI/ML and web development by solving real problems with practical, user-first software." | Old "Who I Am" card | |
| 10 | About | "I build machine learning beginner projects, data science foundations, and production-ready web interfaces with React, Node.js, and MERN stack workflows powered by Python." | "I build beginner machine learning projects, data science foundations and production web interfaces with React, Node.js and the MERN stack, with Python on the ML side." | Old "What I Do" card | ✔ kept |
| 11 | About tags | "Student", "Problem Solver", "Innovator", "AI/ML", "Python", "React" | *(removed)* | Generic labels | |
| 12 | About | *(none)* | "Now": every journey entry whose date says "Present" (FullStack Developer Intern, Ashoksoft Technologies; Uttar Pradesh State Lead, OSCI) | `journeyData.js` | ✔ kept |
| 13 | About | "Coding Consistency Showcase" + GitHub-streak and LeetCode cards (third-party images) | "Profiles": GitHub, LeetCode and LinkedIn links | Filler stats removed; the live GitHub line moved to the footer | ✔ kept |
| 14 | About link | "Learn More About Me" | "More about me →" | | |
| 15 | Skills | "What I know" / "My Skills" / "Technologies and tools I use to bring ideas to life and build production-ready solutions" | "Skills" | Filler intro removed; the lists are unchanged | |
| 16 | Skills group | "Web Dev" | "Web" | | |
| 17 | Skills link | "View All Skills & Expertise" | "All skills →" | | |
| 18 | Work | "My work" / "Featured Projects", 3 hard-coded slugs | "Selected work": the first 6 projects with `featured: true`, in data order | `projectsData.js` | ✔ kept |
| 19 | Work rows | "Team Project" / "Solo Project", "Code", "Details" | "Team" / "Solo"; the whole row links to the case study | `isCollaborative` | |
| 20 | Work link | "View All Projects" / "// See more of my work" | "All 26 projects →" (count from the data) | `projectsData.length` | |
| 21 | Notebook | "Engineering notes" / "Latest from the notebook", "Read More →" | "Notebook"; the rows link to the posts | `getFeaturedBlogs()` | |
| 22 | Notebook link | "View All Blogs" / "// Read more articles" | "All articles →" | | |
| 23 | Journey | "Continuous Learning & Growth" / "Professional Journey" / "Explore my experiences beyond projects and blogs, including internships, workshops, hackathons, conferences, certifications, industrial visits, and technical events." | "Journey" / "Internships, workshops, hackathons, community events and certifications, newest first." | Old intro, shortened | |
| 24 | Journey link | "Explore Complete Journey →" | "Full journey →" | | |
| 25 | Contact | "Get in touch" / "Let's Build Something Great" | "Contact" | Banned generic copy (DESIGN "shared fixes") | |
| 26 | Contact | "Based in Lucknow, Uttar Pradesh, India. Have a project in mind? Let's discuss how we can turn your idea into a practical, premium product." | "Based in Lucknow, Uttar Pradesh, India. Have a project in mind? Tell me about it." | Old contact copy | ✔ kept |
| 27 | Contact CTAs | "Get In Touch", "All Platforms" (both went to /contact) | "Get in touch" plus the email address as a mailto link | `siteStatus.email` | |
| 28 | Footer | "AI/ML & Web Developer" / "Building practical, user-focused digital products with modern frontend, data, and machine learning workflows." | *(removed)*; colophon rows: Local time, Status, GitHub, Email | S4 spec | |
| 29 | Footer | *(none)* | "N contributions in the last year, last on D Mon" (live from the GitHub contributions API; nothing shown if it fails, and the fallback numbers are never shown) | `githubApi.js` | |
| 30 | Footer credit | "Designed & Developed by Gaurav Kumar Yadav \| Student Developer Portfolio 2026" | "Designed & developed by Gaurav Kumar Yadav. Set in Fraunces, Geist and Geist Mono." | D-033 fonts | ✔ kept |
| 31 | Portrait alt | "Gaurav Kumar Yadav portfolio - AI ML developer and web developer in Lucknow India" | "Portrait of Gaurav Kumar Yadav" | Keyword-stuffed alt | ✔ kept |

`useSEO` title, description and keywords, the JSON-LD and all URLs are unchanged.

## P4 — Projects index and case studies (2026-11-12)

Project facts (descriptions, problems, solutions, architecture, decisions, lessons, stacks, team roles, links) are shown **verbatim** from `projectsData.js`; only headings, labels and connecting copy changed. The data's own claims are flagged below so the owner can check them before they ship more prominently.

| # | Where | Old | New | Source fact | ⚠ confirm |
|---|---|---|---|---|---|
| 1 | Index eyebrow | "My Portfolio" (caps pill) | *(removed)*; rail: "26 projects / 6 case studies" | Banned caps eyebrow; counts from the data | |
| 2 | Index h1 | "Case Studies" | "Projects" | Matches the dock and SEO title | |
| 3 | Index lede | "AI/ML and web development projects built with Python, React, Node.js, and MERN stack workflows." | "AI/ML and web development projects, built with Python, React, Node.js and the MERN stack. Ranked, with the case studies first." | Old lede + owner's ranking (D-049) | ✔ kept |
| 4 | Index controls | "// Sort Projects", "Featured First / Newest First / Alphabetical / Most Tech Stack Depth", placeholder "Search projects by name, tech stack, or description..." | "Show" (categories with counts), "Order": "Rank / Title / Stack size", label "Search by name, stack or description" | "Newest" sorted by internal id, not a date: dropped (D-050) | |
| 5 | Index count | "// Showing N projects" | "N projects" / "N of 26 projects in X" | | |
| 6 | Index empty state | "No Projects Found" / "// Try adjusting your search or filters" / "Clear All Filters" | "Nothing matches “q” in X." / "Try a technology, such as React or Python, or show all categories." / "Clear filters" | | |
| 7 | Index groups | Card grid; "Recommended Projects" / "// Discovery" | "Case studies" (6) and "More projects" (20) ranked lists; recommendations removed (they repeated the list) | D-049 | |
| 8 | Index rows | "Team Project" / "Solo Project", "View Case Study", "Code", "Demo" | "Team" / "Solo"; the whole row opens the case study; code and demo links live on the case study | `isCollaborative` | |
| 9 | Index CTA | "Want Similar Delivery for Your Project?" / "Move from inspiration to execution with a focused, premium build plan." / "Book Service", "Start a Conversation" | "Book a service →", "Get in touch →" | Filler removed | ✔ kept |
| 10 | Case kicker | Category pills | "No. 01 of 26 · Case study" (rank; "Case study" only on the top 6) | D-049 | |
| 11 | Case links | "View Code", "Live Demo" | "Source on GitHub", "Live demo" (hidden when `demo: '#'`) | | |
| 12 | Case chapters | "Project Team", "Problem Statement", "My Solution", "Architecture Overview", "Key Technical Decisions", "Lessons Learned", "Screenshots" | "Team", "Problem", "What it does", "Architecture", "Key decisions", "What I learned", "Screens" (numbered; missing data hides the chapter) | Owner: solution + lessons, no "Outcome" heading (D-051) | |
| 13 | Case rail | *(none)* | Type, Role (Gaurav's role from `team`, team projects only), Category, Stack, Links | `team[].role` | ✔ kept |
| 14 | Case footer | "Related Projects" cards; "Like what you see?" / "// Let us discuss how I can bring this design standard to your project." / "Get In Touch", "← All Projects" | "Next" (next project by rank) and "All 26 projects →" | Filler removed | |
| 15 | Not found | "Project Not Found" / "// Redirecting you back to Projects..." / "← Back to Projects" | "Project not found" / "Taking you back to all projects…" / "← All projects" (same 1.5 s redirect) | | |
| 16 | Image alt | "{title} by Gaurav Kumar Yadav - web developer portfolio India", "{title} screenshot N - Gaurav Kumar Yadav portfolio" | Screens: "{title}, screen N of M"; the arch frontispiece is decorative (`alt=""`, same image as screen 1) | Keyword-stuffed alt | ✔ kept |
| 17 | Data claim (unchanged) | kanoon-mate problem: "Over 85% of Indian citizens struggle to read legal notices…" | shown as is | `projectsData.js` | ✎ edited: "Many Indian citizens struggle…" (85% dropped, no source) |
| 18 | Data claim (unchanged) | kanoon-mate lessons: "…reduced LLM inference costs by over 70%…" | shown as is | `projectsData.js` | ✎ edited: "…reduced repeat LLM inference costs during hackathon testing" (70% dropped) |
| 19 | Data claim (unchanged) | insightaudio problem: "$20–$50/seat/month", "hundreds of hours" | shown as is | `projectsData.js` | ✔ kept |
| 20 | Home "Selected work" | First 6 `featured` projects in data order | The 6 ranked case studies | D-049 | |

`useSEO` titles, descriptions, keywords, OG images, the ItemList JSON-LD, URLs, `vercel.json`, the sitemap and `llms.txt` are unchanged.

## P5 — Remaining pages (2026-11-13)

| # | Where | Old | New | Source fact | ⚠ confirm |
|---|---|---|---|---|---|
| 1 | About h1 | "Gaurav Kumar Yadav" (gradient) + eyebrow "About me" + "Full-Stack Developer · AI/ML" | h1 "About"; rail "Lucknow" / "BCA, 2024 to present" | Old About card meta | |
| 2 | About lede | Two paragraphs (BCA, Minor, Ashoksoft intern; "I build practical web and AI products…") | "Full-stack developer and AI/ML learner. I build web and AI products: full-stack apps and APIs, RAG systems, automation and machine-learning projects." (BCA, Minor and internship move to "Now") | Old About paragraphs | |
| 3 | About status | "Currently · FullStack Intern · Ashoksoft Technologies · Remote · Aug 2026 to Present" (glow dot) | "Now: full-stack intern at Ashoksoft Technologies" (accent dot) | Old aside | |
| 4 | About tags / CTAs | Tags "Full Stack, Python, AI/ML, LLM / RAG, Open Source"; "View Resume", "My Journey" | Tags removed; "Resume ↗", "The full journey" | | |
| 5 | About "Current Chapter" | Logo cards with "In Progress" / "Current" | "Now" rows: Education, Specialisation, Experience (no logos); "Current" carries the accent; certificate links kept | Old cards | |
| 6 | About role | "FullStack Intern" | "Full-stack intern" | Same role | ✔ kept |
| 7 | About "What I Build" | Subtitle "Applied AI · Production software"; "AI / ML Engineering", "Full-Stack Engineering" | Subtitle removed; "AI / ML", "Full stack"; items unchanged except "&" → "and" | | |
| 8 | About "How I Work" | Five steps with short details ("Problem & constraints", …, "Iterate") | Same five verbs, details as phrases ("the problem and its constraints", …, "iterate on what the numbers say") | Old steps | ↩ reverted: "iterate" |
| 9 | About "Consistency in Practice" | GitHub-streak and LeetCode stat images (third-party) | "Practice": GitHub and LeetCode links | Same profiles (same call as P3 #13) | ✔ kept |
| 10 | About CTA | "Let's Build Something Useful" | "Work together"; the sentence under it is unchanged | Generic headline removed | |
| 11 | Skills header | Pill "My Expertise", "Skills & Tech", "Technologies, frameworks, and methodologies I use to turn ideas into practical code solutions." | "Skills"; "The languages, frameworks and tools I use to turn ideas into working code."; rail counts from the data | Old lede | |
| 12 | Skills tabs | "Web Dev", "Data & AI", "CS & Soft Skills" (tabs) | Three sections, no tabs: "Web development", "Data & AI", "Foundations" | Same groups | |
| 13 | Skills categories | "Programming Languages", "Frontend Development", "Backend Development", "Database & Tools", "Soft Skills", … | Sentence case and shorter: "Programming languages", "Frontend", "Backend", "Databases & tools", "Working", … (skills unchanged; moved to `src/data/skillsData.js`) | | ↩ reverted: "Soft skills" (sentence case) |
| 14 | Skills stats | "6+ Languages", "20+ Technologies", "20+ Projects", "3+ Years Learning"; "Verified //"; "N Techs" | *(removed)* | Filler stats | |
| 15 | Skills CTA | "Let's Build Something Great" / "Always learning, always growing…" / "Book Service", "Start a Conversation" | "In use": "Every project lists the stack it was built with." → Projects, Services, Contact | | |
| 16 | Journey header | Badge "Professional Growth", "Professional Journey", lede listing "industrial visits" | "Journey"; "Internships, hackathons, workshops, certifications and the degree that shaped how I build, newest first."; rail = entry count and year span from the data | No entry is an industrial visit | |
| 17 | Journey metrics | "Started Journey 2024", "Current Year 2026", "Learning Span", "Active Status: Learning & Building"; five stat cards | *(removed)*; one live "N of 25 entries" under the filter | Hard-coded / filler | |
| 18 | Journey layout | Zigzag timeline, grid toggle, search, 5 selects, chips, lightbox, "Journey Started" / "Progress" badges | Year-grouped archive, newest first; one category filter (`?category=`); a disclosure per entry; photos as thumbnails that open the image | Same data | |
| 19 | Journey "Now" | *(not shown)* | Accent dot "Now" on entries whose `status` is "In Progress" (BCA, ECSoC 2026, Ashoksoft, OSCI UP State Lead) | `journeyData.js` `status` | ✎ edited: ECSoC `status` → "Completed" |
| 20 | Journey links | "Live Demo", "GitHub Repo", "Certificate", "Blog" | "Live demo", "Source", "Certificate", "Read the post"; the placeholder certificate `https://drive.google.com/` (Product Builder's Day) is hidden | Data | ✔ kept (link stays hidden) |
| 21 | Services header | Pill "Verified Services", "Build With Confidence", "Real services, transparent pricing, and delivery-focused execution. Available for remote collaboration." | "Services"; "Frontend, backend, full-stack and AI or data science work, done remotely. The price is fixed before you pay, and the server verifies every payment."; rail = count and "From INR 499" (data) | Old lede + payment copy | |
| 22 | Services stats | "Projects Done 20+", "Quick Response < 24h", "Secure Checkout Razorpay" (clipped), "4 Detailed" | *(removed; this was the clipped "Razorpay")* | Filler stats | |
| 23 | Services trust | Chips, TrustStrip, "Why Choose Me", "Payments & Trust", "Verify First" | "How booking works": 3 steps + 4 facts (Price, Card data, Your data, Proof) | Same claims, merged | |
| 24 | Services testimonial | "Neha Khanna, Startup Founder, Pune" quote as a marquee | *(removed)* | Marquee banned; one quote | ✔ kept (stays removed) |
| 25 | Services badges | "Client Favorite" etc. | *(not shown)*; data unchanged | Unverifiable claim | ✔ kept (stay hidden) |
| 26 | Services CTAs | "Book Service", "❤️ Support My Work", "Contact Me", "Ready to Build Something Real?" | "Book a service", "Ask first", "Support my work"; close "Check the work first" → Book, Projects, GitHub | | |
| 27 | Service pages | Badges, "// Who this is for", "// Expected result", "Step 1–3", "Process and Trust", "Validate Before You Book", "Ready to Start …?" | Rail = category + price; outcome promise under the lede; "Scope" rows (For, You get, Features, You provide, Results, Delivery); "Pricing" with the FAQ; "Book" with the proof link | `servicesData.js` | |
| 28 | Blog header | "Gaurav / Writing", "Engineering Notes.", "Engineering / Journal" | "Engineering notes"; same lede; rail "Writing" / "Latest first" | | |
| 29 | Blog archive | "The writing archive", "02 notes", "Reset archive" | "Archive", "N notes", "Clear filters" | | |
| 30 | Blog newsletter | "Occasional updates" / "Notes from the engineering desk." | "New notes by email" / "An email when a new technical article is published. Nothing else." | Old copy | ✔ kept |
| 31 | Article | Breadcrumb; "Continue reading / Related articles"; "Written by"; "← Back to writing" | Rail "← Notes", category, date, read time; "Related"; author block with GitHub, About, All notes | | |
| 32 | Article support | "Appreciation" / "❤️ Support this post" / "💖 Supported" / "Thanks for supporting ❤️" | "Did this help? Support the article." / "Support this article" / "Supported" / "Thanks for the support." | No emoji | |
| 33 | Article not found | "Article not found." / toast, redirect after 2 s | "Article not found" / "That note doesn't exist. Taking you back to the archive." / redirect after 4 s | | |
| 34 | Contact header | "…Something Great"; "Major Platforms / Start Here"; "Find Me Everywhere / All Links" | "Contact"; "Internships, entry-level roles, freelance projects or a collaboration. I read every message and reply personally."; rail "Lucknow, India" / "IST, UTC+5:30" | Old form intro + SEO copy | |
| 35 | Contact form | Placeholders and toasts | Labels only; inline errors on the backend limits; "n / 2000" counter; success "Message sent. Thanks. I'll reply to the email you gave." | `backend/middleware/validator.js` | |
| 36 | Contact platforms | Icon cards with subtitles; "Want my full resume?" | "Elsewhere" rows with the same handles and shorter subtitles; a resume row | Same links | ✎ edited: `/in/gauravky` everywhere (siteStatus, commandRegistry, portfolioData/gauravData JSON copies) |
| 37 | 404 (SPA + `public/404.html`) | Animated "404", jokes, countdown, gradient text; "🤖 Machine-Readable Resources" | "Not found"; "There's no page at <path>. It may have moved, or the link has a typo."; Home, Projects, Contact and the other pages; machine-readable links kept on the static page | | |

## P6 — Polish and remaining surfaces (2026-11-13)

| # | Where | Old | New | Source fact | ⚠ confirm |
|---|---|---|---|---|---|
| 1 | Privacy / Terms / Refund ledes | *(none; "Last Updated: …" line)* | "What this site collects, why, who else handles it, and how to have it removed." / "The rules for using this site, its AI tools and its content." / "When a booked service can be refunded, when it can't, and how to ask." | Summaries of the existing sections | ✔ kept |
| 2 | Legal headings | Title Case ("Refund Eligibility", …), two "// …" lines | Sentence case; the two "//" lines are plain notes; body text word for word (two missing spaces fixed) | Same text | |
| 3 | Updates | Eyebrow "System Changelog"; h1 upper-cased | Eyebrow dropped; rail "N releases · Jan 2026 to Jul 2026"; newest first; latest release marked "Latest" | Changelog data (unchanged) | ✔ kept |
| 4 | BookNow | "Book a Service", "Selected Service", "Booking Brief", Title Case labels, 4 step boxes + 3 icon rows | "Book a service", the service title, "Booking brief", sentence-case labels; one "How it works" list; rail "Booking · Razorpay checkout" | Same flow | |
| 5 | Support | "Help Me Keep Building", 2 tags + "Support from ₹5", "Choose an amount", "A Direct Contribution", "Thank you for backing independent work." | "Help me keep building", rail "Support my work · From ₹5", "Amount", the contribution sentence as the section intro; the last two lines dropped | `SUPPORT_MIN_AMOUNT_INR` | ✔ kept |
| 6 | Trust strip (BookNow, Support) | TrustStrip claims incl. "within 24h" | *(removed)* | Unverified claim | ✔ kept |
| 7 | PaymentSuccess | "Payment Failed", "Payment Pending", "Download Receipt", "Server-Verified Payment" | Sentence case; rail "Payment · Server-verified" | Same states | |
| 8 | My activity | Tab counts inline, upper-case statuses, icon-only buttons | Counts beside tab names; "Success"/"Failed"; buttons say "Refresh", "Download receipt", "Details"; new empty states ("No supported posts yet", "No {filter} payments", …) and a "Supported posts" block | Same data | ✔ kept |
| 9 | Error boundary | "Oops! Something went wrong" / "We're sorry for the inconvenience…" | "Something broke" / "This page hit an unexpected error. Reloading usually fixes it." | — | ✔ kept |
| 10 | Offline page | "You're Offline", 💡 note, "Go Home" | "You're offline", plain note, "Home" | — | |
| 11 | OG image | *(missing file)* | Name in Fraunces, "AI/ML and web developer. BCA student at BBDU, Lucknow.", portrait in the arch | `index.html` og:description | ✔ kept |

## SEO + AI visibility (2026-11-13, owner-approved)

| # | Where | Old | New | Source fact | ⚠ confirm |
|---|---|---|---|---|---|
| 1 | Home hero lede (`Home.jsx`, `index.html` shell) | "AI/ML and web developer. I build …" | "Gaurav Kumar Yadav is an AI/ML and web developer. I build …" | Name (repo) | ✔ |
| 2 | About lede (`pageHeads.js`) | "Full-stack developer and AI/ML learner. …" | "Gaurav Kumar Yadav, a BCA student at BBD University, Lucknow. Full-stack developer and AI/ML learner. …" | About "Now": BCA, Babu Banarasi Das University, Lucknow | ✔ |

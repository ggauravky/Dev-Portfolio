# Copy review

Every copy change made during the redesign, page by page. Each one uses facts already in the repo. **⚠ confirm** means the owner should check the wording or the fact before it ships.

## P3 — Home and colophon footer (2026-11-12)

| # | Where | Old | New | Source fact | ⚠ confirm |
|---|---|---|---|---|---|
| 1 | Hero pill | "Welcome to my portfolio" | *(removed)* | Banned welcome pill (DESIGN "shared fixes") | |
| 2 | Hero | "// AI/ML & Web Developer" | "AI/ML and web developer." (start of the lede) | Old hero label and SEO title | |
| 3 | Hero lede | *(none; role tags "Python", "AI & ML", "Full Stack")* | "I build machine learning projects and web products with Python, React and Node.js." | Old About "What I Do" card | ⚠ |
| 4 | Hero meta | "BCA at BBDU Lucknow, India" | Rail: "Lucknow, India" / "BCA, BBD University" | Old hero status line | |
| 5 | Hero status | "Open for Internships & Freelance" pill + "Available!" badge | One line: "Open for internships & freelance" (from `siteStatus`) | Owner supplied in P3 | |
| 6 | Hero CTAs | "Book Service", "View Projects", "Contact Me" | "View projects", "Book a service", "Contact" | Same destinations | |
| 7 | Hero | Marquee "Developer · AI/ML · Full-Stack · Python · Innovator" | *(removed)* | Banned ghost marquee; "Innovator" is generic | |
| 8 | About eyebrow / intro | "Get to know me" / "My journey as a student developer and what drives my passion for engineering" | *(removed; heading "About")* | Banned caps eyebrow; filler | |
| 9 | About | "I am Gaurav Kumar Yadav, a BCA student … I am focused on becoming an AI/ML Developer and Web Developer by solving real-world problems with practical, user-first software." | "I'm a BCA student at BBD University (BBDU), Lucknow, working towards AI/ML and web development by solving real problems with practical, user-first software." | Old "Who I Am" card | |
| 10 | About | "I build machine learning beginner projects, data science foundations, and production-ready web interfaces with React, Node.js, and MERN stack workflows powered by Python." | "I build beginner machine learning projects, data science foundations and production web interfaces with React, Node.js and the MERN stack, with Python on the ML side." | Old "What I Do" card | ⚠ |
| 11 | About tags | "Student", "Problem Solver", "Innovator", "AI/ML", "Python", "React" | *(removed)* | Generic labels | |
| 12 | About | *(none)* | "Now": every journey entry whose date says "Present" (FullStack Developer Intern, Ashoksoft Technologies; Uttar Pradesh State Lead, OSCI) | `journeyData.js` | ⚠ |
| 13 | About | "Coding Consistency Showcase" + GitHub-streak and LeetCode cards (third-party images) | "Profiles": GitHub, LeetCode and LinkedIn links | Filler stats removed; the live GitHub line moved to the footer | ⚠ |
| 14 | About link | "Learn More About Me" | "More about me →" | | |
| 15 | Skills | "What I know" / "My Skills" / "Technologies and tools I use to bring ideas to life and build production-ready solutions" | "Skills" | Filler intro removed; the lists are unchanged | |
| 16 | Skills group | "Web Dev" | "Web" | | |
| 17 | Skills link | "View All Skills & Expertise" | "All skills →" | | |
| 18 | Work | "My work" / "Featured Projects", 3 hard-coded slugs | "Selected work": the first 6 projects with `featured: true`, in data order | `projectsData.js` | ⚠ the list (P4 confirms the top 6) |
| 19 | Work rows | "Team Project" / "Solo Project", "Code", "Details" | "Team" / "Solo"; the whole row links to the case study | `isCollaborative` | |
| 20 | Work link | "View All Projects" / "// See more of my work" | "All 26 projects →" (count from the data) | `projectsData.length` | |
| 21 | Notebook | "Engineering notes" / "Latest from the notebook", "Read More →" | "Notebook"; the rows link to the posts | `getFeaturedBlogs()` | |
| 22 | Notebook link | "View All Blogs" / "// Read more articles" | "All articles →" | | |
| 23 | Journey | "Continuous Learning & Growth" / "Professional Journey" / "Explore my experiences beyond projects and blogs, including internships, workshops, hackathons, conferences, certifications, industrial visits, and technical events." | "Journey" / "Internships, workshops, hackathons, community events and certifications, newest first." | Old intro, shortened | |
| 24 | Journey link | "Explore Complete Journey →" | "Full journey →" | | |
| 25 | Contact | "Get in touch" / "Let's Build Something Great" | "Contact" | Banned generic copy (DESIGN "shared fixes") | |
| 26 | Contact | "Based in Lucknow, Uttar Pradesh, India. Have a project in mind? Let's discuss how we can turn your idea into a practical, premium product." | "Based in Lucknow, Uttar Pradesh, India. Have a project in mind? Tell me about it." | Old contact copy | ⚠ |
| 27 | Contact CTAs | "Get In Touch", "All Platforms" (both went to /contact) | "Get in touch" plus the email address as a mailto link | `siteStatus.email` | |
| 28 | Footer | "AI/ML & Web Developer" / "Building practical, user-focused digital products with modern frontend, data, and machine learning workflows." | *(removed)*; colophon rows: Local time, Status, GitHub, Email | S4 spec | |
| 29 | Footer | *(none)* | "N contributions in the last year, last on D Mon" (live from the GitHub contributions API; nothing shown if it fails, and the fallback numbers are never shown) | `githubApi.js` | |
| 30 | Footer credit | "Designed & Developed by Gaurav Kumar Yadav \| Student Developer Portfolio 2026" | "Designed & developed by Gaurav Kumar Yadav. Set in Fraunces, Geist and Geist Mono." | D-033 fonts | ⚠ |
| 31 | Portrait alt | "Gaurav Kumar Yadav portfolio - AI ML developer and web developer in Lucknow India" | "Portrait of Gaurav Kumar Yadav" | Keyword-stuffed alt | ⚠ SEO |

`useSEO` title, description and keywords, the JSON-LD and all URLs are unchanged.

## P4 — Projects index and case studies (2026-11-12)

Project facts (descriptions, problems, solutions, architecture, decisions, lessons, stacks, team roles, links) are shown **verbatim** from `projectsData.js`; only headings, labels and connecting copy changed. The data's own claims are flagged below so the owner can check them before they ship more prominently.

| # | Where | Old | New | Source fact | ⚠ confirm |
|---|---|---|---|---|---|
| 1 | Index eyebrow | "My Portfolio" (caps pill) | *(removed)*; rail: "26 projects / 6 case studies" | Banned caps eyebrow; counts from the data | |
| 2 | Index h1 | "Case Studies" | "Projects" | Matches the dock and SEO title | |
| 3 | Index lede | "AI/ML and web development projects built with Python, React, Node.js, and MERN stack workflows." | "AI/ML and web development projects, built with Python, React, Node.js and the MERN stack. Ranked, with the case studies first." | Old lede + owner's ranking (D-049) | ⚠ |
| 4 | Index controls | "// Sort Projects", "Featured First / Newest First / Alphabetical / Most Tech Stack Depth", placeholder "Search projects by name, tech stack, or description..." | "Show" (categories with counts), "Order": "Rank / Title / Stack size", label "Search by name, stack or description" | "Newest" sorted by internal id, not a date: dropped (D-050) | |
| 5 | Index count | "// Showing N projects" | "N projects" / "N of 26 projects in X" | | |
| 6 | Index empty state | "No Projects Found" / "// Try adjusting your search or filters" / "Clear All Filters" | "Nothing matches “q” in X." / "Try a technology, such as React or Python, or show all categories." / "Clear filters" | | |
| 7 | Index groups | Card grid; "Recommended Projects" / "// Discovery" | "Case studies" (6) and "More projects" (20) ranked lists; recommendations removed (they repeated the list) | D-049 | |
| 8 | Index rows | "Team Project" / "Solo Project", "View Case Study", "Code", "Demo" | "Team" / "Solo"; the whole row opens the case study; code and demo links live on the case study | `isCollaborative` | |
| 9 | Index CTA | "Want Similar Delivery for Your Project?" / "Move from inspiration to execution with a focused, premium build plan." / "Book Service", "Start a Conversation" | "Book a service →", "Get in touch →" | Filler removed | ⚠ |
| 10 | Case kicker | Category pills | "No. 01 of 26 · Case study" (rank; "Case study" only on the top 6) | D-049 | |
| 11 | Case links | "View Code", "Live Demo" | "Source on GitHub", "Live demo" (hidden when `demo: '#'`) | | |
| 12 | Case chapters | "Project Team", "Problem Statement", "My Solution", "Architecture Overview", "Key Technical Decisions", "Lessons Learned", "Screenshots" | "Team", "Problem", "What it does", "Architecture", "Key decisions", "What I learned", "Screens" (numbered; missing data hides the chapter) | Owner: solution + lessons, no "Outcome" heading (D-051) | |
| 13 | Case rail | *(none)* | Type, Role (Gaurav's role from `team`, team projects only), Category, Stack, Links | `team[].role` | ⚠ role wording is the data's |
| 14 | Case footer | "Related Projects" cards; "Like what you see?" / "// Let us discuss how I can bring this design standard to your project." / "Get In Touch", "← All Projects" | "Next" (next project by rank) and "All 26 projects →" | Filler removed | |
| 15 | Not found | "Project Not Found" / "// Redirecting you back to Projects..." / "← Back to Projects" | "Project not found" / "Taking you back to all projects…" / "← All projects" (same 1.5 s redirect) | | |
| 16 | Image alt | "{title} by Gaurav Kumar Yadav - web developer portfolio India", "{title} screenshot N - Gaurav Kumar Yadav portfolio" | Screens: "{title}, screen N of M"; the arch frontispiece is decorative (`alt=""`, same image as screen 1) | Keyword-stuffed alt | ⚠ SEO |
| 17 | Data claim (unchanged) | kanoon-mate problem: "Over 85% of Indian citizens struggle to read legal notices…" | shown as is | `projectsData.js` | ⚠ source? |
| 18 | Data claim (unchanged) | kanoon-mate lessons: "…reduced LLM inference costs by over 70%…" | shown as is | `projectsData.js` | ⚠ measured? |
| 19 | Data claim (unchanged) | insightaudio problem: "$20–$50/seat/month", "hundreds of hours" | shown as is | `projectsData.js` | ⚠ |
| 20 | Home "Selected work" | First 6 `featured` projects in data order | The 6 ranked case studies | D-049 | |

`useSEO` titles, descriptions, keywords, OG images, the ItemList JSON-LD, URLs, `vercel.json`, the sitemap and `llms.txt` are unchanged.

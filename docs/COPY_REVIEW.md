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

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Centralized projects data - single source of truth
// Better performance by keeping data separate from component

export const projectsData = [
    {
        id: 1,
        slug: "smartmess",
        featured: true,
        title: "SmartMess",
        description: "Comprehensive hostel mess management platform with real-time menu visibility, digital attendance, a student feedback & rating system, complaint portal, and an admin analytics dashboard.",
        techStack: ["React", "Node.js", "Express", "MongoDB", "JWT", "Vercel"],
        categories: ["Full Stack"],
        github: "https://github.com/ggauravky/SmartMess",
        demo: "https://smartmesslms.vercel.app/",
        image: "/images/projects/smartmess.png",
        screenshots: ["/images/projects/smartmess.png"],
        problem: "Hostel mess management was entirely manual and disconnected. Students had no way to check the menu before walking to the mess, feedback disappeared into informal WhatsApp groups, attendance was tracked on paper prone to errors, and management had zero data on food preferences or quality trends — leading to food wastage, long queues, and low student satisfaction.",
        solution: "SmartMess is a full-stack digital platform bridging students and mess administration. Students get real-time menu access for all four meals, a 1–5 star rating system with comments, single-click digital attendance, and a tracked complaint portal. Administrators get a menu management panel, student registration approval, an analytics dashboard for ratings and trends, complaint resolution workflows, and meal-wise attendance reports.",
        architecture: "React SPA (student & admin views) ↔ Express REST API (auth, menus, ratings, attendance, complaints) ↔ MongoDB Atlas. JWT-based role authentication separates student and admin routes. Deployed on Vercel (frontend) with serverless API functions handling backend logic.",
        keyDecisions: [
            "Role-based JWT authentication — a single token payload encodes the role (student / admin) to keep route protection simple without a separate permissions service",
            "MongoDB for all entities — flexible schema accommodated menu items, ratings, attendance records, and complaints without rigid relational constraints",
            "Real-time menu stored in DB (not hardcoded) — admins can update breakfast/lunch/snacks/dinner any time without a new deployment",
            "Complaint status state machine (Open → In Review → Resolved) gives students transparency and reduces repeated follow-up messages",
            "Vercel serverless deployment — zero infrastructure management, automatic scaling for peak meal-time traffic spikes"
        ],
        lessonsLearned: [
            "Role-based access control must be enforced on every API route — never trust the client-sent role header alone",
            "Aggregation pipelines in MongoDB made rating trend analytics (average per meal, per week) dramatically simpler than post-processing in JavaScript",
            "Digital attendance UX matters as much as the feature itself — a single large tap target beats a small checkbox for rushed students",
            "Admin dashboards need pagination from day one; loading all attendance records at once becomes a performance problem quickly"
        ]
    },
    {
        id: 2,
        slug: "dev-portfolio-admin-panel",
        featured: true,
        title: "Dev Portfolio Admin Panel",
        description: "Blazing-fast admin panel for managing portfolio backend data — contact messages, newsletter subscriptions — with JWT auth, smart filtering, full CRUD operations, and a professional analytics dashboard.",
        techStack: ["React", "Node.js", "Express", "MongoDB", "JWT", "Tailwind CSS", "Vercel"],
        categories: ["Full Stack"],
        github: "https://github.com/ggauravky/Dev-Portfolio-Admin-Panel",
        demo: "https://ggauravkyadmin.vercel.app",
        image: "/images/projects/admin.png",
        screenshots: ["/images/projects/admin.png"],
        problem: "Managing portfolio backend data (contact form submissions, newsletter subscribers) through direct MongoDB queries or generic database tools was slow, offered no filtering or search, had a poor UX, and made routine data operations unnecessarily time-consuming.",
        solution: "Built a purpose-built admin panel that provides instant access to all contact messages and newsletter subscriptions with powerful search, sort, and filter capabilities. Full CRUD operations are available through an intuitive UI, with a professional analytics dashboard for data visualization. JWT-based authentication with protected routes keeps the panel secure.",
        architecture: "React SPA (protected routes via JWT stored in memory) ↔ Express REST API (same backend as the main portfolio) ↔ MongoDB Atlas (Contact and Newsletter collections). Axios interceptors attach the JWT header to every request and handle 401 token expiry redirects automatically. Deployed on Vercel.",
        keyDecisions: [
            "Separate standalone React app (not embedded in the portfolio) — keeps the admin surface isolated, reducing attack vectors and allowing independent deployment",
            "JWT stored in memory (not localStorage) during the session — prevents XSS token theft while keeping the UX seamless",
            "Axios request interceptors for auth headers — eliminates repetitive token attachment in every API call across the codebase",
            "Client-side search and filter on fetched data — avoids round-trips for every filter change, making the panel feel instant for typical data volumes",
            "Reused the existing portfolio backend API — no duplicate server infrastructure needed for the admin layer"
        ],
        lessonsLearned: [
            "Axios interceptors for 401 handling must avoid infinite retry loops — a flag to track if a refresh is already in-flight is essential",
            "Admin panels need confirmation modals for destructive actions (delete); optimistic deletes without confirmation erode trust when misclicked",
            "Pagination with a page-size selector (25 / 50 / 100) accommodates both quick scans and bulk review workflows equally well",
            "Building on top of an existing backend API surfaces design inconsistencies (response shape differences) that were never noticed on the frontend before"
        ]
    },
    {
        id: 3,
        slug: "real-time-chat-app",
        featured: true,
        title: "Real-Time Chat App",
        description: "Full-stack chat application with JWT authentication, Socket.IO for real-time messaging, online/offline status, and Cloudinary image uploads. Features modern UI with theme customization.",
        techStack: ["React", "Node.js", "Socket.IO", "MongoDB", "JWT", "Cloudinary"],
        categories: ["Full Stack"],
        github: "https://github.com/ggauravky/chat-app",
        demo: "https://chat-app-6ly8.onrender.com/",
        image: "/images/projects/chatapp.png",
        screenshots: ["/images/projects/chatapp.png"],
        problem: "Building a real-time communication platform that handles dozens of concurrent WebSocket connections, secure user sessions, and media uploads — all on a free-tier infrastructure without sacrificing performance or UX.",
        solution: "Used Socket.IO for event-driven bidirectional communication with automatic reconnection. JWT tokens secured in HTTP-only cookies handled auth without exposing credentials to JavaScript. Cloudinary offloaded all media storage, keeping the Node server stateless and horizontally scalable.",
        architecture: "React SPA (Context + hooks) ↔ Express REST API for auth/profiles ↔ Socket.IO namespace for messages. MongoDB Atlas stores users and message history. Cloudinary CDN serves all media assets. Deployed on Render with auto-sleep on inactivity.",
        keyDecisions: [
            "Socket.IO over raw WebSockets — automatic reconnection and room management out of the box",
            "HTTP-only cookies for JWT instead of localStorage to prevent XSS token theft",
            "Cloudinary for media — zero storage cost, global CDN, and on-the-fly image transformations",
            "MongoDB for messages — flexible schema accommodates text, images, and future message types without migrations"
        ],
        lessonsLearned: [
            "Socket listeners must be cleaned up in useEffect return to prevent memory leaks and duplicate event handlers",
            "CORS headers must be configured separately for HTTP and WebSocket handshake origins",
            "Optimistic UI updates (showing messages instantly before server confirmation) dramatically improve perceived speed",
            "Rate-limiting Socket.IO events is essential — without it, a single client can flood the server"
        ]
    },
    {
        id: 4,
        slug: "mern-product-store",
        title: "MERN Product Store",
        description: "Modern e-commerce product management system with CRUD operations, dark/light mode toggle, smooth Framer Motion animations, and responsive design using Chakra UI.",
        techStack: ["React", "Node.js", "MongoDB", "Express", "Chakra UI", "Framer Motion"],
        categories: ["Full Stack"],
        github: "https://github.com/ggauravky/mern-product-store",
        demo: "https://g-mern-product-store.onrender.com/",
        image: "/images/projects/prod.png",
        screenshots: ["/images/projects/prod.png"],
        problem: "Needed a full CRUD product management dashboard that feels polished and modern, with theme persistence across sessions — without building a complex custom design system from scratch.",
        solution: "Leveraged Chakra UI's built-in dark/light mode with localStorage persistence. Framer Motion handled all transition animations declaratively. Express + MongoDB provided a clean REST API for CRUD operations with Mongoose schema validation.",
        architecture: "React Vite frontend (Zustand global store) ↔ Express REST API (/api/products CRUD) ↔ MongoDB Atlas. Chakra UI's ColorModeProvider wraps the app for theme management. Framer Motion AnimatePresence handles page and list transitions.",
        keyDecisions: [
            "Zustand over Redux — far less boilerplate for this scale without sacrificing reactivity",
            "Chakra UI's built-in dark mode saved days of custom CSS theming work",
            "Framer Motion AnimatePresence for list add/remove animations to keep delete UX smooth",
            "Mongoose schema validation on the backend as the final guard against bad data regardless of frontend state"
        ],
        lessonsLearned: [
            "Zustand's persist middleware makes localStorage sync effortless, but needs careful key namespacing to avoid stale data",
            "Chakra UI component defaults override Tailwind utilities — mixing both requires explicit specificity management",
            "Framer Motion initial/animate/exit props must be kept simple; complex keyframe chains can cause layout jank on mobile"
        ]
    },
    {
        id: 5,
        slug: "notes-app",
        title: "Notes App",
        description: "Full-featured notes application with add, edit, delete functionality. Shows updated timestamps with complete backend integration and MongoDB database for secure storage.",
        techStack: ["React", "Node.js", "Express", "MongoDB", "REST API"],
        categories: ["Full Stack"],
        github: "https://github.com/ggauravky/notes-app-mern-stack",
        demo: "#",
        image: "/images/projects/comming-soon.png",
        screenshots: ["/images/projects/comming-soon.png"],
        problem: "Most notes apps either lack backend persistence (localStorage-only) or are too complex for quick daily use. The goal was a minimal, production-backed notes manager with proper CRUD and timestamp tracking.",
        solution: "Built a clean MERN stack app where each note is stored in MongoDB with createdAt and updatedAt timestamps auto-managed by Mongoose. The React frontend communicates through a REST API, with optimistic updates for instant UI feedback.",
        architecture: "React SPA (useState + fetch) ↔ Express /api/notes REST endpoints ↔ MongoDB Atlas (Mongoose). No third-party auth — scoped as a personal tool. Deployed on Render (backend) and Vercel (frontend).",
        keyDecisions: [
            "Mongoose timestamps: true to auto-track createdAt and updatedAt without manual code",
            "Optimistic updates — UI updates immediately on user action, then syncs with server in background",
            "Kept the stack minimal (no Redux, no auth layer) to focus on core CRUD mastery"
        ],
        lessonsLearned: [
            "Optimistic updates require careful rollback logic when the server request fails",
            "MongoDB ObjectId must be handled as a string in React state to avoid comparison bugs",
            "Clean API design (consistent response shapes) makes frontend error handling significantly simpler"
        ]
    },
    {
        id: 6,
        slug: "aireel-studio",
        title: "AIReel Studio",
        description: "AI-powered video editing platform for content creators. Features automatic caption generation, smart video edits, and optimization for social media using advanced AI algorithms.",
        techStack: ["Python", "Flask", "ffmpeg", "ElevenLabs API", "AI/ML"],
        categories: ["Python", "AI/ML"],
        github: "https://github.com/ggauravky/My-all-Python-Projects-",
        demo: "#",
        image: "/images/projects/aireelstp.png",
        screenshots: ["/images/projects/aireelstp.png"],
        problem: "Content creators spend hours manually adding captions, trimming clips, and formatting videos for different social platforms. This repetitive work kills creativity and productivity.",
        solution: "Used Python + ffmpeg for automated video processing (trimming, format conversion, resolution adjustment). Integrated ElevenLabs API for speech synthesis and a Whisper-based approach for automatic caption generation, then burned captions into video using ffmpeg subtitle filter.",
        architecture: "Flask REST API receives video upload → ffmpeg pipeline processes video (trim, resize, caption burn) → ElevenLabs API handles TTS → Output video returned to client. All processing is sync/async via Python threading to prevent request timeouts on large files.",
        keyDecisions: [
            "ffmpeg over MoviePy — ffmpeg is faster, more stable, and has native subtitle burn support",
            "ElevenLabs API for TTS — significantly more natural-sounding output than gTTS or pyttsx3",
            "Python threading to handle long video processing without blocking Flask's main thread",
            "Whisper model for transcription accuracy — markedly outperforms other open-source STT tools"
        ],
        lessonsLearned: [
            "ffmpeg subprocess calls need careful timeout handling — large video processing can hang indefinitely",
            "Temp file cleanup is critical; each unprocessed video file can be 100–500 MB",
            "API rate limits on ElevenLabs require queuing logic when processing multiple audio segments",
            "Video processing is CPU-intensive; a task queue (Celery) would be needed for production scale"
        ]
    },
    {
        id: 7,
        slug: "glass-morphism-calculator",
        title: "Glass-Morphism Calculator",
        description: "A beautiful, responsive calculator with glass-morphism design and full functionality. Features backdrop blur effects, smooth animations, keyboard support, and complete mathematical operations. Built with vanilla HTML, CSS, and JavaScript, showcasing advanced CSS techniques.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/calculator",
        demo: "https://gkycalculator.netlify.app/",
        image: "/images/projects/calculator.png",
        screenshots: ["/images/projects/calculator.png"],
        problem: "Standard calculator UIs feel outdated. The challenge was creating a visually stunning calculator using only vanilla HTML/CSS/JS (no frameworks), while ensuring keyboard accessibility and zero layout bugs.",
        solution: "Applied CSS backdrop-filter for the glass effect, CSS Grid for button layout, and CSS custom properties for consistent theming. Keyboard event listeners mapped to calculator operations, and a robust eval-free expression parser handled edge cases like double operators and leading decimals.",
        architecture: "Single HTML file with embedded CSS (CSS variables + Grid + backdrop-filter) and vanilla JS. Expression state managed in a simple string + operator object pattern. No build step — deployed directly on Netlify CDN.",
        keyDecisions: [
            "CSS Grid over Flexbox for the button layout — precise column spanning for '0' button is trivial with grid-column",
            "Avoided eval() for security — built a manual two-operand operator state machine instead",
            "CSS custom properties for the color palette so the theme can be swapped in one variable block",
            "Keyboard event listeners for full accessibility without any extra libraries"
        ],
        lessonsLearned: [
            "backdrop-filter has significant GPU cost on mobile — must test on real devices, not just desktop browsers",
            "Floating-point arithmetic quirks (0.1 + 0.2 = 0.30000000000000004) require toFixed() rounding for display",
            "Edge cases in calculator logic (e.g. pressing operator after result, chained operations) need exhaustive state testing"
        ]
    },
    {
        id: 8,
        slug: "custom-captcha-generator",
        title: "Custom CAPTCHA Generator",
        description: "A secure and interactive CAPTCHA generator with random character generation and real-time verification. Creates secure 6-character verification codes with textured background overlay, reload functionality, and instant verification feedback.",
        techStack: ["HTML5", "CSS3", "JavaScript", "FontAwesome"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/captcha-generator",
        demo: "https://gcapcha.netlify.app/",
        image: "/images/projects/captcha.png",
        screenshots: ["/images/projects/captcha.png"],
        problem: "Third-party CAPTCHA services (reCAPTCHA, hCaptcha) are heavyweight — adding 100KB+ of external scripts, privacy concerns, and UI friction. A lightweight custom CAPTCHA demonstrates core security concepts without external dependencies.",
        solution: "Generated a random alphanumeric string and rendered it on an HTML5 Canvas with noise (random lines, dots, varied font sizes and rotations) to prevent simple OCR bypass. Client-side verification with case-insensitive comparison and instant visual feedback.",
        architecture: "Vanilla JS CAPTCHA engine: generateToken() creates a 6-char random string → Canvas API renders distorted text with noise overlay → User input compared via normalized string match → Visual success/error feedback via CSS class toggle. Zero external requests after page load.",
        keyDecisions: [
            "HTML5 Canvas for rendering to allow noise injection (random lines + rotated characters) that plain text can't provide",
            "Case-insensitive comparison to reduce user frustration without reducing security meaningfully",
            "Custom noise generator (random bezier lines + dot scatter) instead of image-based CAPTCHAs for zero server dependency",
            "Auto-refresh on wrong answer with a new token to prevent brute-force enumeration"
        ],
        lessonsLearned: [
            "Canvas pixel manipulation has cross-origin restrictions — must be careful with external image sources",
            "Too much noise makes CAPTCHAs inaccessible; balance is key for real-world usability",
            "Client-side CAPTCHA is a UI deterrent, not a security guarantee — server-side verification is always necessary in production"
        ]
    },
    {
        id: 9,
        slug: "taskmaster-pro",
        title: "TaskMaster Pro - Advanced Todo App",
        description: "A comprehensive, modern todo list application with dark mode, focus timer, and AI-inspired features. Features natural language input processing, drag-and-drop task management, focus timer (Pomodoro technique), advanced filtering, search, and comprehensive statistics tracking.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Local Storage", "Responsive Design"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/Todo%20List%20-%20Advanced",
        demo: "https://gtodolista.netlify.app/",
        image: "/images/projects/todo-advanced.png",
        screenshots: ["/images/projects/todo-advanced.png"],
        problem: "Basic todo apps miss the key productivity mechanisms professionals need: focus timers, prioritization, progress visualization, and smart filtering. The goal was to build a feature-rich task manager with zero backend cost using only browser APIs.",
        solution: "Stored all task data in localStorage with a versioned JSON schema to support future migrations. Built a Pomodoro-style focus timer with Web Audio API alert tones. Natural language date parsing (e.g., 'tomorrow', 'next Monday') makes due-date entry frictionless. Drag-and-drop reordering used the HTML5 Drag API.",
        architecture: "Single-page vanilla JS app. Task model (objects array) serialized to localStorage. MVC-style: dataStore (model) → renderTasks() (view) → event listeners (controller). Timer mounted as a singleton to prevent duplicate intervals. CSS variables drive the dark/light theme.",
        keyDecisions: [
            "localStorage with JSON serialization — zero backend cost for a personal productivity tool",
            "HTML5 Drag API over a library (Sortable.js) to avoid 60KB dependency for one feature",
            "Web Audio API oscillator for Pomodoro alerts — no audio file needed, works offline",
            "CSS custom properties for theming — switching dark/light mode is a single data attribute change on <body>"
        ],
        lessonsLearned: [
            "localStorage has a 5MB limit; large task lists with attachments would need IndexedDB",
            "setInterval drifts over time — use Date.now() snapshots for accurate countdown timers",
            "Drag-and-drop on touch screens requires separate touch event listeners; the HTML5 Drag API is desktop-only"
        ]
    },
    {
        id: 10,
        slug: "flappy-bird-game",
        title: "Flappy Bird Game",
        description: "A fun browser-based Flappy Bird clone built using HTML, CSS, and JavaScript. Features smooth gameplay, gravity mechanics, collision detection, score tracking, and a restart option.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Canvas API"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/flappy-bird",
        demo: "https://flappy-bird-game-gaurav.netlify.app/",
        image: "/images/projects/flappy-bird.png",
        screenshots: ["/images/projects/flappy-bird.png"],
        problem: "Implementing game physics (gravity, velocity, collision) from scratch in a browser without a game engine — understanding the raw game loop pattern and how frame-rate-independent physics work.",
        solution: "Used requestAnimationFrame for a smooth 60fps game loop. Gravity is applied as a constant velocity increment each frame. AABB (axis-aligned bounding box) collision detection checks the bird's bounds against each pipe pair. Score increments when the bird successfully passes a pipe column.",
        architecture: "Single HTML5 Canvas element. Game state object (birdY, velocity, pipes[], score, isRunning). requestAnimationFrame loop → update(dt) physics step → draw() render step. Pipe objects are generated at fixed intervals and recycled from an object pool to avoid GC pressure.",
        keyDecisions: [
            "requestAnimationFrame over setInterval — syncs with display refresh rate and auto-pauses when tab is hidden",
            "AABB collision detection — sufficient for rectangular hitboxes without the complexity of pixel-perfect or SAT collision",
            "Object pooling for pipes — prevents garbage collection pauses that would cause frame drops mid-game",
            "Gravity as velocity += acceleration per frame — mirrors real physics and makes tuning intuitive"
        ],
        lessonsLearned: [
            "requestAnimationFrame passes a timestamp — always compute delta time (dt) to keep physics frame-rate independent",
            "Canvas state (fillStyle, font) must be saved/restored with save()/restore() to prevent draw calls bleeding into each other",
            "Game feel depends heavily on constant tuning — gravity, jump force, pipe gap, and speed all interact in non-obvious ways"
        ]
    },
    {
        id: 11,
        slug: "pdf-to-audio-book",
        title: "PDF to Audio Book",
        description: "A Python tool that converts PDF documents into audiobooks using text-to-speech. Extracts text from PDF files and converts it into natural-sounding speech, making reading more accessible and convenient.",
        techStack: ["Python", "PyPDF2", "pyttsx3", "gTTS"],
        categories: ["Python"],
        github: "https://github.com/ggauravky/My-all-Python-Projects-/tree/main/PDF_to_Audio_Book_using_Python",
        demo: "#",
        image: "/images/projects/pdf-audio.png",
        screenshots: ["/images/projects/pdf-audio.png"],
        problem: "Long PDFs (textbooks, research papers, e-books) are hard to consume passively. Converting them to audio enables learning during commutes or workouts — but existing solutions are expensive or require cloud APIs for every request.",
        solution: "Used PyPDF2 for text extraction and gTTS (offline-capable mode) for TTS conversion. Handled multi-page PDFs by extracting text page-by-page and concatenating into a single synthesis job. Added a simple CLI with progress indicators. pyttsx3 used as an offline fallback when internet is unavailable.",
        architecture: "CLI Python script: pdf_reader.py → PyPDF2 extracts raw text per page → text_cleaner.py strips headers/footers/page numbers → tts_engine.py (gTTS or pyttsx3) synthesizes audio → output .mp3 saved locally. Config file controls language, speed, and engine choice.",
        keyDecisions: [
            "Dual TTS engine (gTTS + pyttsx3) — gTTS for better quality online, pyttsx3 for offline use without any API call",
            "Page-by-page extraction to handle malformed PDFs gracefully — one bad page doesn't crash the whole conversion",
            "CLI over GUI at this stage for composability — can pipe into other shell scripts or automation workflows",
            "Text cleaning step before TTS — raw PDF extraction includes a lot of noise (headers, footers, page numbers) that ruins audio quality"
        ],
        lessonsLearned: [
            "PDF text extraction is lossy — scanned PDFs (images) require OCR (pytesseract); PyPDF2 only handles text-layer PDFs",
            "gTTS splits large text into chunks automatically, but stitch quality depends on network latency between chunks",
            "Column-based PDF layouts (academic papers, magazines) extract text in wrong reading order — preprocessing is non-trivial"
        ]
    },
    {
        id: 12,
        slug: "shopease",
        title: "ShopEase",
        description: "A responsive e-commerce shopping website with product browsing, cart management, and modern UI/UX design. Features a clean homepage with product categories, promotional banner, newsletter subscription popup, and intuitive cart management.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/ecommerce-website-master",
        demo: "https://gshoppingweb.netlify.app/",
        image: "/images/projects/shopease.png",
        screenshots: ["/images/projects/shopease.png"],
        problem: "Designing a realistic e-commerce frontend that handles cart state, promotional flows, animations, and responsiveness — without any framework — to understand the complexity frameworks solve.",
        solution: "Cart state managed in a JavaScript object synced to sessionStorage. Product catalog rendered dynamically from a JS array. Intersection Observer used for scroll-triggered product reveal animations. Newsletter popup uses a timed localStorage flag to avoid repeatedly annoying returning visitors.",
        architecture: "Multi-section HTML page: hero → categories → products (dynamically rendered) → banner → newsletter popup. JS modules: productStore.js, cartManager.js, uiAnimations.js. localStorage/sessionStorage persist cart and popup-seen flags. Zero backend — all state is client-side.",
        keyDecisions: [
            "sessionStorage for cart (cleared on tab close) to simulate real e-commerce session behavior",
            "Intersection Observer for product reveal animations — performant alternative to scroll event listeners",
            "localStorage flag for newsletter popup to respect user dismissal across page reloads",
            "CSS Grid for the product catalog layout — auto-fill with minmax() handles any screen width without media queries"
        ],
        lessonsLearned: [
            "Client-side cart without backend is always vulnerable to state loss — real e-commerce must persist server-side",
            "Intersection Observer thresholds need tuning per element size; small elements need lower thresholds to trigger reliably",
            "Promotional popups must be carefully timed — appearing too fast or too frequently kills conversion rates"
        ]
    },
    {
        id: 13,
        slug: "dishdash",
        title: "DishDash",
        description: "A responsive and animated food delivery website with seamless UI/UX and interactivity. Features an interactive meal catalog, add-to-cart functionality, animated navigation, and a secure login/registration system.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/food-delivery",
        demo: "https://gfooddelievery.netlify.app/",
        image: "/images/projects/dishdash.png",
        screenshots: ["/images/projects/dishdash.png"],
        problem: "Building a food delivery UI that feels polished and fast (smooth animations, instant feedback) while maintaining accessibility and mobile performance — all without a frontend framework.",
        solution: "Implemented CSS scroll snap for the meal category carousel. Cart total recalculates in real time as items are added/removed. Mobile menu uses a CSS-only hamburger toggle (checkbox hack) with a smooth slide-in. All animations use GPU-composited properties (transform, opacity) to avoid layout reflows.",
        architecture: "HTML sections (hero, menu, cart sidebar, auth modal). CSS: custom properties + Grid + Flexbox + CSS scroll snap. JS: menuData array → dynamic menu rendering → cartManager (add/remove/update quantity) → auth form validation. No backend — prototype-level static site.",
        keyDecisions: [
            "CSS scroll snap for the category carousel — native smooth scrolling with snap points, zero JS required",
            "GPU-composited animations only (transform + opacity) — avoids costly layout and paint phases for smooth 60fps",
            "CSS-only hamburger menu toggle (checkbox + label) — works without JS, reduces interactive overhead",
            "Cart as a persistent JS object with a custom event system — any part of the UI can subscribe to cart changes"
        ],
        lessonsLearned: [
            "CSS scroll snap overscrolls on some Android browsers — always test on real devices, not just Chrome DevTools",
            "Auth modals need focus trapping (Tab key cycling within modal) for keyboard accessibility compliance",
            "Menu data as a JS array (not hardcoded HTML) was the right call — adding/removing items required zero HTML changes"
        ]
    },
    {
        id: 14,
        slug: "python-grocery-store",
        title: "Python Grocery Store Application",
        description: "A full-stack grocery store management system built using Python, Flask, and MySQL with frontend integration. Follows a three-tier architecture with database, business logic, and presentation layers.",
        techStack: ["Python", "Flask", "MySQL", "HTML5", "CSS3", "JavaScript"],
        categories: ["Full Stack", "Python"],
        github: "https://github.com/ggauravky/python-grocery-store",
        demo: "https://gauravky.pythonanywhere.com/static/index.html",
        image: "/images/projects/grocery-store.png",
        screenshots: ["/images/projects/grocery-store.png"],
        problem: "Small grocery stores often use manual spreadsheets for inventory and orders, leading to stockouts, data loss, and no transaction history. Building a web-based management system makes operations trackable and scalable.",
        solution: "Built a Flask REST API with a MySQL relational database for product inventory, customer records, and orders. The three-tier architecture separates concerns cleanly: presentation (HTML/CSS/JS frontend), business logic (Flask routes), and data (MySQL via mysql-connector-python). Hosted for free on PythonAnywhere.",
        architecture: "Frontend (HTML/CSS/JS static files) ↔ Flask REST API (/api/products, /api/orders, /api/customers) ↔ MySQL database (products, customers, orders tables with foreign keys). SQLAlchemy considered but raw mysql-connector used for explicit SQL learning. Deployed on PythonAnywhere free tier.",
        keyDecisions: [
            "MySQL over MongoDB — relational data (products, customers, orders with foreign keys) naturally fits a relational model",
            "Raw SQL over ORM (SQLAlchemy) — deliberate choice to learn and control SQL query construction directly",
            "PythonAnywhere for deployment — free Python hosting with MySQL included, ideal for a student project demo",
            "Three-tier architecture pattern explicitly enforced — no business logic in routes, no SQL in templates"
        ],
        lessonsLearned: [
            "MySQL connection pooling is essential — opening a new connection per request causes serious performance degradation at scale",
            "SQL injection is trivially easy without parameterized queries — learned to always use %s placeholders, never string formatting",
            "PythonAnywhere's free tier CPU quota resets daily — long-running queries can trigger throttling unexpectedly"
        ]
    },
    {
        id: 15,
        slug: "buildmyteam",
        featured: true,
        title: "BuildMyTeam",
        description: "Production-oriented collaboration platform for colleges to manage hackathons, team formation, join requests, and team workspaces with secure role-based access.",
        techStack: ["React", "Node.js", "Express", "MongoDB", "JWT", "Tailwind CSS", "TanStack Query", "Zod"],
        categories: ["Full Stack"],
        github: "https://github.com/ggauravky/BuildMyTeam",
        demo: "https://buildmyteam.vercel.app/",
        image: "/images/projects/truecert.png",
        screenshots: ["/images/projects/truecert.png"],
        problem: "Student hackathon collaboration is usually fragmented across WhatsApp, spreadsheets, and random forms. Team discovery is chaotic, join requests are untracked, and admins have no centralized visibility into users, teams, and event participation.",
        solution: "Built a full-stack platform where students can discover hackathons, create teams, request to join via unique team codes, and collaborate through a shared workspace. Admins can approve/reject new users, monitor teams, and manage hackathon records from one dashboard.",
        architecture: "React (Vite) frontend with protected routes and query-driven state management ↔ Express REST API (auth, teams, hackathons, join requests, notifications, admin ops) ↔ MongoDB (users, teams, requests, events). Deployed with frontend on Vercel and backend on Render.",
        keyDecisions: [
            "Introduced a pending-user approval lifecycle so only vetted users can participate in team workflows",
            "Used join-code based team onboarding to simplify invites while still enforcing leader approval",
            "Added notification priorities and read/unread states so important team actions are not missed",
            "Applied Zod-based request validation and backend RBAC checks to secure all privileged operations",
            "Split frontend and backend deployments to keep scaling and release cycles independent"
        ],
        lessonsLearned: [
            "Join-request state transitions need strict server-side guards to prevent duplicate approvals",
            "Team collaboration tools become sticky only when discovery and onboarding are frictionless",
            "Role and status checks must happen in middleware, not only in UI route guards",
            "Operational dashboards should expose both user and team context to reduce admin decision time"
        ]
    },
    {
        id: 16,
        slug: "focusguard",
        featured: true,
        title: "FocusGuard",
        description: "AI-powered real-time attention monitor that detects sustained phone-looking behavior from webcam input and triggers alerts to reduce distraction and mindless scrolling.",
        techStack: ["Python", "OpenCV", "YOLOv4-tiny", "NumPy", "Computer Vision"],
        categories: ["AI/ML", "Python"],
        github: "https://github.com/ggauravky/FocusGuard",
        demo: "#",
        image: "/images/projects/focus.png",
        screenshots: ["/images/projects/focus.png"],
        problem: "People often lose focus while studying or working because attention drifts to phone usage. Most productivity tools are passive checklists that do not detect distraction behavior in real time.",
        solution: "Built a webcam-based monitoring pipeline that combines face detection and phone detection. When the system infers sustained phone-looking behavior for a configurable time window, it triggers an immediate audio alert and on-screen warning to interrupt distraction loops.",
        architecture: "Python app captures webcam frames → OpenCV + Haar features detect face/eyes/lips → YOLOv4-tiny detects phone class → geometric heuristics estimate phone-looking condition → timer-based confirmation logic fires audio alert via platform-specific beep fallback.",
        keyDecisions: [
            "Adopted a phone-first detection strategy so alerts depend on detected phone context rather than generic gaze drift",
            "Used YOLOv4-tiny through OpenCV DNN for lightweight real-time object detection on regular laptops",
            "Implemented threshold-based continuous-timer logic to reduce false alerts from brief glances",
            "Kept tuning parameters (confidence and threshold duration) configurable at runtime for different environments",
            "Added Windows beep fallback handling to keep alerts reliable across machine setups"
        ],
        lessonsLearned: [
            "Webcam lighting variance heavily affects confidence thresholds and must be tuned per user environment",
            "Geometry-based attention heuristics work well for practical use but are not equivalent to full eye-tracking",
            "Real-time UX needs clear state labels (no phone, phone too far, looking at phone) for trust and debugging",
            "Model download and startup experience should be optimized to reduce first-run friction"
        ]
    },
    {
        id: 17,
        slug: "truecert",
        featured: true,
        title: "TrueCert",
        description: "Secure digital certificate issuance and verification platform with QR-based public validation, tamper detection, analytics, and issuer dashboard workflows.",
        techStack: ["React", "Node.js", "Express", "MongoDB", "JWT", "Cloudinary", "QR Code"],
        categories: ["Full Stack"],
        github: "https://github.com/ggauravky/TrueCert",
        demo: "#",
        image: "/images/projects/truecert.png",
        screenshots: ["/images/projects/truecert.png"],
        problem: "Traditional certificate workflows are easy to forge and hard to verify. Institutions need a reliable way to issue certificates, validate authenticity publicly, and track verification activity without manual intervention.",
        solution: "Developed a SaaS-style issuance system where authenticated issuers generate certificates with unique IDs, QR links, and SHA-256 signatures. Public users can verify authenticity instantly, while issuers can revoke compromised records and review scan analytics.",
        architecture: "React frontend (issuer dashboard + public verification pages) ↔ Express API (auth, certificate lifecycle, verification, analytics) ↔ MongoDB (issuer/certificate/scan data) + Cloudinary for generated PDF and media storage. Deployed on Vercel + Render.",
        keyDecisions: [
            "Created unique certificate identifiers with signed verification metadata to prevent easy forgery",
            "Used short-lived signed PDF access tokens with optional session binding for controlled document access",
            "Integrated QR-driven verification URLs to reduce friction for recruiters and institutions",
            "Added revocation and expiry handling directly in verification responses for transparent trust status",
            "Captured scan analytics (device and location context) to provide measurable certificate usage insights"
        ],
        lessonsLearned: [
            "Verification systems need both cryptographic integrity checks and clear human-readable status messaging",
            "Certificate generation pipelines should validate uploaded assets strictly to avoid malformed output",
            "Public verification endpoints require careful rate limiting because they are high-traffic by design",
            "Issuer dashboards are significantly more useful when analytics are tied to recent verification events"
        ]
    },
    {
        id: 18,
        slug: "fire-detection-alert-system",
        featured: true,
        title: "Fire Detection Alert System",
        description: "Real-time computer-vision fire detection pipeline that analyzes webcam streams and triggers instant audio alerts using multi-stage confirmation logic.",
        techStack: ["Python", "OpenCV", "NumPy", "Pygame", "pyttsx3"],
        categories: ["AI/ML", "Python"],
        github: "https://github.com/ggauravky/fire-detection-alert-system",
        demo: "#",
        image: "/images/projects/fire.png",
        screenshots: ["/images/projects/fire.png"],
        problem: "Educational fire-detection demos often either over-trigger on bright objects or miss actual flame patterns. A practical prototype needs real-time detection with fewer false positives and immediate user feedback.",
        solution: "Implemented a layered vision approach combining HSV color filtering, brightness checks, motion analysis, and contour evaluation. Only when fire-like characteristics persist across multiple frames does the system trigger an audible alert and visual warning.",
        architecture: "Webcam stream → frame preprocessing → HSV fire-color masking + brightness thresholding + frame differencing (motion) → contour-based candidate extraction → multi-frame confirmation gate → audio alert playback and on-screen bounding boxes.",
        keyDecisions: [
            "Used multi-stage detection instead of single-threshold logic to improve reliability in noisy scenes",
            "Added frame-confirmation gating to reduce transient false positives from lighting flickers",
            "Kept sensitivity parameters configurable for area thresholds and color ranges across environments",
            "Separated alert-audio generation from detection runtime for cleaner operational flow",
            "Focused on real-time visual feedback to make model behavior explainable while testing"
        ],
        lessonsLearned: [
            "Lighting conditions dramatically influence HSV-based detection and require calibration guidance",
            "Small contour noise can trigger false alarms unless area thresholds are tuned conservatively",
            "Audio alert design must balance urgency with usability in repeated test scenarios",
            "Computer-vision prototypes are valuable for learning but should not replace certified fire safety systems"
        ]
    }
]

export const projectCategories = ['All', 'Full Stack', 'AI/ML', 'Frontend', 'Python']

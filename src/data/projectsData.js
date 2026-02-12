// Centralized projects data - single source of truth
// Better performance by keeping data separate from component

export const projectsData = [
    {
        id: 1,
        title: "Real-Time Chat App",
        description: "Full-stack chat application with JWT authentication, Socket.IO for real-time messaging, online/offline status, and Cloudinary image uploads. Features modern UI with theme customization.",
        techStack: ["React", "Node.js", "Socket.IO", "MongoDB", "JWT", "Cloudinary"],
        categories: ["Full Stack"],
        github: "https://github.com/ggauravky/chat-app",
        demo: "https://chat-app-6ly8.onrender.com/",
        image: "/images/projects/chatapp.png"
    },
    {
        id: 2,
        title: "MERN Product Store",
        description: "Modern e-commerce product management system with CRUD operations, dark/light mode toggle, smooth Framer Motion animations, and responsive design using Chakra UI.",
        techStack: ["React", "Node.js", "MongoDB", "Express", "Chakra UI", "Framer Motion"],
        categories: ["Full Stack"],
        github: "https://github.com/ggauravky/mern-product-store",
        demo: "https://g-mern-product-store.onrender.com/",
        image: "/images/projects/prod.png"
    },
    {
        id: 3,
        title: "Notes App",
        description: "Full-featured notes application with add, edit, delete functionality. Shows updated timestamps with complete backend integration and MongoDB database for secure storage.",
        techStack: ["React", "Node.js", "Express", "MongoDB", "REST API"],
        categories: ["Full Stack"],
        github: "https://github.com/ggauravky/notes-app-mern-stack",
        demo: "#",
        image: "/images/projects/comming-soon.png"
    },
    {
        id: 4,
        title: "AIReel Studio",
        description: "AI-powered video editing platform for content creators. Features automatic caption generation, smart video edits, and optimization for social media using advanced AI algorithms.",
        techStack: ["Python", "Flask", "ffmpeg", "ElevenLabs API", "AI/ML"],
        categories: ["Python", "AI/ML"],
        github: "https://github.com/ggauravky/My-all-Python-Projects-",
        demo: "#",
        image: "/images/projects/aireelstp.png"
    },
    {
        id: 5,
        title: "Glass-Morphism Calculator",
        description: "A beautiful, responsive calculator with glass-morphism design and full functionality. Features backdrop blur effects, smooth animations, keyboard support, and complete mathematical operations. Built with vanilla HTML, CSS, and JavaScript, showcasing advanced CSS techniques including Grid, custom properties, and responsive design principles.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/calculator",
        demo: "https://gkycalculator.netlify.app/",
        image: "/images/projects/calculator.png"
    },
    {
        id: 6,
        title: "Custom CAPTCHA Generator",
        description: "A secure and interactive CAPTCHA generator with random character generation and real-time verification. Creates secure 6-character verification codes with textured background overlay, reload functionality, and instant verification feedback. Demonstrates security-focused web development, DOM manipulation, and user experience design.",
        techStack: ["HTML5", "CSS3", "JavaScript", "FontAwesome"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/captcha-generator",
        demo: "https://gcapcha.netlify.app/",
        image: "/images/projects/captcha.png"
    },
    {
        id: 7,
        title: "TaskMaster Pro - Advanced Todo App",
        description: "A comprehensive, modern todo list application with dark mode, focus timer, and AI-inspired features. Features natural language input processing, drag-and-drop task management, focus timer (Pomodoro technique), advanced filtering and search capabilities, and comprehensive statistics tracking. Built with vanilla HTML, CSS, and JavaScript following 2025 design trends.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Local Storage", "Responsive Design"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/Todo%20List%20-%20Advanced",
        demo: "https://gtodolista.netlify.app/",
        image: "/images/projects/todo-advanced.png"
    },
    {
        id: 8,
        title: "Flappy Bird Game",
        description: "A fun browser-based Flappy Bird clone built using HTML, CSS, and JavaScript. Features smooth gameplay, gravity mechanics, collision detection, score tracking, and a restart option. Demonstrates the use of JavaScript for game logic, animations, and event handling with Canvas API-based rendering.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Canvas API"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/flappy-bird",
        demo: "https://flappy-bird-game-gaurav.netlify.app/",
        image: "/images/projects/flappy-bird.png"
    },
    {
        id: 9,
        title: "PDF to Audio Book",
        description: "A Python tool that converts PDF documents into audiobooks using text-to-speech. Extracts text from PDF files and converts it into natural-sounding speech, making reading more accessible and convenient. Designed for students, researchers, and readers who prefer listening to content on the go.",
        techStack: ["Python", "PyPDF2", "pyttsx3", "gTTS"],
        categories: ["Python"],
        github: "https://github.com/ggauravky/My-all-Python-Projects-/tree/main/PDF_to_Audio_Book_using_Python",
        demo: "#",
        image: "/images/projects/pdf-audio.png"
    },
    {
        id: 10,
        title: "ShopEase",
        description: "A responsive e-commerce shopping website with product browsing, cart management, and modern UI/UX design. Features a clean homepage with product categories, promotional banner, newsletter subscription popup, and intuitive cart management. Built with modern UI/UX design principles, animations, and accessibility support.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/ecommerce-website-master",
        demo: "https://gshoppingweb.netlify.app/",
        image: "/images/projects/shopease.png"
    },
    {
        id: 11,
        title: "DishDash",
        description: "A responsive and animated food delivery website with seamless UI/UX and interactivity. Features an interactive meal catalog, add-to-cart functionality, animated navigation, and a secure login/registration system. Designed with a mobile-first approach using CSS Grid and Flexbox for smooth performance across all devices.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
        categories: ["Frontend"],
        github: "https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/food-delivery",
        demo: "https://gfooddelievery.netlify.app/",
        image: "/images/projects/dishdash.png"
    },
    {
        id: 12,
        title: "Python Grocery Store Application",
        description: "A full-stack grocery store management system built using Python, Flask, and MySQL with frontend integration. Follows a three-tier architecture with database, business logic, and presentation layers. Features include product management, customer orders, stock updates, and interactive user interfaces.",
        techStack: ["Python", "Flask", "MySQL", "HTML5", "CSS3", "JavaScript"],
        categories: ["Full Stack", "Python"],
        github: "https://github.com/ggauravky/python-grocery-store",
        demo: "https://gauravky.pythonanywhere.com/static/index.html",
        image: "/images/projects/grocery-store.png"
    }
]

export const projectCategories = ['All', 'Full Stack', 'AI/ML', 'Frontend', 'Python']

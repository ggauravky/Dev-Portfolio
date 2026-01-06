function Projects() {
    const projects = [
        {
            id: 1,
            title: "Real-Time Chat App",
            description: "Full-stack chat application with JWT authentication, Socket.IO for real-time messaging, online/offline status, and Cloudinary image uploads. Features modern UI with theme customization.",
            techStack: ["React", "Node.js", "Socket.IO", "MongoDB", "JWT", "Cloudinary"],
            github: "https://github.com/ggauravky/chat-app",
            demo: "https://chat-app-6ly8.onrender.com/",
            image: "/images/projects/chatapp.png"
        },
        {
            id: 2,
            title: "MERN Product Store",
            description: "Modern e-commerce product management system with CRUD operations, dark/light mode toggle, smooth Framer Motion animations, and responsive design using Chakra UI.",
            techStack: ["React", "Node.js", "MongoDB", "Express", "Chakra UI", "Framer Motion"],
            github: "https://github.com/ggauravky/mern-product-store",
            demo: "https://g-mern-product-store.onrender.com/",
            image: "/images/projects/prod.png"
        },
        {
            id: 3,
            title: "Notes App",
            description: "Full-featured notes application with add, edit, delete functionality. Shows updated timestamps with complete backend integration and MongoDB database for secure storage.",
            techStack: ["React", "Node.js", "Express", "MongoDB", "REST API"],
            github: "https://github.com/ggauravky/notes-app-mern-stack",
            demo: "#",
            image: "/images/projects/notes-app.jpg"
        },
        {
            id: 4,
            title: "AIReel Studio",
            description: "AI-powered video editing platform for content creators. Features automatic caption generation, smart video edits, and optimization for social media using advanced AI algorithms.",
            techStack: ["Python", "Flask", "ffmpeg", "ElevenLabs API", "AI/ML"],
            github: "https://github.com/ggauravky/My-all-Python-Projects-",
            demo: "#",
            image: "/images/projects/aireelstp.png"
        }
    ]

    return (
        <div className="min-h-screen bg-slate-900 px-6 py-16">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    My Projects
                </h1>
                <p className="text-center text-slate-400 text-lg mb-12">
                    Real-world applications built with modern technologies
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map(project => (
                        <div key={project.id} className="group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                            {/* Project Image */}
                            <div className="relative h-48 bg-slate-700 overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/600x400/1e293b/60a5fa?text=' + project.title.replace(/ /g, '+')
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                            </div>

                            {/* Project Content */}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold mb-3 text-blue-300 group-hover:text-blue-400 transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed mb-5 line-clamp-3">
                                    {project.description}
                                </p>

                                {/* Tech Stack */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.techStack.map((tech, index) => (
                                        <span key={index} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm border border-slate-600 hover:border-blue-500 transition-colors">
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                {/* Links */}
                                <div className="flex gap-4">
                                    <a
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-center bg-slate-700 hover:bg-blue-500 text-slate-300 hover:text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 border border-slate-600 hover:border-blue-500"
                                    >
                                        GitHub
                                    </a>
                                    {project.demo !== "#" && (
                                        <a
                                            href={project.demo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-center bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
                                        >
                                            Live Demo
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Projects

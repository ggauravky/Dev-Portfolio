import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import useSEO from '../hooks/useSEO'
import { blogsData } from '../data/blogsData'

function Home() {
    // SEO Optimization
    useSEO({
        title: 'Gaurav Portfolio - Gaurav Kumar Yadav | Python & AI Developer Portfolio | Full Stack Projects',
        description: 'Welcome to Gaurav Portfolio! Professional developer portfolio showcasing Python, AI/ML, Data Science, and Full Stack projects by Gaurav Kumar Yadav. Student Python Developer and AI enthusiast from Lucknow, India. Specializing in Data Science, Machine Learning, and Full Stack Development with React, Node.js, and MongoDB. Explore my portfolio of innovative projects, read tech blogs, and connect for internships, entry-level roles, and freelance opportunities.',
        keywords: 'Gaurav Portfolio, Gaurav Kumar Yadav Portfolio, Portfolio Gaurav, Developer Portfolio, Python Portfolio, AI Portfolio, Portfolio Website, Gaurav Kumar Yadav, Python Developer, AI Developer, Data Science, Machine Learning, Full Stack Developer, React, Node.js, MongoDB, Internship, Entry Level, Student Developer Lucknow, BCA Developer, AI Projects, Professional Portfolio',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    // Featured projects for home page - memoized to prevent recreation
    const featuredProjects = useMemo(() => [
        {
            id: 1,
            title: "Real-Time Chat App",
            description: "Full-stack chat with Socket.IO, JWT auth, and real-time messaging.",
            techStack: ["React", "Node.js", "Socket.IO"],
            github: "https://github.com/ggauravky/chat-app",
            demo: "https://chat-app-6ly8.onrender.com/",
            image: "/images/projects/chatapp.png"
        },
        {
            id: 2,
            title: "MERN Product Store",
            description: "E-commerce product management with dark mode and animations.",
            techStack: ["React", "MongoDB", "Chakra UI"],
            github: "https://github.com/ggauravky/mern-product-store",
            demo: "https://g-mern-product-store.onrender.com/",
            image: "/images/projects/prod.png"
        },
        {
            id: 3,
            title: "AIReel Studio",
            description: "AI-powered video editing platform with automatic captions.",
            techStack: ["Python", "Flask", "AI/ML"],
            github: "https://github.com/ggauravky/My-all-Python-Projects-",
            demo: "#",
            image: "/images/projects/aireelstp.png"
        }
    ], [])

    const skills = useMemo(() => ({
        ai: ["Python", "Machine Learning", "Data Analysis", "Pandas", "NumPy"],
        web: ["React", "JavaScript", "Tailwind CSS", "Node.js", "Git"],
        languages: ["Python", "JavaScript", "C", "SQL"]
    }), [])

    // Dynamically get featured blogs from the shared data
    const featuredBlogs = blogsData.filter(blog => blog.featured)

    return (
        <div className="bg-slate-900 overflow-x-hidden w-full">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden w-full">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent"></div>

                {/* Floating Elements */}
                <div className="absolute top-20 -left-20 sm:left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 -right-20 sm:right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="relative max-w-7xl w-full mx-auto z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left space-y-8 order-2 lg:order-1">
                            <div className="space-y-4">
                                <span className="inline-block text-blue-400 text-xs sm:text-sm font-bold tracking-widest uppercase px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 animate-pulse">
                                    Welcome to my portfolio
                                </span>
                                
                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                                    <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient mb-2">
                                        Gaurav Kumar
                                    </span>
                                    <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                                        Yadav
                                    </span>
                                </h1>
                            </div>

                            {/* Role Tags */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-center lg:justify-start gap-3 px-6 py-4 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all duration-300 group">
                                    <span className="text-3xl sm:text-4xl group-hover:scale-125 transition-transform duration-300">🐍</span>
                                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-300">Python Developer</span>
                                </div>
                                
                                <div className="flex items-center justify-center lg:justify-start gap-3 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-all duration-300 group">
                                    <span className="text-3xl sm:text-4xl group-hover:scale-125 transition-transform duration-300">🤖</span>
                                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-300">AI & Data Science</span>
                                </div>
                                
                                <div className="flex items-center justify-center lg:justify-start gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-2xl hover:border-cyan-500/40 transition-all duration-300 group">
                                    <span className="text-3xl sm:text-4xl group-hover:scale-125 transition-transform duration-300">💻</span>
                                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-300">Full Stack Developer</span>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center justify-center lg:justify-start gap-3 text-base sm:text-lg md:text-xl">
                                <span className="text-2xl">🎓</span>
                                <span className="text-slate-300">Student Developer from <span className="text-blue-400 font-semibold">Lucknow</span></span>
                            </div>
                            
                            <div className="inline-flex items-center justify-center lg:justify-start gap-2 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <span className="text-xl">🚀</span>
                                <span className="text-green-400 font-bold text-base sm:text-lg">Open for Internships & Entry-Level Roles</span>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link 
                                    to="/projects" 
                                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-bold text-base sm:text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 text-center overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        View Projects 
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </Link>
                                <Link 
                                    to="/contact" 
                                    className="group px-8 py-4 border-2 border-blue-500 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-500/20 transition-all duration-300 hover:scale-105 hover:shadow-xl text-center backdrop-blur-sm"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Contact Me 
                                        <span className="text-xl">📧</span>
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Right - Profile Image */}
                        <div className="flex justify-center order-1 lg:order-2">
                            <div className="relative group">
                                {/* Animated backgrounds */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 animate-pulse"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-spin-slow"></div>
                                
                                {/* Profile Image */}
                                <div className="relative">
                                    <img
                                        src="/images/profile.jpg"
                                        alt="Gaurav Kumar Yadav"
                                        loading="eager"
                                        decoding="async"
                                        className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full object-cover border-4 border-blue-500/30 shadow-2xl group-hover:scale-105 transition-transform duration-500 ring-4 ring-blue-500/20 ring-offset-4 ring-offset-slate-900"
                                    />
                                    
                                    {/* Floating badge */}
                                    <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl border-4 border-slate-900 animate-bounce">
                                        Available! 🚀
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator - Hidden on mobile */}
                <div className="hidden md:flex absolute bottom-8 left-1/2 transform -translate-x-1/2 flex-col items-center gap-2 animate-bounce">
                    <span className="text-slate-400 text-sm">Scroll Down</span>
                    <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-blue-400 rounded-full mt-2 animate-scroll"></div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-16 animate-fadeIn">
                        <span className="inline-block text-blue-400 text-sm font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">Get to know me</span>
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mt-4 mb-6">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                About Me
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto">
                            Learn about my journey as a developer and what drives my passion for technology
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 overflow-hidden">
                            {/* Card Background Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="text-6xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">👨‍💻</div>
                                <h3 className="text-3xl font-bold text-blue-400 mb-5 group-hover:text-blue-300 transition-colors">Who I Am</h3>
                                <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                                    I'm a <span className="text-blue-400 font-semibold">BCA 2nd year student</span> passionate about AI, Data Science, and Software Development. I love solving real-world problems with code and building innovative solutions that make a meaningful impact.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">🎓 Student</span>
                                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">💡 Problem Solver</span>
                                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">🚀 Innovator</span>
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 overflow-hidden">
                            {/* Card Background Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="text-6xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">🚀</div>
                                <h3 className="text-3xl font-bold text-purple-400 mb-5 group-hover:text-purple-300 transition-colors">What I Do</h3>
                                <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                                    I specialize in <span className="text-purple-400 font-semibold">machine learning models</span>, building powerful Python applications, and creating modern, responsive web experiences using React and cutting-edge technologies.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">🤖 AI/ML</span>
                                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">🐍 Python</span>
                                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">⚛️ React</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12 animate-fadeIn">
                        <Link to="/about" className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/50">
                            Learn More About Me
                            <span className="text-xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16 animate-fadeIn">
                        <span className="inline-block text-purple-400 text-sm font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20">What I know</span>
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mt-4 mb-6">
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                My Skills
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto">
                            Technologies and tools I use to bring ideas to life
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* AI & Data Science Card */}
                        <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-3 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="text-5xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">🤖</div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">AI & Data Science</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {skills.ai.map((skill, index) => (
                                        <span key={index} className="bg-blue-500/20 border border-blue-500/40 text-blue-300 px-4 py-2.5 rounded-xl hover:bg-blue-500/40 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 cursor-default font-medium text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Corner Accent */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
                        </div>

                        {/* Web Development Card */}
                        <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-3 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="text-5xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">💻</div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors">Web Development</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {skills.web.map((skill, index) => (
                                        <span key={index} className="bg-purple-500/20 border border-purple-500/40 text-purple-300 px-4 py-2.5 rounded-xl hover:bg-purple-500/40 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 cursor-default font-medium text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Corner Accent */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all duration-500"></div>
                        </div>

                        {/* Languages Card */}
                        <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-3 overflow-hidden md:col-span-2 lg:col-span-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="text-5xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">🔤</div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">Languages</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {skills.languages.map((skill, index) => (
                                        <span key={index} className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-4 py-2.5 rounded-xl hover:bg-cyan-500/40 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 cursor-default font-medium text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Corner Accent */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/30 transition-all duration-500"></div>
                        </div>
                    </div>

                    <div className="text-center mt-16 animate-fadeIn">
                        <Link to="/skills" className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50">
                            View All Skills & Expertise
                            <span className="text-xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="py-20 px-6 bg-slate-800/30 backdrop-blur-sm relative">
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-900/5 to-transparent"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">My work</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Featured Projects
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProjects.map(project => (
                            <div key={project.id} className="group bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                                {/* Project Image */}
                                <div className="relative h-40 bg-slate-700 overflow-hidden">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x300/1e293b/60a5fa?text=' + project.title.replace(/ /g, '+')
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                                </div>

                                {/* Project Content */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 text-blue-300 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                                    <p className="text-slate-400 text-xs mb-3 line-clamp-2">{project.description}</p>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {project.techStack.map((tech, index) => (
                                            <span key={index} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Links */}
                                    <div className="flex gap-2">
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-center bg-slate-700 hover:bg-purple-600 text-slate-300 hover:text-white font-medium px-2 py-2 rounded-lg transition-all duration-300 border border-slate-600 hover:border-purple-500 hover:scale-105 text-xs"
                                        >
                                            <span className="flex items-center justify-center gap-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                </svg>
                                                Code
                                            </span>
                                        </a>
                                        {project.demo !== "#" && (
                                            <a
                                                href={project.demo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-center bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium px-2 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-xs"
                                            >
                                                <span className="flex items-center justify-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Demo
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* View More Projects Card */}
                        <Link to="/projects" className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 border-2 border-transparent rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 flex flex-col items-center justify-center text-center group p-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <div className="text-6xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">🚀</div>
                                <h3 className="text-2xl font-bold text-white mb-2">View All Projects</h3>
                                <p className="text-blue-100 text-sm">See more of my work</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section className="py-20 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-pink-400 text-sm font-semibold tracking-wider uppercase">Latest from blog</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Recent Blog Posts
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredBlogs.map((blog, index) => (
                            <div key={blog.id} className="group bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-pink-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300">
                                {/* Blog Image */}
                                <div className="relative h-40 bg-slate-700 overflow-hidden">
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x300/1e293b/ec4899?text=' + blog.title.replace(/ /g, '+')
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                                </div>

                                {/* Blog Content */}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                                        <span>{blog.date}</span>
                                        <span>•</span>
                                        <span>{blog.readTime}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-pink-300 group-hover:text-pink-400 transition-colors line-clamp-2">{blog.title}</h3>
                                    <p className="text-slate-400 text-xs mb-3 line-clamp-2">{blog.excerpt}</p>
                                    <span className="inline-block bg-slate-700 text-purple-300 px-3 py-1 rounded-lg text-xs mb-3">
                                        {blog.category}
                                    </span>

                                    {/* Read More Button */}
                                    <Link
                                        to="/blog"
                                        className="block text-center bg-slate-700 hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 text-slate-300 hover:text-white font-medium px-2 py-2 rounded-lg transition-all duration-300 border border-slate-600 hover:border-pink-500 hover:scale-105 text-xs"
                                    >
                                        Read More →
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {/* View More Blogs Card */}
                        <Link to="/blog" className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 border-2 border-transparent rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-300 flex flex-col items-center justify-center text-center group p-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <div className="text-6xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">📝</div>
                                <h3 className="text-2xl font-bold text-white mb-2">View All Blogs</h3>
                                <p className="text-pink-100 text-sm">Read more articles</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-24 px-6 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="mb-8">
                        <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">Get in touch</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Let's Work Together
                    </h2>
                    <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        Have a project in mind? Let's discuss how we can work together to bring your ideas to life. 💡
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/contact" className="group relative bg-gradient-to-r from-blue-500 to-purple-500 px-10 py-5 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Get In Touch <span className="text-2xl">📧</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                        <Link to="/links" className="group border-2 border-cyan-500 px-10 py-5 rounded-xl font-semibold text-lg hover:bg-cyan-500 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 backdrop-blur-sm flex items-center justify-center gap-2">
                            Social Links <span className="text-2xl group-hover:rotate-12 transition-transform">🔗</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home

import { Link } from 'react-router-dom'

function Home() {
    // Featured projects for home page
    const featuredProjects = [
        {
            id: 1,
            title: "Real-Time Chat App",
            description: "Full-stack chat with Socket.IO, JWT auth, and real-time messaging.",
            techStack: ["React", "Node.js", "Socket.IO"],
            image: "/images/projects/chatapp.png"
        },
        {
            id: 2,
            title: "MERN Product Store",
            description: "E-commerce product management with dark mode and animations.",
            techStack: ["React", "MongoDB", "Chakra UI"],
            image: "/images/projects/prod.png"
        },
        {
            id: 3,
            title: "AIReel Studio",
            description: "AI-powered video editing platform with automatic captions.",
            techStack: ["Python", "Flask", "AI/ML"],
            image: "/images/projects/aireelstp.png"
        }
    ]

    const skills = {
        ai: ["Python", "Machine Learning", "Data Analysis", "Pandas", "NumPy"],
        web: ["React", "JavaScript", "Tailwind CSS", "Node.js", "Git"],
        languages: ["Python", "JavaScript", "C++", "SQL"]
    }

    return (
        <div className="bg-slate-900">
            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Gaurav Kumar Yadav
                        </h1>
                        <div className="space-y-2 mb-6">
                            <p className="text-2xl md:text-3xl text-blue-300 font-semibold">AI / Data Scientist</p>
                            <p className="text-2xl md:text-3xl text-purple-300 font-semibold">Python Developer</p>
                            <p className="text-2xl md:text-3xl text-cyan-300 font-semibold">Web Developer</p>
                        </div>
                        <p className="text-xl text-slate-400 mt-6 mb-8">
                            Building intelligent solutions with code
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <Link to="/projects" className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                                View Projects
                            </Link>
                            <Link to="/contact" className="border border-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 hover:bg-opacity-20 transition-all duration-200">
                                Contact Me
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full blur-2xl opacity-30"></div>
                            <img
                                src="/images/profile.jpg"
                                alt="Gaurav Kumar Yadav"
                                className="relative w-64 h-64 md:w-80 md:h-80 rounded-full object-cover border-4 border-slate-700 shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 px-6 bg-slate-800 bg-opacity-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        About Me
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors duration-300">
                            <h3 className="text-xl font-semibold text-blue-400 mb-3">Who I Am</h3>
                            <p className="text-slate-300 leading-relaxed">
                                BCA 2nd year student passionate about AI, Data Science, and Software Development.
                                I love solving problems with code and building things that make a difference.
                            </p>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-purple-500 transition-colors duration-300">
                            <h3 className="text-xl font-semibold text-purple-400 mb-3">What I Do</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Working with machine learning models, building Python applications, and creating
                                modern web experiences using React and other technologies.
                            </p>
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/about" className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-2">
                            Learn More About Me <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        My Skills
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold text-blue-400 mb-4">AI & Data Science</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.ai.map((skill, index) => (
                                    <span key={index} className="bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-300 px-3 py-1 rounded text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-purple-400 mb-4">Web Development</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.web.map((skill, index) => (
                                    <span key={index} className="bg-purple-500 bg-opacity-20 border border-purple-500 text-purple-300 px-3 py-1 rounded text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-cyan-400 mb-4">Languages</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.languages.map((skill, index) => (
                                    <span key={index} className="bg-cyan-500 bg-opacity-20 border border-cyan-500 text-cyan-300 px-3 py-1 rounded text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/skills" className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-2">
                            View All Skills <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="py-20 px-6 bg-slate-800 bg-opacity-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Featured Projects
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProjects.map(project => (
                            <div key={project.id} className="group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
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
                                    <div className="flex flex-wrap gap-1">
                                        {project.techStack.map((tech, index) => (
                                            <span key={index} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* View More Projects Card */}
                        <Link to="/projects" className="bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-transparent rounded-xl hover:from-blue-600 hover:to-purple-600 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 flex flex-col items-center justify-center text-center group">
                            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">→</div>
                            <h3 className="text-xl font-bold text-white">View All Projects</h3>
                            <p className="text-blue-100 text-sm mt-2">See more of my work</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Let's Work Together
                    </h2>
                    <p className="text-slate-400 text-lg mb-8">
                        Have a project in mind? Let's discuss how we can work together to bring your ideas to life.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/contact" className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                            Get In Touch
                        </Link>
                        <Link to="/links" className="border border-cyan-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-cyan-500 hover:bg-opacity-20 transition-all duration-200">
                            Social Links
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-slate-800 text-center text-slate-500">
                <p>© 2026 Gaurav Kumar Yadav. Built with React & Tailwind CSS</p>
            </footer>
        </div>
    )
}

export default Home

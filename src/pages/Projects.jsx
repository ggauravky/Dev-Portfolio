function Projects() {
    const projects = [
        {
            id: 1,
            title: "Machine Learning Project",
            description: "A machine learning project for predicting house prices using linear regression and data analysis techniques.",
            techStack: ["Python", "Pandas", "Scikit-learn", "Jupyter"],
            github: "#",
            demo: "#"
        },
        {
            id: 2,
            title: "Portfolio Website",
            description: "Personal portfolio website built with React and Vite to showcase my projects and skills.",
            techStack: ["React", "JavaScript", "CSS", "Vite"],
            github: "#",
            demo: "#"
        },
        {
            id: 3,
            title: "Data Analysis Dashboard",
            description: "Interactive dashboard for visualizing and analyzing sales data with charts and insights.",
            techStack: ["Python", "Pandas", "Matplotlib", "NumPy"],
            github: "#",
            demo: "#"
        }
    ]

    return (
        <div className="min-h-screen bg-slate-900 px-6 py-16">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    My Projects
                </h1>
                <p className="text-center text-slate-400 text-lg mb-12">
                    Here are some projects I've worked on. More coming soon!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-500 hover:-translate-y-2 transition-all duration-300">
                            <h3 className="text-2xl font-semibold mb-3 text-blue-300">{project.title}</h3>
                            <p className="text-slate-400 leading-relaxed mb-5">{project.description}</p>

                            <div className="flex flex-wrap gap-2 mb-5">
                                {project.techStack.map((tech, index) => (
                                    <span key={index} className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-sm border border-slate-600">
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <a href={project.github} className="text-blue-400 hover:text-blue-300 font-medium border border-blue-500 px-4 py-2 rounded hover:bg-blue-500 hover:bg-opacity-20 transition-all duration-200">
                                    GitHub
                                </a>
                                <a href={project.demo} className="text-purple-400 hover:text-purple-300 font-medium border border-purple-500 px-4 py-2 rounded hover:bg-purple-500 hover:bg-opacity-20 transition-all duration-200">
                                    Live Demo
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Projects

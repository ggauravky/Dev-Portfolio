function Skills() {
    const skills = {
        programming: {
            title: "Programming Languages",
            icon: "💻",
            color: "purple",
            items: ["Python", "Java", "JavaScript", "C", "SQL"]
        },
        webFrontend: {
            title: "Web Development - Frontend",
            icon: "🎨",
            color: "cyan",
            items: ["HTML5", "CSS3", "JavaScript (ES6+)", "Responsive Web Design", "Bootstrap", "Tailwind CSS", "DOM Manipulation", "React.js"]
        },
        webBackend: {
            title: "Web Development - Backend",
            icon: "⚙️",
            color: "blue",
            items: ["Node.js", "Express.js", "Flask"]
        },
        databases: {
            title: "Databases & Data Handling",
            icon: "🗄️",
            color: "green",
            items: ["MySQL", "MongoDB", "Database Design", "CRUD Operations", "SQL Queries, Joins & Aggregations"]
        },
        dataScience: {
            title: "Data Science & Analytics",
            icon: "📊",
            color: "orange",
            items: ["Data Cleaning & Preprocessing", "Exploratory Data Analysis (EDA)", "Pandas", "NumPy", "Jupyter Notebooks", "Matplotlib", "Seaborn", "Scikit-learn"]
        },
        ai: {
            title: "AI & Machine Learning",
            icon: "🤖",
            color: "pink",
            items: ["Machine Learning Concepts", "Model Evaluation Basics", "Data-driven Problem Solving", "AI Tools & Assisted Development"]
        },
        security: {
            title: "Cyber Security (Foundational)",
            icon: "🔐",
            color: "red",
            items: ["Cybersecurity Basics", "Threat Detection Concepts", "Secure Coding Awareness"]
        },
        cloud: {
            title: "Cloud & Tools",
            icon: "☁️",
            color: "sky",
            items: ["Google Cloud Platform (BigQuery, Vertex AI)", "AWS (basic understanding)", "Git & GitHub", "Postman", "VS Code", "Google Colab", "Replit", "Netlify", "Vercel"]
        },
        devTools: {
            title: "Development & Productivity",
            icon: "🛠️",
            color: "yellow",
            items: ["Git Version Control", "API Integration", "Automation & Scripting (Python)", "Notion (planning & tracking)", "Debugging & Problem Solving"]
        },
        fundamentals: {
            title: "Computer Science Fundamentals",
            icon: "🧩",
            color: "indigo",
            items: ["Data Structures & Algorithms (DSA)", "Object-Oriented Programming (OOP)", "Database Management Systems (DBMS)", "Computer Networks (DCN)", "Blockchain Technology (Basics)"]
        },
        soft: {
            title: "Soft Skills",
            icon: "🤝",
            color: "teal",
            items: ["Problem Solving", "Logical Thinking", "Self-Learning & Consistency", "Team Collaboration", "Project Documentation", "Time Management"]
        }
    }

    const colorClasses = {
        purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-400",
        cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 hover:border-cyan-400",
        blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-400",
        green: "from-green-500/20 to-green-600/20 border-green-500/30 hover:border-green-400",
        orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30 hover:border-orange-400",
        pink: "from-pink-500/20 to-pink-600/20 border-pink-500/30 hover:border-pink-400",
        red: "from-red-500/20 to-red-600/20 border-red-500/30 hover:border-red-400",
        sky: "from-sky-500/20 to-sky-600/20 border-sky-500/30 hover:border-sky-400",
        yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 hover:border-yellow-400",
        indigo: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 hover:border-indigo-400",
        teal: "from-teal-500/20 to-teal-600/20 border-teal-500/30 hover:border-teal-400"
    }

    const textColorClasses = {
        purple: "text-purple-400",
        cyan: "text-cyan-400",
        blue: "text-blue-400",
        green: "text-green-400",
        orange: "text-orange-400",
        pink: "text-pink-400",
        red: "text-red-400",
        sky: "text-sky-400",
        yellow: "text-yellow-400",
        indigo: "text-indigo-400",
        teal: "text-teal-400"
    }

    return (
        <div className="min-h-screen bg-slate-900 px-6 py-16 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16 animate-fadeIn">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Technical Skills
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                        A comprehensive overview of my technical abilities, tools, and technologies I work with
                    </p>
                </div>

                {/* Core Technical Badge */}
                <div className="flex justify-center mb-12 animate-slideUp">
                    <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-full border border-blue-500/30">
                        <span className="text-3xl">🧠</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Core Technical Skills
                        </span>
                    </div>
                </div>

                {/* Skills Grid */}
                <div className="space-y-8">
                    {Object.entries(skills).map(([key, category], index) => (
                        <div
                            key={key}
                            className={`bg-gradient-to-br ${colorClasses[category.color]} backdrop-blur-sm p-6 md:p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.01] animate-slideUp`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl md:text-4xl">{category.icon}</span>
                                <h2 className={`text-2xl md:text-3xl font-bold ${textColorClasses[category.color]}`}>
                                    {category.title}
                                </h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {category.items.map((skill, skillIndex) => (
                                    <span
                                        key={skillIndex}
                                        className={`px-4 py-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 ${textColorClasses[category.color]} rounded-lg hover:scale-110 hover:bg-slate-700/80 hover:border-slate-600 transition-all duration-300 text-sm md:text-base font-medium shadow-lg`}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 animate-fadeIn" style={{ animationDelay: '1.2s' }}>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 text-center hover:scale-105 transition-all duration-300">
                        <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">5+</div>
                        <div className="text-slate-300 text-sm md:text-base">Programming Languages</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-sm p-6 rounded-2xl border border-cyan-500/30 text-center hover:scale-105 transition-all duration-300">
                        <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">15+</div>
                        <div className="text-slate-300 text-sm md:text-base">Web Technologies</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30 text-center hover:scale-105 transition-all duration-300">
                        <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">10+</div>
                        <div className="text-slate-300 text-sm md:text-base">Dev Tools & Cloud</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm p-6 rounded-2xl border border-pink-500/30 text-center hover:scale-105 transition-all duration-300">
                        <div className="text-4xl md:text-5xl font-bold text-pink-400 mb-2">8+</div>
                        <div className="text-slate-300 text-sm md:text-base">Data & AI Skills</div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-16 text-center animate-fadeIn" style={{ animationDelay: '1.4s' }}>
                    <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-slate-600/50">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Always Learning, Always Growing 📈
                        </h3>
                        <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
                            I believe in continuous learning and improving one small thing every day.
                            Check out my projects to see these skills in action!
                        </p>
                        <a
                            href="/projects"
                            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full font-semibold transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-blue-500/50"
                        >
                            View My Projects →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Skills

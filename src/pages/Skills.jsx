import { useState } from 'react'
import useSEO from '../hooks/useSEO'
import './Skills.css'

function Skills() {
    useSEO({
        title: 'Skills - Gaurav Portfolio | Python, AI/ML, Data Science & Full Stack Technologies',
        description: 'Explore Gaurav Portfolio Skills! Student Developer proficient in Python, Data Science, Machine Learning, AI/ML, React, Node.js, MongoDB, JavaScript, Pandas, NumPy, and modern web technologies. Portfolio showcasing technical expertise and hands-on project experience. Ready for internships and entry-level positions in AI, Data Science, and Full Stack Development.',
        keywords: 'Gaurav Portfolio Skills, Portfolio Skills, Python Developer Skills, AI ML Skills, Data Science Skills, Machine Learning, React Developer, Node.js, MongoDB, JavaScript, Pandas NumPy, Web Development, Tailwind CSS, Student Developer, Technical Skills Portfolio, Internship Ready',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    const [activeTab, setActiveTab] = useState('technical')

    const skillCategories = {
        technical: [
            {
                title: "Programming Languages",
                icon: "💻",
                color: "purple",
                skills: ["Python", "JavaScript", "Java", "C", "SQL"]
            },
            {
                title: "Frontend Development",
                icon: "🎨",
                color: "cyan",
                skills: ["React.js", "HTML5 & CSS3", "Tailwind CSS", "Bootstrap", "Responsive Design"]
            },
            {
                title: "Backend Development",
                icon: "⚙️",
                color: "blue",
                skills: ["Node.js", "Express.js", "Flask", "REST APIs", "Authentication"]
            },
            {
                title: "Database & Tools",
                icon: "🗄️",
                color: "green",
                skills: ["MongoDB", "MySQL", "Git & GitHub", "VS Code", "Postman"]
            }
        ],
        dataAI: [
            {
                title: "Data Science",
                icon: "📊",
                color: "orange",
                skills: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Data Analysis"]
            },
            {
                title: "Machine Learning",
                icon: "🤖",
                color: "pink",
                skills: ["Scikit-learn", "Model Training", "Data Preprocessing", "Feature Engineering", "ML Algorithms"]
            },
            {
                title: "Cloud & Platforms",
                icon: "☁️",
                color: "sky",
                skills: ["Google Cloud Platform", "AWS Basics", "Jupyter Notebooks", "Google Colab", "Kaggle"]
            }
        ],
        other: [
            {
                title: "Computer Science",
                icon: "🧩",
                color: "indigo",
                skills: ["Data Structures", "Algorithms", "OOP Concepts", "DBMS", "Computer Networks"]
            },
            {
                title: "Soft Skills",
                icon: "🤝",
                color: "teal",
                skills: ["Problem Solving", "Team Collaboration", "Self Learning", "Time Management", "Communication"]
            },
            {
                title: "Security & DevOps",
                icon: "🔐",
                color: "red",
                skills: ["Cybersecurity Basics", "Secure Coding", "API Security", "Version Control", "CI/CD Basics"]
            }
        ]
    }

    const colorClasses = {
        purple: { 
            bg: "from-purple-500/20 to-purple-600/30", 
            border: "border-purple-500/40", 
            text: "text-purple-400", 
            hover: "hover:border-purple-400 hover:shadow-purple-500/20",
            badge: "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400"
        },
        cyan: { 
            bg: "from-cyan-500/20 to-cyan-600/30", 
            border: "border-cyan-500/40", 
            text: "text-cyan-400", 
            hover: "hover:border-cyan-400 hover:shadow-cyan-500/20",
            badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400"
        },
        blue: { 
            bg: "from-blue-500/20 to-blue-600/30", 
            border: "border-blue-500/40", 
            text: "text-blue-400", 
            hover: "hover:border-blue-400 hover:shadow-blue-500/20",
            badge: "bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400"
        },
        green: { 
            bg: "from-green-500/20 to-green-600/30", 
            border: "border-green-500/40", 
            text: "text-green-400", 
            hover: "hover:border-green-400 hover:shadow-green-500/20",
            badge: "bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20 hover:border-green-400"
        },
        orange: { 
            bg: "from-orange-500/20 to-orange-600/30", 
            border: "border-orange-500/40", 
            text: "text-orange-400", 
            hover: "hover:border-orange-400 hover:shadow-orange-500/20",
            badge: "bg-orange-500/10 border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-400"
        },
        pink: { 
            bg: "from-pink-500/20 to-pink-600/30", 
            border: "border-pink-500/40", 
            text: "text-pink-400", 
            hover: "hover:border-pink-400 hover:shadow-pink-500/20",
            badge: "bg-pink-500/10 border-pink-500/30 text-pink-300 hover:bg-pink-500/20 hover:border-pink-400"
        },
        sky: { 
            bg: "from-sky-500/20 to-sky-600/30", 
            border: "border-sky-500/40", 
            text: "text-sky-400", 
            hover: "hover:border-sky-400 hover:shadow-sky-500/20",
            badge: "bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20 hover:border-sky-400"
        },
        indigo: { 
            bg: "from-indigo-500/20 to-indigo-600/30", 
            border: "border-indigo-500/40", 
            text: "text-indigo-400", 
            hover: "hover:border-indigo-400 hover:shadow-indigo-500/20",
            badge: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400"
        },
        teal: { 
            bg: "from-teal-500/20 to-teal-600/30", 
            border: "border-teal-500/40", 
            text: "text-teal-400", 
            hover: "hover:border-teal-400 hover:shadow-teal-500/20",
            badge: "bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400"
        },
        red: { 
            bg: "from-red-500/20 to-red-600/30", 
            border: "border-red-500/40", 
            text: "text-red-400", 
            hover: "hover:border-red-400 hover:shadow-red-500/20",
            badge: "bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-400"
        }
    }

    const tabs = [
        { id: 'technical', label: 'Web Development', icon: '🌐' },
        { id: 'dataAI', label: 'Data & AI', icon: '🤖' },
        { id: 'other', label: 'CS & Soft Skills', icon: '🎯' }
    ]

    return (
        <div className="min-h-screen bg-slate-900 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative overflow-x-hidden w-full">
            {/* Animated Background */}
            <div className="absolute top-20 -right-20 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 -left-20 sm:left-10 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16 animate-fadeIn">
                    <span className="inline-block text-purple-400 text-xs sm:text-sm font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20">
                        My Expertise
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        <div className="inline-block mb-4">
                            <span className="text-4xl sm:text-5xl md:text-6xl">⚡</span>
                        </div>
                        <br />Skills & Expertise
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
                        Technologies and tools I use to bring ideas to life
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                                : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-300 hover:border-purple-500/50 hover:scale-105'
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {skillCategories[activeTab].map((category, index) => (
                        <div
                            key={index}
                            className={`skill-card group bg-gradient-to-br ${colorClasses[category.color].bg} backdrop-blur-md p-6 sm:p-8 rounded-3xl border-2 ${colorClasses[category.color].border} ${colorClasses[category.color].hover} transition-all duration-500 hover:shadow-2xl animate-slideUp hover:-translate-y-2`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Category Header */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
                                <div className="skill-icon-wrapper text-4xl sm:text-5xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                    {category.icon}
                                </div>
                                <h3 className={`text-lg sm:text-xl font-bold ${colorClasses[category.color].text} tracking-tight`}>
                                    {category.title}
                                </h3>
                            </div>

                            {/* Skills Badges Grid */}
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {category.skills.map((skill, skillIndex) => (
                                    <span
                                        key={skillIndex}
                                        className={`skill-badge inline-flex items-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-300 cursor-default ${colorClasses[category.color].badge} hover:scale-110 hover:shadow-lg whitespace-nowrap`}
                                        style={{ 
                                            animationDelay: `${(index * 0.1) + (skillIndex * 0.05)}s` 
                                        }}
                                    >
                                        <span className="skill-badge-dot w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {/* Skill Count Badge */}
                            <div className="mt-6 pt-4 border-t border-slate-700/50">
                                <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {category.skills.length} Skills Mastered
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 text-center hover:scale-105 transition-all duration-300">
                        <div className="text-4xl font-bold text-purple-400 mb-2">6+</div>
                        <div className="text-slate-300 text-sm">Languages</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-sm p-6 rounded-2xl border border-cyan-500/30 text-center hover:scale-105 transition-all duration-300">
                        <div className="text-4xl font-bold text-cyan-400 mb-2">20+</div>
                        <div className="text-slate-300 text-sm">Technologies</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm p-6 rounded-2xl border border-pink-500/30 text-center hover:scale-105 transition-all duration-300">
                        <div className="text-4xl font-bold text-pink-400 mb-2">20+</div>
                        <div className="text-slate-300 text-sm">Projects</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/30 text-center hover:scale-105 transition-all duration-300">
                        <div className="text-4xl font-bold text-orange-400 mb-2">3+</div>
                        <div className="text-slate-300 text-sm">Years Learning</div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Let's Build Something Amazing Together! 🚀
                        </h3>
                        <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
                            Always learning, always growing. Check out my projects to see these skills in action!
                        </p>
                        <a
                            href="/projects"
                            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full font-semibold transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-purple-500/50"
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

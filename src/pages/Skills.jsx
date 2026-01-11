import { useState } from 'react'
import useSEO from '../hooks/useSEO'

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
                skills: [
                    { name: "Python", level: 90 },
                    { name: "JavaScript", level: 85 },
                    { name: "Java", level: 65 },
                    { name: "C", level: 60 },
                    { name: "SQL", level: 85 }
                ]
            },
            {
                title: "Frontend Development",
                icon: "🎨",
                color: "cyan",
                skills: [
                    { name: "React.js", level: 75 },
                    { name: "HTML5 & CSS3", level: 95 },
                    { name: "Tailwind CSS", level: 85 },
                    { name: "Bootstrap", level: 85 },
                    { name: "Responsive Design", level: 90 }
                ]
            },
            {
                title: "Backend Development",
                icon: "⚙️",
                color: "blue",
                skills: [
                    { name: "Node.js", level: 70 },
                    { name: "Express.js", level: 75 },
                    { name: "Flask", level: 60 },
                    { name: "REST APIs", level: 60 },
                    { name: "Authentication", level: 60 }
                ]
            },
            {
                title: "Database & Tools",
                icon: "🗄️",
                color: "green",
                skills: [
                    { name: "MongoDB", level: 85 },
                    { name: "MySQL", level: 85 },
                    { name: "Git & GitHub", level: 96 },
                    { name: "VS Code", level: 95 },
                    { name: "Postman", level: 85 }
                ]
            }
        ],
        dataAI: [
            {
                title: "Data Science",
                icon: "📊",
                color: "orange",
                skills: [
                    { name: "Pandas", level: 85 },
                    { name: "NumPy", level: 85 },
                    { name: "Matplotlib", level: 80 },
                    { name: "Seaborn", level: 80 },
                    { name: "Data Analysis", level: 85 }
                ]
            },
            {
                title: "Machine Learning",
                icon: "🤖",
                color: "pink",
                skills: [
                    { name: "Scikit-learn", level: 60 },
                    { name: "Model Training", level: 50 },
                    { name: "Data Preprocessing", level: 85 },
                    { name: "Feature Engineering", level: 50 },
                    { name: "ML Algorithms", level: 50 }
                ]
            },
            {
                title: "Cloud & Platforms",
                icon: "☁️",
                color: "sky",
                skills: [
                    { name: "Google Cloud Platform", level: 80 },
                    { name: "AWS Basics", level: 60 },
                    { name: "Jupyter Notebooks", level: 95 },
                    { name: "Google Colab", level: 95 },
                    { name: "Kaggle", level: 85 }
                ]
            }
        ],
        other: [
            {
                title: "Computer Science",
                icon: "🧩",
                color: "indigo",
                skills: [
                    { name: "Data Structures", level: 80 },
                    { name: "Algorithms", level: 75 },
                    { name: "OOP Concepts", level: 85 },
                    { name: "DBMS", level: 85 },
                    { name: "Computer Networks", level: 80 }
                ]
            },
            {
                title: "Soft Skills",
                icon: "🤝",
                color: "teal",
                skills: [
                    { name: "Problem Solving", level: 90 },
                    { name: "Team Collaboration", level: 85 },
                    { name: "Self Learning", level: 95 },
                    { name: "Time Management", level: 80 },
                    { name: "Communication", level: 85 }
                ]
            },
            {
                title: "Security & DevOps",
                icon: "🔐",
                color: "red",
                skills: [
                    { name: "Cybersecurity Basics", level: 90 },
                    { name: "Secure Coding", level: 70 },
                    { name: "API Security", level: 70 },
                    { name: "Version Control", level: 95 },
                    { name: "CI/CD Basics", level: 40 }
                ]
            }
        ]
    }

    const colorClasses = {
        purple: { bg: "from-purple-500/20 to-purple-600/30", border: "border-purple-500/40", text: "text-purple-400", progress: "bg-purple-500" },
        cyan: { bg: "from-cyan-500/20 to-cyan-600/30", border: "border-cyan-500/40", text: "text-cyan-400", progress: "bg-cyan-500" },
        blue: { bg: "from-blue-500/20 to-blue-600/30", border: "border-blue-500/40", text: "text-blue-400", progress: "bg-blue-500" },
        green: { bg: "from-green-500/20 to-green-600/30", border: "border-green-500/40", text: "text-green-400", progress: "bg-green-500" },
        orange: { bg: "from-orange-500/20 to-orange-600/30", border: "border-orange-500/40", text: "text-orange-400", progress: "bg-orange-500" },
        pink: { bg: "from-pink-500/20 to-pink-600/30", border: "border-pink-500/40", text: "text-pink-400", progress: "bg-pink-500" },
        sky: { bg: "from-sky-500/20 to-sky-600/30", border: "border-sky-500/40", text: "text-sky-400", progress: "bg-sky-500" },
        indigo: { bg: "from-indigo-500/20 to-indigo-600/30", border: "border-indigo-500/40", text: "text-indigo-400", progress: "bg-indigo-500" },
        teal: { bg: "from-teal-500/20 to-teal-600/30", border: "border-teal-500/40", text: "text-teal-400", progress: "bg-teal-500" },
        red: { bg: "from-red-500/20 to-red-600/30", border: "border-red-500/40", text: "text-red-400", progress: "bg-red-500" }
    }

    const tabs = [
        { id: 'technical', label: 'Web Development', icon: '🌐' },
        { id: 'dataAI', label: 'Data & AI', icon: '🤖' },
        { id: 'other', label: 'CS & Soft Skills', icon: '🎯' }
    ]

    return (
        <div className="min-h-screen bg-slate-900 px-4 sm:px-6 py-16 relative overflow-x-hidden w-full">
            {/* Animated Background */}
            <div className="absolute top-20 -right-20 sm:right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 -left-20 sm:left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-fadeIn">
                    <div className="inline-block mb-4">
                        <span className="text-5xl">⚡</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        Skills & Expertise
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skillCategories[activeTab].map((category, index) => (
                        <div
                            key={index}
                            className={`group bg-gradient-to-br ${colorClasses[category.color].bg} backdrop-blur-sm p-6 rounded-2xl border ${colorClasses[category.color].border} hover:scale-[1.02] transition-all duration-300 hover:shadow-xl animate-slideUp`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Category Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                                <h3 className={`text-xl font-bold ${colorClasses[category.color].text}`}>
                                    {category.title}
                                </h3>
                            </div>

                            {/* Skills with Progress Bars */}
                            <div className="space-y-4">
                                {category.skills.map((skill, skillIndex) => (
                                    <div key={skillIndex} className="group/skill">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-300 text-sm font-medium">{skill.name}</span>
                                            <span className={`text-xs font-semibold ${colorClasses[category.color].text}`}>{skill.level}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${colorClasses[category.color].progress} rounded-full transition-all duration-1000 ease-out group-hover/skill:animate-pulse`}
                                                style={{ width: `${skill.level}%`, transitionDelay: `${skillIndex * 0.1}s` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
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

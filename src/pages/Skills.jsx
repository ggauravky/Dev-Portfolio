// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import TechIcon from '../components/TechIcon'
import './Skills.css'

// ── Category header icons (Heroicons Outline, MIT) ──────────────────────────
const CategoryIcon = ({ title, className = 'w-7 h-7' }) => {
    const icons = {
        'Programming Languages': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"/>
            </svg>
        ),
        'Frontend Development': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"/>
            </svg>
        ),
        'Backend Development': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21.75 17.25v.75a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25v-.75m0-10.5v-.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v.75m-18 0h18m-18 5.25h18M12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008z"/>
            </svg>
        ),
        'Database & Tools': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/>
            </svg>
        ),
        'Data Science': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
            </svg>
        ),
        'Machine Learning': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"/>
            </svg>
        ),
        'Cloud & Platforms': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"/>
            </svg>
        ),
        'Computer Science': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/>
            </svg>
        ),
        'Soft Skills': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
            </svg>
        ),
        'Security & DevOps': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
            </svg>
        ),
    }
    return icons[title] ?? null
}

CategoryIcon.propTypes = {
    title: PropTypes.string.isRequired,
    className: PropTypes.string,
}

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
                color: "purple",
                skills: ["Python", "JavaScript", "Java", "C", "SQL"]
            },
            {
                title: "Frontend Development",
                color: "cyan",
                skills: ["React.js", "HTML5 & CSS3", "Tailwind CSS", "Bootstrap", "Responsive Design"]
            },
            {
                title: "Backend Development",
                color: "blue",
                skills: ["Node.js", "Express.js", "Flask", "REST APIs", "Authentication"]
            },
            {
                title: "Database & Tools",
                color: "green",
                skills: ["MongoDB", "MySQL", "Git & GitHub", "VS Code", "Postman"]
            }
        ],
        dataAI: [
            {
                title: "Data Science",
                color: "orange",
                skills: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Data Analysis"]
            },
            {
                title: "Machine Learning",
                color: "pink",
                skills: ["Scikit-learn", "Model Training", "Data Preprocessing", "Feature Engineering", "ML Algorithms"]
            },
            {
                title: "Cloud & Platforms",
                color: "sky",
                skills: ["Google Cloud Platform", "AWS Basics", "Jupyter Notebooks", "Google Colab", "Kaggle"]
            }
        ],
        other: [
            {
                title: "Computer Science",
                color: "indigo",
                skills: ["Data Structures", "Algorithms", "OOP Concepts", "DBMS", "Computer Networks"]
            },
            {
                title: "Soft Skills",
                color: "teal",
                skills: ["Problem Solving", "Team Collaboration", "Self Learning", "Time Management", "Communication"]
            },
            {
                title: "Security & DevOps",
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
        {
            id: 'technical', label: 'Web Development',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/>
                </svg>
            )
        },
        {
            id: 'dataAI', label: 'Data & AI',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                    <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
                </svg>
            )
        },
        {
            id: 'other', label: 'CS & Soft Skills',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/>
                </svg>
            )
        },
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
                            <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-purple-400 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
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
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {skillCategories[activeTab].map((category, index) => (
                        <div
                            key={category.title}
                            className={`skill-card group bg-gradient-to-br ${colorClasses[category.color].bg} backdrop-blur-md p-6 sm:p-8 rounded-3xl border-2 ${colorClasses[category.color].border} ${colorClasses[category.color].hover} transition-all duration-500 hover:shadow-2xl animate-slideUp hover:-translate-y-2`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Category Header */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
                                <div className={`skill-icon-wrapper w-11 h-11 flex items-center justify-center rounded-xl bg-slate-900/60 border ${colorClasses[category.color].border} p-2.5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${colorClasses[category.color].text}`}>
                                    <CategoryIcon title={category.title} className="w-full h-full" />
                                </div>
                                <h3 className={`text-lg sm:text-xl font-bold ${colorClasses[category.color].text} tracking-tight`}>
                                    {category.title}
                                </h3>
                            </div>

                            {/* Skills Badges Grid */}
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {category.skills.map((skill, skillIndex) => (
                                    <span
                                        key={`${category.title}-${skill}`}
                                        className={`skill-badge inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-300 cursor-default ${colorClasses[category.color].badge} hover:scale-110 hover:shadow-lg whitespace-nowrap`}
                                        style={{ 
                                            animationDelay: `${(index * 0.1) + (skillIndex * 0.05)}s` 
                                        }}
                                    >
                                        <TechIcon name={skill} className="w-3.5 h-3.5 shrink-0" />
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
                            Let's Build Something Amazing Together!
                        </h3>
                        <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
                            Always learning, always growing. Check out my projects to see these skills in action!
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link
                                to="/services"
                                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full font-semibold transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-purple-500/50"
                            >
                                Book Service
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center px-8 py-4 border border-slate-600 hover:border-cyan-500/50 rounded-full font-semibold text-slate-200 hover:text-cyan-300 transition-all duration-300"
                            >
                                Start a Conversation
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Skills

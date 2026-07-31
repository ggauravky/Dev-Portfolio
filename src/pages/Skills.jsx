// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useSEO from '../hooks/useSEO'
import TechIcon from '../components/TechIcon'

// ── Category header icons (Heroicons Outline, MIT) ──────────────────────────
const CategoryIcon = ({ title, className = 'w-5 h-5' }) => {
    const icons = {
        'Programming Languages': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"/>
            </svg>
        ),
        'Frontend Development': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"/>
            </svg>
        ),
        'Backend Development': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21.75 17.25v.75a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25v-.75m0-10.5v-.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v.75m-18 0h18m-18 5.25h18M12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008z"/>
            </svg>
        ),
        'Database & Tools': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/>
            </svg>
        ),
        'Data Science': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
            </svg>
        ),
        'Machine Learning': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"/>
            </svg>
        ),
        'Cloud & Platforms': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"/>
            </svg>
        ),
        'Computer Science': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/>
            </svg>
        ),
        'Soft Skills': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
            </svg>
        ),
        'Security & DevOps': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
            </svg>
        ),
    }
    return icons[title] ?? null
}

function Skills() {
    useSEO({
        title: 'Skills | Gaurav Kumar Yadav | Python, AI/ML, React & Full Stack Technologies',
        description: 'Technical skills of Gaurav Kumar Yadav, a BCA student at BBDU Lucknow — Python, AI/ML, Data Science, React, Node.js, MongoDB, JavaScript, Pandas, NumPy, and modern full stack web technologies. Open to internships and entry-level AI and Full Stack Development positions.',
        keywords: 'Gaurav Kumar Yadav skills, Gaurav Kumar Yadav BBDU, Python developer Lucknow, AI ML skills student India, React developer skills, Full Stack skills MERN, machine learning developer portfolio, ggauravky technical skills',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    const [activeTab, setActiveTab] = useState('technical')

    const skillCategories = {
        technical: [
            {
                title: "Programming Languages",
                skills: ["Python", "JavaScript", "Java", "C", "SQL"]
            },
            {
                title: "Frontend Development",
                skills: ["React.js", "HTML5 & CSS3", "Tailwind CSS", "Bootstrap", "Responsive Design"]
            },
            {
                title: "Backend Development",
                skills: ["Node.js", "Express.js", "Flask", "REST APIs", "Authentication"]
            },
            {
                title: "Database & Tools",
                skills: ["MongoDB", "MySQL", "Prisma", "Git & GitHub", "VS Code", "Postman"]
            }
        ],
        dataAI: [
            {
                title: "Data Science",
                skills: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Data Analysis"]
            },
            {
                title: "Machine Learning",
                skills: ["Scikit-learn", "Model Training", "Data Preprocessing", "Feature Engineering", "ML Algorithms"]
            },
            {
                title: "Cloud & Platforms",
                skills: ["Google Cloud Platform", "AWS Basics", "Jupyter Notebooks", "Google Colab", "Kaggle"]
            }
        ],
        other: [
            {
                title: "Computer Science",
                skills: ["Data Structures", "Algorithms", "OOP Concepts", "DBMS", "Computer Networks"]
            },
            {
                title: "Soft Skills",
                skills: ["Problem Solving", "Team Collaboration", "Self Learning", "Time Management", "Communication"]
            },
            {
                title: "Security & DevOps",
                skills: ["Cybersecurity Basics", "Secure Coding", "API Security", "Version Control", "CI/CD Basics"]
            }
        ]
    }

    const tabs = [
        {
            id: 'technical',
            label: 'Web Dev',
            icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/>
                </svg>
            )
        },
        {
            id: 'dataAI',
            label: 'Data & AI',
            icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                    <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
                </svg>
            )
        },
        {
            id: 'other',
            label: 'CS & Soft Skills',
            icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/>
                </svg>
            )
        },
    ]

    return (
        <main className="skills-page bg-obsidian min-h-screen px-4 py-24 sm:px-6 lg:px-8 relative overflow-hidden w-full">
            {/* Animated Background */}
            <div className="absolute top-20 -right-20 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-toxic/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 -left-20 sm:left-10 w-64 h-64 sm:w-96 sm:h-96 bg-cyber/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto relative z-10 space-y-12">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto animate-fadeIn">
                    <span className="inline-block text-toxic text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15">
                        My Expertise
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold uppercase leading-[0.95] tracking-tighter text-white mb-6">
                        Skills & Tech
                    </h1>
                    <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
                        Technologies, frameworks, and methodologies I use to turn ideas into practical code solutions.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 font-mono ${activeTab === tab.id
                                ? 'bg-toxic text-obsidian scale-102 shadow-lg shadow-toxic/10'
                                : 'bg-obsidian-card border border-obsidian-border text-zinc-400 hover:text-white hover:border-toxic hover:scale-102'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Skills Grid */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <AnimatePresence mode="popLayout">
                        {skillCategories[activeTab].map((category, index) => {
                            const isEven = index % 2 === 0
                            const accentColor = isEven ? 'text-toxic' : 'text-cyber'
                            const accentBorder = isEven ? 'hover:border-toxic/30' : 'hover:border-cyber/30'
                            
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    key={category.title}
                                    className={`group relative overflow-hidden bg-obsidian-card border border-obsidian-border rounded-lg p-6 sm:p-8 transition-all duration-350 hover:-translate-y-1.5 ${accentBorder}`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.01] to-transparent pointer-events-none"></div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div>
                                            {/* Category Header */}
                                            <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-obsidian-border">
                                                <div className={`w-9 h-9 flex items-center justify-center rounded bg-obsidian border border-obsidian-border p-2 group-hover:scale-110 transition-all duration-500 ${accentColor}`}>
                                                    <CategoryIcon title={category.title} className="w-full h-full" />
                                                </div>
                                                <h3 className="text-base sm:text-lg font-display font-bold uppercase text-white group-hover:text-toxic transition-colors">
                                                    {category.title}
                                                </h3>
                                            </div>

                                            {/* Skills Badges Grid */}
                                            <div className="flex flex-wrap gap-2">
                                                {category.skills.map((skill) => (
                                                    <span
                                                        key={`${category.title}-${skill}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-obsidian border border-obsidian-border text-zinc-300 rounded-md hover:border-toxic hover:text-white transition-all cursor-default font-mono text-xs whitespace-nowrap"
                                                    >
                                                        <TechIcon name={skill} className="w-3.5 h-3.5 shrink-0" />
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Skill Count Badge */}
                                        <div className="mt-6 pt-4 border-t border-obsidian-border flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{category.skills.length} Techs</span>
                                            </span>
                                            <span className="text-[10px] font-bold text-toxic opacity-60">Verified //</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </motion.div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                    <div className="bg-obsidian-card border border-obsidian-border rounded-lg p-6 text-center hover:border-toxic/30 transition-all duration-300">
                        <div className="text-3xl font-display font-black text-toxic mb-2">6+</div>
                        <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">// Languages</div>
                    </div>
                    <div className="bg-obsidian-card border border-obsidian-border rounded-lg p-6 text-center hover:border-toxic/30 transition-all duration-300">
                        <div className="text-3xl font-display font-black text-toxic mb-2">20+</div>
                        <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">// Technologies</div>
                    </div>
                    <div className="bg-obsidian-card border border-obsidian-border rounded-lg p-6 text-center hover:border-toxic/30 transition-all duration-300">
                        <div className="text-3xl font-display font-black text-toxic mb-2">20+</div>
                        <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">// Projects</div>
                    </div>
                    <div className="bg-obsidian-card border border-obsidian-border rounded-lg p-6 text-center hover:border-toxic/30 transition-all duration-300">
                        <div className="text-3xl font-display font-black text-toxic mb-2">3+</div>
                        <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">// Years Learning</div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                    <div className="bg-obsidian-card border border-obsidian-border rounded-lg p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-toxic/5 via-transparent to-transparent pointer-events-none"></div>
                        <h3 className="text-2xl md:text-3xl font-display font-bold uppercase text-white mb-4">
                            Let's Build Something Great
                        </h3>
                        <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
                            Always learning, always growing. Check out my project portfolio to see these skills in action!
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/services"
                                className="group relative px-8 py-4 bg-toxic text-obsidian rounded-full font-bold text-xs tracking-wider uppercase hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg shadow-toxic/15 hover:shadow-white/20 text-center overflow-hidden inline-flex items-center justify-center"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                    <span>Book Service</span>
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                </span>
                            </Link>
                            <Link
                                to="/contact"
                                className="group relative px-8 py-4 border border-zinc-700 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase bg-transparent text-zinc-300 hover:text-toxic hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-toxic/5 text-center backdrop-blur-sm inline-flex items-center justify-center"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                    <span>Start a Conversation</span>
                                    <svg className="w-3.5 h-3.5 shrink-0 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Skills

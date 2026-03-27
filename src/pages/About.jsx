// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import useSEO from '../hooks/useSEO'
import StatsCards from '../components/StatsCards'

function About() {
    useSEO({
        title: 'About - Gaurav Portfolio | Gaurav Kumar Yadav | Python & AI Developer from Lucknow',
        description: 'About Gaurav Kumar Yadav Portfolio - Learn about a passionate BCA student from Lucknow pursuing AI/ML certification from IIT Mandi. Explore Gaurav\'s journey as a Python Developer, Data Science enthusiast, AI Engineer, and Full Stack Developer. Discover skills, experience, and career goals. Open for internships, freelance projects, and entry-level opportunities.',
        keywords: 'About Gaurav Portfolio, About Gaurav Kumar Yadav, Gaurav Portfolio About, Portfolio About Page, BCA Student Lucknow, Python Developer, Data Science Student, AI Engineer, Machine Learning, Full Stack Developer, IIT Mandi, Developer Journey, Internship Seeker, Developer Bio, Portfolio Bio',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    return (
        <div className="min-h-screen bg-slate-900 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-20 right-10 w-64 h-64 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fadeIn">
                    <span className="inline-block text-blue-400 text-xs sm:text-sm font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                        Get to know me
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        About Me
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed px-4">
                        BCA Student from Lucknow | AI/ML Certified by IIT Mandi | Python & Full Stack Developer
                        <br className="hidden sm:block" />
                        <span className="text-green-400 font-semibold mt-3 sm:mt-2 inline-block">
                            Open for Internships | Entry-Level Roles | Freelance Projects
                        </span>
                    </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-700/50 mb-8 sm:mb-12 animate-slideDown">
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-300">
                        <div className="flex items-center gap-2 text-center sm:text-left">
                            <svg className="w-6 h-6 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
                            <span className="text-sm md:text-base">
                                BCA 2nd Year at{' '}
                                <a
                                    href="https://www.bbdu.ac.in/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-blue-400/30 hover:decoration-blue-300 transition-colors"
                                >
                                    BBDU University
                                </a>
                            </span>
                        </div>
                        <span className="text-slate-600 hidden sm:inline">|</span>
                        <div className="flex items-center gap-2 text-center sm:text-left">
                            <svg className="w-6 h-6 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" /></svg>
                            <span className="text-sm md:text-base">
                                Minor in AI/ML from{' '}
                                <a
                                    href="https://www.iitmandi.ac.in/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 font-semibold underline decoration-purple-400/30 hover:decoration-purple-300 transition-colors"
                                >
                                    IIT Mandi
                                </a>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Section - GitHub & LeetCode */}
                <div className="mb-8 sm:mb-12 animate-fadeIn">
                    <div className="text-center mb-6 sm:mb-8">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text mb-2">
                            Performance Snapshot
                        </h3>
                        <p className="text-slate-400 text-sm md:text-base">
                            Live coding momentum from GitHub and LeetCode
                        </p>
                    </div>
                    <StatsCards />
                </div>

                {/* Main Content Grid */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Who I Am Section */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] animate-slideUp">
                        <div className="flex items-center gap-3 mb-6">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400">Who I Am</h2>
                        </div>
                        <div className="space-y-4 text-slate-300 text-base sm:text-lg leading-relaxed">
                            <p>
                                Hi! I'm <span className="text-blue-400 font-semibold">Gaurav Kumar Yadav</span>, a BCA 2nd year student from{' '}
                                <span className="text-green-400 font-semibold">Lucknow, India</span> with a passion for{' '}
                                <span className="text-purple-400">Python Development</span>,{' '}
                                <span className="text-cyan-400">Data Science</span>,{' '}
                                <span className="text-blue-400">AI/Machine Learning</span>, and{' '}
                                <span className="text-pink-400">Full Stack Web Development</span>.
                            </p>
                            <p>
                                I'm currently pursuing <span className="text-purple-400 font-semibold">AI & Data Science certification from IIT Mandi × Masai School</span>,
                                combining academic knowledge with practical, industry-relevant skills. I focus on building real-world projects that solve actual problems,
                                not just copying tutorials.
                            </p>
                            <p>
                                I'm actively seeking{' '}
                                <span className="text-green-400 font-semibold">internships, entry-level positions, and freelance opportunities</span>{' '}
                                where I can apply my skills in Python, AI/ML, Data Analysis, and Full Stack Development. I'm particularly interested in{' '}
                                <span className="text-blue-400"> startups, early-stage tech companies, and agencies</span> where I can learn and contribute meaningfully.
                            </p>
                        </div>
                    </div>

                    {/* My Journey */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56 5.84a14.98 14.98 0 00-2.58-5.96m0 0a14.98 14.98 0 00-5.96-2.58" /></svg>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400">My Journey</h2>
                        </div>
                        <div className="space-y-4 text-slate-300 text-base sm:text-lg leading-relaxed">
                            <p>
                                My tech journey started with <span className="text-blue-400 font-semibold">Python and web projects</span>.
                                As I dove deeper, I realized how powerful <span className="text-purple-400 font-semibold">data + logic</span> can be
                                in solving real-world problems.
                            </p>
                            <p>
                                Small experiments with <span className="text-cyan-400 font-semibold">data analysis and ML concepts</span> sparked
                                my interest in AI/Data Science. The ability to make machines learn and predict outcomes fascinated me,
                                and there's been no looking back since!
                            </p>
                        </div>
                    </div>

                    {/* Goals & Vision */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02] animate-slideRight">
                            <div className="flex items-center gap-3 mb-6">
                                <svg className="w-9 h-9 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                                <h2 className="text-2xl font-bold text-cyan-400">Future Vision</h2>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                In 3-5 years, I see myself working as a{' '}
                                <span className="text-cyan-400 font-semibold">Data Scientist / AI Engineer</span>,
                                building impactful tech products and contributing to real-world problem solving.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] animate-slideRight" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <svg className="w-9 h-9 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                                <h2 className="text-2xl font-bold text-blue-400">Problems I Solve</h2>
                            </div>
                            <div className="space-y-2 text-slate-300">
                                <p className="flex items-start gap-2">
                                    <span className="text-cyan-400 mt-1">▹</span>
                                    <span>Automation & data-driven decision making</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">▹</span>
                                    <span>Security challenges</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">▹</span>
                                    <span>Efficiency in education & business</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Work Style & Learning */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] animate-slideUp" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <svg className="w-9 h-9 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                                <h2 className="text-2xl font-bold text-purple-400">Work Style</h2>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed mb-4">
                                I'm flexible with both <span className="text-purple-400 font-semibold">solo and team work</span>:
                            </p>
                            <div className="space-y-3 text-slate-300">
                                <p className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" /></svg>
                                    <span><strong className="text-cyan-400">Alone:</strong> Deep focus & concentration</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                                    <span><strong className="text-blue-400">Teams:</strong> Brainstorming & building bigger projects</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] animate-slideUp" style={{ animationDelay: '0.3s' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <svg className="w-9 h-9 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                                <h2 className="text-2xl font-bold text-blue-400">Learning Style</h2>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed mb-4">
                                I learn best by <span className="text-blue-400 font-semibold">doing</span>:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm">Hands-on Projects</span>
                                <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm">YouTube</span>
                                <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-sm">Documentation</span>
                                <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm">Courses</span>
                                <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm">Self-Experiments</span>
                            </div>
                        </div>
                    </div>

                    {/* Beyond Coding */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02] animate-slideUp" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <svg className="w-9 h-9 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" /></svg>
                            <h2 className="text-3xl font-bold text-cyan-400">Beyond Coding</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 text-slate-300 text-lg">
                            <div>
                                <p className="mb-4 leading-relaxed">
                                    When I'm not coding, I enjoy <span className="text-cyan-400 font-semibold">exploring new tech trends</span>,
                                    experimenting with <span className="text-purple-400 font-semibold">AI tools</span>,{' '}
                                    <span className="text-blue-400 font-semibold">content creation</span>, and
                                    sometimes casual <span className="text-cyan-400 font-semibold">gaming</span>.
                                </p>
                            </div>
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                                <p className="text-blue-400 font-semibold mb-2">When Stuck on a Problem:</p>
                                <p className="text-sm leading-relaxed">
                                    Break it down → Debug step-by-step → Check docs → Search smartly → Retry with a fresh approach
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Fun Facts & Achievements */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] animate-slideRight" style={{ animationDelay: '0.5s' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <svg className="w-9 h-9 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
                                <h2 className="text-2xl font-bold text-blue-400">Fun Fact</h2>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                I enjoy building <span className="text-blue-400 font-semibold">long-term learning streaks</span> and
                                consistently improving <span className="text-purple-400 font-semibold">one small thing every day</span>.
                                Progress over perfection!
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-[1.02] animate-slideRight" style={{ animationDelay: '0.6s' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <svg className="w-9 h-9 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>
                                <h2 className="text-2xl font-bold text-purple-400">Proud Of</h2>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                Building multiple{' '}
                                <span className="text-cyan-400 font-semibold">full-stack, Python, and AI projects</span>{' '}
                                while maintaining long learning streaks on{' '}
                                <span className="text-purple-400 font-semibold">GitHub</span> and{' '}
                                <span className="text-blue-400 font-semibold">LinkedIn</span>.
                            </p>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-slate-600/50 text-center animate-fadeIn" style={{ animationDelay: '0.7s' }}>
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Let's Build Something Amazing Together!
                        </h3>
                        <p className="text-slate-300 text-lg mb-6">
                            I'm always excited to collaborate on innovative projects and learn from others.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <a href="/projects" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full font-semibold transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-blue-500/50">
                                View My Projects
                            </a>
                            <a href="/contact" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-full font-semibold transition-all duration-300 hover:scale-110">
                                Get In Touch
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About

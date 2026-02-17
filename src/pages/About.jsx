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
                        🎓 BCA Student from Lucknow | 🤖 AI/ML Certified by IIT Mandi | 🐍 Python & Full Stack Developer
                        <br className="hidden sm:block" />
                        <span className="text-green-400 font-semibold mt-3 sm:mt-2 inline-block">
                            ✅ Open for Internships | Entry-Level Roles | Freelance Projects
                        </span>
                    </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-700/50 mb-8 sm:mb-12 animate-slideDown">
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-300">
                        <div className="flex items-center gap-2 text-center sm:text-left">
                            <span className="text-2xl sm:text-3xl">🎓</span>
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
                            <span className="text-2xl sm:text-3xl">🤖</span>
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
                            📊 My Coding Stats
                        </h3>
                        <p className="text-slate-400 text-sm md:text-base">
                            Consistency is key - Track my journey through numbers
                        </p>
                    </div>
                    <StatsCards />
                </div>

                {/* Main Content Grid */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Who I Am Section */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] animate-slideUp">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl sm:text-4xl md:text-5xl">👨‍💻</span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400">Who I Am</h2>
                        </div>
                        <div className="space-y-4 text-slate-300 text-base sm:text-lg leading-relaxed">
                            <p>
                                Hi! I'm <span className="text-blue-400 font-semibold">Gaurav Kumar Yadav</span>, a BCA 2nd year student from
                                <span className="text-green-400 font-semibold"> Lucknow, India</span> with a passion for
                                <span className="text-purple-400"> Python Development</span>,
                                <span className="text-cyan-400"> Data Science</span>,
                                <span className="text-blue-400"> AI/Machine Learning</span>, and
                                <span className="text-pink-400"> Full Stack Web Development</span>.
                            </p>
                            <p>
                                I'm currently pursuing <span className="text-purple-400 font-semibold">AI & Data Science certification from IIT Mandi × Masai School</span>,
                                combining academic knowledge with practical, industry-relevant skills. I focus on building real-world projects that solve actual problems,
                                not just copying tutorials.
                            </p>
                            <p>
                                💼 I'm actively seeking <span className="text-green-400 font-semibold">internships, entry-level positions, and freelance opportunities</span>
                                where I can apply my skills in Python, AI/ML, Data Analysis, and Full Stack Development. I'm particularly interested in
                                <span className="text-blue-400"> startups, early-stage tech companies, and agencies</span> where I can learn and contribute meaningfully.
                            </p>
                        </div>
                    </div>

                    {/* My Journey */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl sm:text-4xl md:text-5xl">🚀</span>
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
                                <span className="text-4xl">🎯</span>
                                <h2 className="text-2xl font-bold text-cyan-400">Future Vision</h2>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                In 3-5 years, I see myself working as a
                                <span className="text-cyan-400 font-semibold"> Data Scientist / AI Engineer</span>,
                                building impactful tech products and contributing to real-world problem solving.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] animate-slideRight" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-4xl">💡</span>
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
                                <span className="text-4xl">⚡</span>
                                <h2 className="text-2xl font-bold text-purple-400">Work Style</h2>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed mb-4">
                                I'm flexible with both <span className="text-purple-400 font-semibold">solo and team work</span>:
                            </p>
                            <div className="space-y-3 text-slate-300">
                                <p className="flex items-start gap-2">
                                    <span className="text-cyan-400">🧠</span>
                                    <span><strong className="text-cyan-400">Alone:</strong> Deep focus & concentration</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-400">🤝</span>
                                    <span><strong className="text-blue-400">Teams:</strong> Brainstorming & building bigger projects</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] animate-slideUp" style={{ animationDelay: '0.3s' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-4xl">📚</span>
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
                            <span className="text-4xl">🎮</span>
                            <h2 className="text-3xl font-bold text-cyan-400">Beyond Coding</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 text-slate-300 text-lg">
                            <div>
                                <p className="mb-4 leading-relaxed">
                                    When I'm not coding, I enjoy <span className="text-cyan-400 font-semibold">exploring new tech trends</span>,
                                    experimenting with <span className="text-purple-400 font-semibold">AI tools</span>,
                                    <span className="text-blue-400 font-semibold"> content creation</span>, and
                                    sometimes casual <span className="text-cyan-400 font-semibold">gaming</span>.
                                </p>
                            </div>
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                                <p className="text-blue-400 font-semibold mb-2">🐛 When Stuck on a Problem:</p>
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
                                <span className="text-4xl">✨</span>
                                <h2 className="text-2xl font-bold text-blue-400">Fun Fact</h2>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                I enjoy building <span className="text-blue-400 font-semibold">long-term learning streaks</span> and
                                consistently improving <span className="text-purple-400 font-semibold">one small thing every day</span>.
                                Progress over perfection! 📈
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-[1.02] animate-slideRight" style={{ animationDelay: '0.6s' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-4xl">🏆</span>
                                <h2 className="text-2xl font-bold text-purple-400">Proud Of</h2>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                Building multiple <span className="text-cyan-400 font-semibold">full-stack, Python, and AI projects</span>
                                while maintaining long learning streaks on
                                <span className="text-purple-400 font-semibold"> GitHub</span> and
                                <span className="text-blue-400 font-semibold"> LinkedIn</span>. 🚀
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

function Links() {
    const socialLinks = [
        {
            name: "GitHub",
            username: "@ggauravky",
            url: "https://github.com/ggauravky",
            icon: "🐙",
            color: "from-purple-500 to-pink-500",
            description: "Check out my code and projects"
        },
        {
            name: "LinkedIn",
            username: "@gauravky",
            url: "https://www.linkedin.com/in/gauravky/",
            icon: "💼",
            color: "from-blue-600 to-cyan-500",
            description: "Connect professionally"
        },
        {
            name: "LeetCode",
            username: "@gauravky",
            url: "https://leetcode.com/u/gauravky/",
            icon: "💻",
            color: "from-orange-500 to-yellow-500",
            description: "View my coding solutions"
        },
        {
            name: "GeeksforGeeks",
            username: "@gauravky",
            url: "https://www.geeksforgeeks.org/profile/gauravky",
            icon: "🌟",
            color: "from-green-500 to-emerald-500",
            description: "Explore my GFG profile"
        },
        {
            name: "Kaggle",
            username: "@kgauravky",
            url: "https://www.kaggle.com/kgauravky",
            icon: "📊",
            color: "from-cyan-500 to-blue-500",
            description: "Data science & ML projects"
        },
        {
            name: "Twitter (X)",
            username: "@xgauravky",
            url: "https://x.com/xgauravky",
            icon: "𝕏",
            color: "from-slate-600 to-slate-800",
            description: "Follow my tech journey"
        },
        {
            name: "Instagram",
            username: "@the_gau_rav",
            url: "https://www.instagram.com/the_gau_rav/",
            icon: "📸",
            color: "from-pink-500 to-purple-500",
            description: "Behind the scenes"
        }
    ]

    return (
        <div className="min-h-screen bg-slate-900 px-6 py-16 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16 animate-fadeIn">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Find Me
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Let's connect across different platforms 🌐
                    </p>
                </div>

                {/* Links Grid */}
                <div className="space-y-4">
                    {socialLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-slideUp"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-center gap-5">
                                {/* Icon */}
                                <div className={`text-5xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                    {link.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${link.color} bg-clip-text text-transparent mb-1`}>
                                        {link.name}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-1">{link.username}</p>
                                    <p className="text-slate-500 text-sm">{link.description}</p>
                                </div>

                                {/* Arrow */}
                                <div className="text-slate-400 group-hover:text-purple-400 group-hover:translate-x-2 transition-all duration-300 flex-shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Footer Card */}
                <div className="mt-16 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 text-center animate-fadeIn" style={{ animationDelay: '0.8s' }}>
                    <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Let's Build Something Amazing! 🚀
                    </h3>
                    <p className="text-slate-300 text-lg mb-6">
                        Feel free to reach out for collaborations, questions, or just to say hi!
                    </p>
                    <a
                        href="/contact"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full font-semibold transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-purple-500/50"
                    >
                        Get In Touch →
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Links

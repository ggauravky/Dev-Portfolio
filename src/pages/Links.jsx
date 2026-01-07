import useSEO from '../hooks/useSEO'

function Links() {
    useSEO({
        title: 'Find Me Online - Gaurav Kumar Yadav | Social Links',
        description: 'Connect with Gaurav Kumar Yadav on various platforms. Find me on GitHub, LinkedIn, Instagram, Twitter, and more. Let\'s connect and collaborate!',
        keywords: 'Social Links, GitHub ggauravky, LinkedIn Gaurav Kumar Yadav, Developer Social Media, Connect with Developer',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    const socialLinks = [
        {
            name: "GitHub",
            username: "@ggauravky",
            url: "https://github.com/ggauravky",
            icon: "🐙",
            gradient: "from-purple-600 via-pink-600 to-purple-700",
            hoverGradient: "from-purple-500 via-pink-500 to-purple-600",
            description: "Open source projects & code",
            stats: "50+ Repositories"
        },
        {
            name: "LinkedIn",
            username: "@gauravky",
            url: "https://www.linkedin.com/in/gauravky/",
            icon: "💼",
            gradient: "from-blue-700 via-blue-600 to-cyan-600",
            hoverGradient: "from-blue-600 via-blue-500 to-cyan-500",
            description: "Professional network & updates",
            stats: "Let's Connect"
        },
        {
            name: "WhatsApp",
            username: "+91 8542036499",
            url: "https://wa.me/918542036499",
            icon: "💬",
            gradient: "from-green-600 via-green-500 to-emerald-600",
            hoverGradient: "from-green-500 via-green-400 to-emerald-500",
            description: "Chat with me directly",
            stats: "Quick Response"
        },
        {
            name: "LeetCode",
            username: "@gauravky",
            url: "https://leetcode.com/u/gauravky/",
            icon: "💻",
            gradient: "from-orange-600 via-yellow-600 to-orange-700",
            hoverGradient: "from-orange-500 via-yellow-500 to-orange-600",
            description: "Coding challenges & solutions",
            stats: "Problem Solver"
        },
        {
            name: "GeeksforGeeks",
            username: "@gauravky",
            url: "https://www.geeksforgeeks.org/profile/gauravky",
            icon: "🌟",
            gradient: "from-green-600 via-emerald-600 to-green-700",
            hoverGradient: "from-green-500 via-emerald-500 to-green-600",
            description: "DSA practice & learning",
            stats: "Active Learner"
        },
        {
            name: "Kaggle",
            username: "@kgauravky",
            url: "https://www.kaggle.com/kgauravky",
            icon: "📊",
            gradient: "from-cyan-600 via-blue-600 to-cyan-700",
            hoverGradient: "from-cyan-500 via-blue-500 to-cyan-600",
            description: "Data science & ML competitions",
            stats: "Data Enthusiast"
        },
        {
            name: "Twitter (X)",
            username: "@xgauravky",
            url: "https://x.com/xgauravky",
            icon: "𝕏",
            gradient: "from-slate-700 via-slate-800 to-slate-900",
            hoverGradient: "from-slate-600 via-slate-700 to-slate-800",
            description: "Tech updates & thoughts",
            stats: "Follow Me"
        },
        {
            name: "Instagram",
            username: "@the_gau_rav",
            url: "https://www.instagram.com/the_gau_rav/",
            icon: "📸",
            gradient: "from-pink-600 via-purple-600 to-pink-700",
            hoverGradient: "from-pink-500 via-purple-500 to-pink-600",
            description: "Life beyond code",
            stats: "Behind The Scenes"
        }
    ]

    return (
        <div className="min-h-screen bg-slate-900 px-4 sm:px-6 py-16 relative overflow-x-hidden w-full">
            {/* Animated Background */}
            <div className="absolute top-20 -right-20 sm:right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 -left-20 sm:left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-fadeIn">
                    <div className="inline-block mb-4">
                        <span className="text-5xl">🌐</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Let's Connect
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
                        Find me across the web - I'm just a click away!
                    </p>
                </div>

                {/* Social Links Grid */}
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
                    {socialLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-transparent transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden animate-slideUp"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">
                                                {link.name}
                                            </h3>
                                            <p className="text-slate-400 group-hover:text-slate-200 text-sm transition-colors">{link.username}</p>
                                        </div>
                                    </div>
                                    <div className="text-slate-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-slate-400 group-hover:text-slate-100 text-sm mb-2 transition-colors">{link.description}</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 bg-green-400 rounded-full group-hover:animate-pulse"></div>
                                    <span className="text-xs text-slate-500 group-hover:text-slate-300 font-medium transition-colors">{link.stats}</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 text-center hover:scale-105 transition-all duration-300">
                        <div className="text-3xl font-bold text-purple-400 mb-1">8+</div>
                        <div className="text-slate-300 text-sm">Platforms</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm p-6 rounded-2xl border border-pink-500/30 text-center hover:scale-105 transition-all duration-300">
                        <div className="text-3xl font-bold text-pink-400 mb-1">24/7</div>
                        <div className="text-slate-300 text-sm">Available</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-sm p-6 rounded-2xl border border-cyan-500/30 text-center hover:scale-105 transition-all duration-300">
                        <div className="text-3xl font-bold text-cyan-400 mb-1">100%</div>
                        <div className="text-slate-300 text-sm">Responsive</div>
                    </div>
                </div>

                {/* CTA Card */}
                <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 text-center">
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                        Let's Create Something Awesome!
                    </h3>
                    <p className="text-slate-300 text-lg mb-6 max-w-xl mx-auto">
                        Have a project idea or just want to chat? Feel free to reach out!
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full font-semibold transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-purple-500/50"
                    >
                        <span>Send Message</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Links

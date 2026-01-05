function Links() {
    const socialLinks = [
        {
            name: "GitHub",
            url: "https://github.com/ggauravky",
            icon: "💻",
            color: "from-blue-500 to-cyan-500"
        },
        {
            name: "LinkedIn",
            url: "#",
            icon: "💼",
            color: "from-blue-600 to-blue-400"
        },
        {
            name: "Twitter",
            url: "#",
            icon: "🐦",
            color: "from-cyan-500 to-blue-500"
        },
        {
            name: "Email",
            url: "mailto:your@email.com",
            icon: "📧",
            color: "from-purple-500 to-pink-500"
        },
        {
            name: "Instagram",
            url: "#",
            icon: "📸",
            color: "from-pink-500 to-purple-500"
        },
        {
            name: "YouTube",
            url: "#",
            icon: "🎥",
            color: "from-red-500 to-pink-500"
        }
    ]

    return (
        <div className="min-h-screen bg-slate-900 px-6 py-16">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    My Links
                </h1>
                <p className="text-center text-slate-400 text-lg mb-12">
                    Connect with me on social media
                </p>

                <div className="space-y-4">
                    {socialLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <span className="text-4xl">{link.icon}</span>
                            <span className={`text-xl font-semibold bg-gradient-to-r ${link.color} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200`}>
                                {link.name}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Links

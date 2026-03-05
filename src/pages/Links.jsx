// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

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
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
            gradient: "from-purple-600 via-pink-600 to-purple-700",
            hoverGradient: "from-purple-500 via-pink-500 to-purple-600",
            description: "Open source projects & code",
            stats: "50+ Repositories"
        },
        {
            name: "LinkedIn",
            username: "@gauravky",
            url: "https://www.linkedin.com/in/gauravky/",
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
            gradient: "from-blue-700 via-blue-600 to-cyan-600",
            hoverGradient: "from-blue-600 via-blue-500 to-cyan-500",
            description: "Professional network & updates",
            stats: "Let's Connect"
        },
        {
            name: "WhatsApp",
            username: "+91 8542036499",
            url: "https://wa.me/918542036499",
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
            gradient: "from-green-600 via-green-500 to-emerald-600",
            hoverGradient: "from-green-500 via-green-400 to-emerald-500",
            description: "Chat with me directly",
            stats: "Quick Response"
        },
        {
            name: "LeetCode",
            username: "@gauravky",
            url: "https://leetcode.com/u/gauravky/",
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>,
            gradient: "from-orange-600 via-yellow-600 to-orange-700",
            hoverGradient: "from-orange-500 via-yellow-500 to-orange-600",
            description: "Coding challenges & solutions",
            stats: "Problem Solver"
        },
        {
            name: "GeeksforGeeks",
            username: "@gauravky",
            url: "https://www.geeksforgeeks.org/profile/gauravky",
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M21.45 14.315c-.143.28-.334.532-.565.745a3.691 3.691 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116-.016 3.79 3.79 0 0 1-2.135-2.078 3.571 3.571 0 0 1-.13-.353h7.418a4.26 4.26 0 0 1-.368 1.008zm-11.99-.654a3.793 3.793 0 0 1-2.134 2.078 4.51 4.51 0 0 1-3.117.016 3.7 3.7 0 0 1-1.104-.695 2.652 2.652 0 0 1-.564-.745 4.221 4.221 0 0 1-.368-1.006H9.59c-.038.12-.08.238-.13.352zm14.501-1.758a3.849 3.849 0 0 0-.082-.475l-9.634-.008a3.932 3.932 0 0 1 1.143-2.348c.363-.35.79-.625 1.26-.809a3.97 3.97 0 0 1 4.484.957l1.521-1.49a5.7 5.7 0 0 0-1.922-1.357 6.283 6.283 0 0 0-2.544-.49 6.35 6.35 0 0 0-2.405.457 6.007 6.007 0 0 0-1.963 1.276 6.142 6.142 0 0 0-1.325 1.94 5.862 5.862 0 0 0-.466 1.864h-.063a5.857 5.857 0 0 0-.467-1.865 6.13 6.13 0 0 0-1.325-1.939A6 6 0 0 0 8.21 6.34a6.698 6.698 0 0 0-4.949.031A5.708 5.708 0 0 0 1.34 7.73l1.52 1.49a4.166 4.166 0 0 1 4.484-.958c.47.184.898.46 1.26.81.368.36.66.792.859 1.268.146.344.242.708.285 1.08l-9.635.008A4.714 4.714 0 0 0 0 12.457a6.493 6.493 0 0 0 .345 2.127 4.927 4.927 0 0 0 1.08 1.783c.528.56 1.17 1 1.88 1.293a6.454 6.454 0 0 0 2.504.457c.824.005 1.64-.15 2.404-.457a5.986 5.986 0 0 0 1.964-1.277 6.116 6.116 0 0 0 1.686-3.076h.273a6.13 6.13 0 0 0 1.686 3.077 5.99 5.99 0 0 0 1.964 1.276 6.345 6.345 0 0 0 2.405.457 6.45 6.45 0 0 0 2.502-.457 5.42 5.42 0 0 0 1.882-1.293 4.928 4.928 0 0 0 1.08-1.783A6.52 6.52 0 0 0 24 12.457a4.757 4.757 0 0 0-.039-.554z"/></svg>,
            gradient: "from-green-600 via-emerald-600 to-green-700",
            hoverGradient: "from-green-500 via-emerald-500 to-green-600",
            description: "DSA practice & learning",
            stats: "Active Learner"
        },
        {
            name: "Kaggle",
            username: "@kgauravky",
            url: "https://www.kaggle.com/kgauravky",
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.285.18.046.149.034.255-.036.315l-6.555 6.344 6.836 8.507c.095.104.117.208.011.336z"/></svg>,
            gradient: "from-cyan-600 via-blue-600 to-cyan-700",
            hoverGradient: "from-cyan-500 via-blue-500 to-cyan-600",
            description: "Data science & ML competitions",
            stats: "Data Enthusiast"
        },
        {
            name: "Twitter (X)",
            username: "@xgauravky",
            url: "https://x.com/xgauravky",
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
            gradient: "from-slate-700 via-slate-800 to-slate-900",
            hoverGradient: "from-slate-600 via-slate-700 to-slate-800",
            description: "Tech updates & thoughts",
            stats: "Follow Me"
        },
        {
            name: "Instagram",
            username: "@the_gau_rav",
            url: "https://www.instagram.com/the_gau_rav/",
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 3.252.148 4.771 1.691 4.919 4.919.049 1.265.064 1.645.064 4.849 0 3.205-.015 3.585-.074 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.072-4.85.072-3.204 0-3.584-.014-4.849-.072-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.072-1.644-.072-4.849 0-3.204.013-3.583.072-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.071 4.849-.071zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
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
                                        <div className="group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">{link.icon}</div>
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
                <div className="grid grid-cols-3 gap-4 mb-8">
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

                {/* Resume Download Card */}
                <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-cyan-500/30 mb-12 hover:border-cyan-400/50 transition-all duration-300">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="text-5xl">📄</div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                    Want to Know More?
                                </h3>
                                <p className="text-slate-300">
                                    Download my resume for complete details
                                </p>
                            </div>
                        </div>
                        <a
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/30 whitespace-nowrap"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Resume
                        </a>
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

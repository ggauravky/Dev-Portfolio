import useSEO from '../hooks/useSEO'
import './Lab.css'

function Lab() {
    useSEO({
        title: 'Lab - Gaurav Portfolio | AI, ML & Experimental Features',
        description: 'Welcome to the Lab — an experimental space with AI demos, ML projects, and interactive tools built by Gaurav Kumar Yadav. Something exciting is coming soon.',
        keywords: 'Gaurav Portfolio Lab, AI Demos, ML Experiments, Chatbot, Machine Learning, Interactive Tools, Experimental Features, Developer Lab',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    return (
        <main className="min-h-screen bg-slate-900 py-16 sm:py-20 px-4">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-semibold mb-6 animate-pulse">
                        <span>🚧</span>
                        <span>Work in Progress</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            ⚡ Lab
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
                        Something exciting is coming soon. Stay tuned.
                    </p>
                </div>

                {/* Coming Soon Cards — placeholder sections for future features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                    {[
                        { icon: '🤖', title: 'AI Chatbot', desc: 'An interactive chatbot powered by large language models.' },
                        { icon: '📊', title: 'ML Demos', desc: 'Live machine learning model demonstrations and visualizations.' },
                        { icon: '📈', title: 'Consistency Dashboard', desc: 'Track coding streaks, GitHub activity, and learning progress.' },
                        { icon: '🧪', title: 'Experimental Features', desc: 'A sandbox for testing new ideas and cutting-edge technologies.' },
                    ].map(({ icon, title, desc }) => (
                        <div
                            key={title}
                            className="group relative p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-purple-500/40 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 overflow-hidden"
                        >
                            {/* hover glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                            <div className="relative">
                                <span className="text-3xl mb-3 block">{icon}</span>
                                <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                            </div>

                            {/* Coming soon pill */}
                            <span className="absolute top-4 right-4 text-xs px-2 py-1 bg-slate-700/80 text-slate-400 rounded-full border border-slate-600/50">
                                Coming Soon
                            </span>
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <p className="text-center text-slate-500 text-sm mt-12">
                    This space is actively being built. Check back soon!
                </p>
            </div>
        </main>
    )
}

export default Lab

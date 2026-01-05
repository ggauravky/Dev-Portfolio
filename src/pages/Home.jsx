function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
                {/* Left side - Text content */}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Gaurav Kumar Yadav
                    </h1>
                    <div className="space-y-2 mb-6">
                        <p className="text-2xl md:text-3xl text-blue-300 font-semibold">AI / Data Scientist</p>
                        <p className="text-2xl md:text-3xl text-purple-300 font-semibold">Python Developer</p>
                        <p className="text-2xl md:text-3xl text-cyan-300 font-semibold">Web Developer</p>
                    </div>
                    <p className="text-xl text-slate-400 mt-6">
                        Building intelligent solutions with code
                    </p>
                </div>

                {/* Right side - Photo */}
                <div className="flex-1 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full blur-2xl opacity-30"></div>
                        <img
                            src="/images/profile.jpg"
                            alt="Gaurav Kumar"
                            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full object-cover border-4 border-slate-700 shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home

function About() {
    return (
        <div className="min-h-screen bg-slate-900 px-6 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    About Me
                </h1>

                <div className="space-y-8">
                    <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors duration-300">
                        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Who I Am</h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Hi! I'm Gaurav Kumar Yadav, a BCA 2nd year student passionate about
                            Artificial Intelligence, Data Science, and Software Development.
                        </p>
                        <p className="text-slate-300 leading-relaxed">
                            I love solving problems with code and building things that make
                            a difference. Currently, I'm focused on learning AI/ML technologies
                            and improving my Python skills.
                        </p>
                    </div>

                    <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 hover:border-purple-500 transition-colors duration-300">
                        <h2 className="text-2xl font-semibold mb-4 text-purple-400">What I Do</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                <strong className="text-blue-400">AI & Data Science:</strong> Working with machine learning
                                models, data analysis, and exploring deep learning concepts.
                            </p>
                            <p>
                                <strong className="text-purple-400">Python Development:</strong> Building scripts, automation
                                tools, and backend applications using Python.
                            </p>
                            <p>
                                <strong className="text-cyan-400">Web Development:</strong> Creating websites and web applications
                                using modern technologies like React.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors duration-300">
                        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Currnpm ently Learning</h2>
                        <ul className="space-y-3 text-slate-300">
                            <li className="flex items-center gap-3">
                                <span className="text-blue-400">▹</span>
                                Machine Learning & Deep Learning
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-purple-400">▹</span>
                                Data Analysis with Python
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-cyan-400">▹</span>
                                Web Development (React, Node.js)
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-blue-400">▹</span>
                                Database Management
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About

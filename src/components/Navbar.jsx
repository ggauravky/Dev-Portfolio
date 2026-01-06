import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                        Gaurav 
                    </Link>

                    <div className="flex gap-8">
                        <Link to="/" className="text-slate-300 hover:text-blue-400 transition-colors duration-200">
                            Home
                        </Link>
                        <Link to="/about" className="text-slate-300 hover:text-blue-400 transition-colors duration-200">
                            About
                        </Link>
                        <Link to="/skills" className="text-slate-300 hover:text-blue-400 transition-colors duration-200">
                            Skills
                        </Link>
                        <Link to="/projects" className="text-slate-300 hover:text-blue-400 transition-colors duration-200">
                            Projects
                        </Link>
                        <Link to="/contact" className="text-slate-300 hover:text-blue-400 transition-colors duration-200">
                            Contact
                        </Link>
                        <Link to="/links" className="text-slate-300 hover:text-blue-400 transition-colors duration-200">
                            Links
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar

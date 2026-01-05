import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'

// Import pages
import Home from './pages/Home'
import About from './pages/About'
import Skills from './pages/Skills'
import Projects from './pages/Projects'
import Contact from './pages/Contact'
import Links from './pages/Links'

function App() {
    return (
        <Router>
            <div className="App">
                {/* Simple navigation bar */}
                <nav style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                    <Link to="/" style={{ margin: '0 10px' }}>Home</Link>
                    <Link to="/about" style={{ margin: '0 10px' }}>About</Link>
                    <Link to="/skills" style={{ margin: '0 10px' }}>Skills</Link>
                    <Link to="/projects" style={{ margin: '0 10px' }}>Projects</Link>
                    <Link to="/contact" style={{ margin: '0 10px' }}>Contact</Link>
                    <Link to="/links" style={{ margin: '0 10px' }}>Links</Link>
                </nav>

                {/* Routes */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/skills" element={<Skills />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/links" element={<Links />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App

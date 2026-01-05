import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Import components
import Navbar from './components/Navbar'

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
                <Navbar />

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

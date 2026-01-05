import './Skills.css'

function Skills() {
    return (
        <div className="skills-container">
            <div className="skills-content">
                <h1>My Skills</h1>

                <div className="skills-category">
                    <h2>AI & Data Science</h2>
                    <div className="skills-list">
                        <span className="skill-item">Python</span>
                        <span className="skill-item">Machine Learning</span>
                        <span className="skill-item">Data Analysis</span>
                        <span className="skill-item">Pandas</span>
                        <span className="skill-item">NumPy</span>
                        <span className="skill-item">Scikit-learn</span>
                    </div>
                </div>

                <div className="skills-category">
                    <h2>Programming Languages</h2>
                    <div className="skills-list">
                        <span className="skill-item">Python</span>
                        <span className="skill-item">JavaScript</span>
                        <span className="skill-item">C</span>
                        <span className="skill-item">C++</span>
                        <span className="skill-item">SQL</span>
                    </div>
                </div>

                <div className="skills-category">
                    <h2>Web Development</h2>
                    <div className="skills-list">
                        <span className="skill-item">HTML</span>
                        <span className="skill-item">CSS</span>
                        <span className="skill-item">JavaScript</span>
                        <span className="skill-item">React</span>
                        <span className="skill-item">Node.js</span>
                        <span className="skill-item">Git & GitHub</span>
                    </div>
                </div>

                <div className="skills-category">
                    <h2>Tools & Technologies</h2>
                    <div className="skills-list">
                        <span className="skill-item">VS Code</span>
                        <span className="skill-item">Jupyter Notebook</span>
                        <span className="skill-item">Git</span>
                        <span className="skill-item">MongoDB</span>
                        <span className="skill-item">MySQL</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Skills

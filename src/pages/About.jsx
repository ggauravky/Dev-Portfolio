import './About.css'

function About() {
    return (
        <div className="about-container">
            <div className="about-content">
                <h1>About Me</h1>

                <div className="about-section">
                    <h2>Who I Am</h2>
                    <p>
                        Hi! I'm Gaurav Kumar, a BCA 2nd year student passionate about
                        Artificial Intelligence, Data Science, and Software Development.
                    </p>
                    <p>
                        I love solving problems with code and building things that make
                        a difference. Currently, I'm focused on learning AI/ML technologies
                        and improving my Python skills.
                    </p>
                </div>

                <div className="about-section">
                    <h2>What I Do</h2>
                    <p>
                        <strong>AI & Data Science:</strong> Working with machine learning
                        models, data analysis, and exploring deep learning concepts.
                    </p>
                    <p>
                        <strong>Python Development:</strong> Building scripts, automation
                        tools, and backend applications using Python.
                    </p>
                    <p>
                        <strong>Web Development:</strong> Creating websites and web applications
                        using modern technologies like React.
                    </p>
                </div>

                <div className="about-section">
                    <h2>Currently Learning</h2>
                    <ul>
                        <li>Machine Learning & Deep Learning</li>
                        <li>Data Analysis with Python</li>
                        <li>Web Development (React, Node.js)</li>
                        <li>Database Management</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default About

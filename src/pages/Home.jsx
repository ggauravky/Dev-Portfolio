import './Home.css'

function Home() {
    return (
        <div className="home-container">
            <div className="home-content">
                {/* Left side - Text content */}
                <div className="home-text">
                    <h1 className="home-name">Gaurav Kumar</h1>
                    <div className="home-designation">
                        <p>AI / Data Scientist</p>
                        <p>Python Developer</p>
                        <p>Web Developer</p>
                    </div>
                    <p className="home-tagline">
                        Building intelligent solutions with code
                    </p>
                </div>

                {/* Right side - Photo */}
                <div className="home-photo">
                    <img
                        src="https://via.placeholder.com/300"
                        alt="Profile"
                        className="profile-image"
                    />
                </div>
            </div>
        </div>
    )
}

export default Home

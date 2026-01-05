function Contact() {
    const handleSubmit = (e) => {
        e.preventDefault()
        // For now, just log - we'll add backend later
        console.log('Form submitted')
        alert('Form submitted! (Backend will be added later)')
    }

    return (
        <div className="min-h-screen bg-slate-900 px-6 py-16">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Get In Touch
                </h1>
                <p className="text-center text-slate-400 text-lg mb-12">
                    Have a question or want to work together? Feel free to reach out!
                </p>

                <form className="bg-slate-800 border border-slate-700 rounded-lg p-8" onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="name" className="block text-slate-300 font-medium mb-2">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="Your name"
                            className="w-full bg-slate-900 border border-slate-700 text-slate-300 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="email" className="block text-slate-300 font-medium mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="your@email.com"
                            className="w-full bg-slate-900 border border-slate-700 text-slate-300 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="message" className="block text-slate-300 font-medium mb-2">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            rows="5"
                            required
                            placeholder="Your message here..."
                            className="w-full bg-slate-900 border border-slate-700 text-slate-300 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 resize-none"
                        ></textarea>
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Contact

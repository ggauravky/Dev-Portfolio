import useSEO from '../hooks/useSEO'
import './Legal.css'

function Privacy() {
    useSEO({
        title: 'Privacy Policy - Gaurav Kumar Yadav | Data Protection & Privacy',
        description: 'Privacy Policy for Gaurav Kumar Yadav\'s portfolio website. Learn how we collect, use, and protect your personal information when you visit our site or contact us.',
        keywords: 'Privacy Policy, Data Protection, Personal Information, GDPR, Website Privacy, Portfolio Privacy',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    return (
        <div className="min-h-screen bg-slate-900 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-20 right-5 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-5 sm:left-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent px-2">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg">
                        Last Updated: January 8, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="legal-content bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl sm:rounded-2xl border border-slate-700/50 space-y-6 sm:space-y-8">

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-400 flex items-center gap-2">
                            <span className="text-2xl sm:text-3xl">🔒</span>
                            <span className="break-words">Introduction</span>
                        </h2>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            Welcome to my portfolio website. I respect your privacy and am committed to protecting your personal data.
                            This privacy policy explains how I collect, use, and safeguard your information when you visit
                            <span className="text-blue-400 font-semibold"> ggauravky.vercel.app</span>.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                            <span>📊</span> Information I Collect
                        </h2>
                        <div className="space-y-3 text-slate-300">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-200">Information You Provide:</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base ml-2 sm:ml-4">
                                <li><strong>Contact Form:</strong> Name, email address, subject, and message when you reach out via the contact form</li>
                                <li><strong>Email Communication:</strong> Any additional information you choose to share in emails</li>
                            </ul>

                            <h3 className="text-base sm:text-lg font-semibold text-slate-200 mt-4">Automatically Collected Information:</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base ml-2 sm:ml-4">
                                <li><strong>Analytics Data:</strong> Basic usage data through Google Analytics (page views, time spent, device type)</li>
                                <li><strong>Technical Data:</strong> IP address, browser type, operating system, referral source</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-cyan-400 flex items-center gap-2">
                            <span className="text-2xl sm:text-3xl">🎯</span>
                            <span className="break-words">How I Use Your Information</span>
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm sm:text-base ml-2 sm:ml-4">
                            <li>To respond to your inquiries and communication</li>
                            <li>To improve website functionality and user experience</li>
                            <li>To analyze website traffic and usage patterns</li>
                            <li>To consider you for potential collaboration or job opportunities</li>
                            <li>To comply with legal obligations if required</li>
                        </ul>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-green-400 flex items-center gap-2">
                            <span className="text-2xl sm:text-3xl">🔐</span>
                            <span className="break-words">Data Security</span>
                        </h2>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            I implement appropriate security measures to protect your personal information:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Contact form data is sent via secure HTTPS connection</li>
                            <li>Email addresses are never shared with third parties</li>
                            <li>Data is stored securely and accessed only when necessary</li>
                            <li>No sensitive information (passwords, financial data) is collected</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-pink-400 flex items-center gap-2">
                            <span>🍪</span> Cookies & Tracking
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            This website uses minimal tracking technologies:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Google Analytics:</strong> For understanding visitor behavior and improving content</li>
                            <li><strong>Essential Cookies:</strong> For website functionality (e.g., remembering preferences)</li>
                        </ul>
                        <p className="text-slate-300 leading-relaxed mt-2">
                            You can disable cookies through your browser settings, but some features may not work properly.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                            <span>🌐</span> Third-Party Services
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            This website uses the following third-party services:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Vercel:</strong> Website hosting (read their <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Privacy Policy</a>)</li>
                            <li><strong>Google Analytics:</strong> Website analytics (read their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Privacy Policy</a>)</li>
                            <li><strong>MongoDB Atlas:</strong> Database storage (read their <a href="https://www.mongodb.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Privacy Policy</a>)</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                            <span>✅</span> Your Rights
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Access:</strong> Request copies of your personal data</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                            <li><strong>Object:</strong> Object to processing of your personal data</li>
                            <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
                        </ul>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            To exercise these rights, please contact me at{' '}
                            <a href="mailto:kumar.gaurav.yadav2007@gmail.com" className="text-blue-400 hover:underline font-semibold">
                                kumar.gaurav.yadav2007@gmail.com
                            </a>
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                            <span>📝</span> Changes to This Policy
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            I may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.
                            I encourage you to review this policy periodically.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                            <span>📧</span> Contact Me
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            If you have any questions about this privacy policy or how your data is handled, please contact:
                        </p>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mt-4">
                            <p className="text-slate-300">
                                <strong className="text-blue-400">Gaurav Kumar Yadav</strong><br />
                                Email: <a href="mailto:kumar.gaurav.yadav2007@gmail.com" className="text-blue-400 hover:underline">kumar.gaurav.yadav2007@gmail.com</a><br />
                                Location: Lucknow, India<br />
                                Website: <a href="https://ggauravky.vercel.app" className="text-blue-400 hover:underline">ggauravky.vercel.app</a>
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    )
}

export default Privacy

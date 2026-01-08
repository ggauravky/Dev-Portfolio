import useSEO from '../hooks/useSEO'
import './Legal.css'

function Terms() {
    useSEO({
        title: 'Terms of Service - Gaurav Kumar Yadav | Website Terms & Conditions',
        description: 'Terms of Service for Gaurav Kumar Yadav\'s portfolio website. Read the terms and conditions for using this website, viewing content, and contacting for services.',
        keywords: 'Terms of Service, Terms and Conditions, Website Terms, Portfolio Terms, Legal Agreement, Usage Policy',
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
                        Terms of Service
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg">
                        Last Updated: January 8, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="legal-content bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl sm:rounded-2xl border border-slate-700/50 space-y-6 sm:space-y-8">

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-400 flex items-center gap-2">
                            <span className="text-2xl sm:text-3xl">📜</span>
                            <span className="break-words">Agreement to Terms</span>
                        </h2>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            By accessing and using this portfolio website (<span className="text-blue-400 font-semibold">ggauravky.vercel.app</span>),
                            you accept and agree to be bound by the terms and conditions outlined in this agreement. If you disagree with any part of these terms,
                            please do not use this website.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                            <span>🎯</span> Use of Website
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            This website is a personal portfolio showcasing my work, skills, and projects as a developer. You may:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>View and browse content for personal and professional purposes</li>
                            <li>Contact me through the provided contact form for legitimate inquiries</li>
                            <li>Share links to this website with others</li>
                            <li>View my projects and code examples for learning purposes</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                            <span>🚫</span> Prohibited Activities
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            You may NOT:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Copy, reproduce, or redistribute content without permission</li>
                            <li>Use automated tools (bots, scrapers) to access or collect data</li>
                            <li>Attempt to gain unauthorized access to any part of the website</li>
                            <li>Interfere with or disrupt the website's functionality</li>
                            <li>Use the contact form for spam, harassment, or malicious purposes</li>
                            <li>Claim my work, projects, or code as your own</li>
                            <li>Use website content for commercial purposes without explicit permission</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                            <span>©️</span> Intellectual Property Rights
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            All content on this website, including but not limited to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Text, graphics, images, and visual content</li>
                            <li>Code, projects, and technical implementations</li>
                            <li>Design, layout, and user interface elements</li>
                            <li>Logos, branding, and personal identity</li>
                        </ul>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            ...are the intellectual property of <span className="text-blue-400 font-semibold">Gaurav Kumar Yadav</span> and
                            are protected by copyright laws. Unauthorized use, reproduction, or distribution is strictly prohibited.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-pink-400 flex items-center gap-2">
                            <span>🔗</span> Third-Party Links & Content
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            This website may contain links to external websites and third-party services (GitHub, LinkedIn, etc.). I am not responsible for:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Content, accuracy, or availability of external sites</li>
                            <li>Privacy practices of third-party services</li>
                            <li>Any damages arising from your use of external links</li>
                        </ul>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            You access third-party links at your own risk.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                            <span>⚠️</span> Disclaimer of Warranties
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            This website is provided "as is" without warranties of any kind, either express or implied. I do not guarantee:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Uninterrupted or error-free operation of the website</li>
                            <li>Accuracy, completeness, or reliability of content</li>
                            <li>Fitness for any particular purpose</li>
                            <li>Security of data transmission</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                            <span>🛡️</span> Limitation of Liability
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            To the fullest extent permitted by law, I shall not be liable for any:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Direct, indirect, incidental, or consequential damages</li>
                            <li>Loss of profits, data, or business opportunities</li>
                            <li>Damages resulting from use or inability to use this website</li>
                            <li>Errors, viruses, or security breaches</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                            <span>💼</span> Professional Services & Hiring
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            If you contact me for freelance work, internships, or job opportunities:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Any agreement must be formalized in writing</li>
                            <li>Project terms, deliverables, and payment will be discussed separately</li>
                            <li>This website's terms do not constitute a work agreement</li>
                            <li>I reserve the right to accept or decline any opportunity</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                            <span>🔄</span> Changes to Terms
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            I reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
                            Your continued use of the website after changes constitutes acceptance of the modified terms.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                            <span>⚖️</span> Governing Law
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction
                            of the courts in Lucknow, Uttar Pradesh, India.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                            <span>📧</span> Contact & Questions
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            If you have any questions about these terms, please contact:
                        </p>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mt-4">
                            <p className="text-slate-300">
                                <strong className="text-blue-400">Gaurav Kumar Yadav</strong><br />
                                Email: <a href="mailto:kumar.gaurav.yadav2007@gmail.com" className="text-blue-400 hover:underline">kumar.gaurav.yadav2007@gmail.com</a><br />
                                Location: Lucknow, Uttar Pradesh, India<br />
                                Website: <a href="https://ggauravky.vercel.app" className="text-blue-400 hover:underline">ggauravky.vercel.app</a>
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4 border-t border-slate-700 pt-6">
                        <p className="text-slate-400 text-sm italic">
                            By using this website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    )
}

export default Terms

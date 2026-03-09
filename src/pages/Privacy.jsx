// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

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
                        Last Updated: February 23, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="legal-content bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl sm:rounded-2xl border border-slate-700/50 space-y-6 sm:space-y-8">

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-400 flex items-center gap-2">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
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
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> Information I Collect
                        </h2>
                        <div className="space-y-3 text-slate-300">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-200">Information You Provide:</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base ml-2 sm:ml-4">
                                <li><strong>Contact Form:</strong> Name, email address, subject, and message when you reach out via the contact form</li>
                                <li><strong>Email Communication:</strong> Any additional information you choose to share in emails</li>
                                <li><strong>AI Image Analyzer Uploads:</strong> Images you upload for analysis, along with related prediction results</li>
                                <li><strong>Prompt Improver Content:</strong> Prompts you submit, improved prompt output, and selected prompt settings</li>
                            </ul>

                            <h3 className="text-base sm:text-lg font-semibold text-slate-200 mt-4">Automatically Collected Information:</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base ml-2 sm:ml-4">
                                <li><strong>Analytics Data:</strong> Basic usage data through Google Analytics (page views, time spent, device type)</li>
                                <li><strong>Technical Data:</strong> IP address, browser type, operating system, referral source</li>
                                <li><strong>AI Usage Metadata:</strong> Demo type, event logs, and approximate location data (country/city from request headers)</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-cyan-400 flex items-center gap-2">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                            <span className="break-words">How I Use Your Information</span>
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm sm:text-base ml-2 sm:ml-4">
                            <li>To respond to your inquiries and communication</li>
                            <li>To improve website functionality and user experience</li>
                            <li>To analyze website traffic and usage patterns</li>
                            <li>To operate AI demo features, including image analysis and prompt improvement</li>
                            <li>To monitor misuse, debug issues, and improve reliability of AI features</li>
                            <li>To consider you for potential collaboration or job opportunities</li>
                            <li>To comply with legal obligations if required</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                            <span>AI</span> AI Feature Data Handling
                        </h2>
                        <div className="space-y-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                            <p>
                                When you use AI features on this website, the submitted data is processed and stored on secure infrastructure to provide the feature and maintain service quality.
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-2 sm:ml-4">
                                <li><strong>Image Analyzer:</strong> Uploaded images may be stored in secure cloud media storage and linked with analysis logs.</li>
                                <li><strong>Prompt Improver:</strong> Input prompts, improved prompts, and prompt settings may be stored in secure databases for feature operation, abuse prevention, debugging, and quality improvement.</li>
                                <li><strong>Retention:</strong> Data may be retained as needed for legitimate operational and security purposes, unless deletion is requested and technically feasible.</li>
                            </ul>
                            <p>
                                Please avoid uploading sensitive personal, confidential, or regulated information to AI tools.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-green-400 flex items-center gap-2">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                            <span className="break-words">Data Security</span>
                        </h2>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            I implement appropriate security measures to protect your personal information:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Contact form data is sent via secure HTTPS connection</li>
                            <li>Email addresses are never shared with third parties</li>
                            <li>Data is stored securely and accessed only when necessary</li>
                            <li>Uploaded AI inputs and outputs are protected with administrative and technical safeguards</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-pink-400 flex items-center gap-2">
                            <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Cookies &amp; Tracking
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
                            <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg> Third-Party Services
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            This website uses the following third-party services:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Vercel:</strong> Website hosting (read their <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Privacy Policy</a>)</li>
                            <li><strong>Google Analytics:</strong> Website analytics (read their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Privacy Policy</a>)</li>
                            <li><strong>MongoDB Atlas:</strong> Database storage (read their <a href="https://www.mongodb.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Privacy Policy</a>)</li>
                            <li><strong>Cloudinary:</strong> Secure image storage and delivery for AI image uploads (read their <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Privacy Policy</a>)</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Your Rights
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
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> Changes to This Policy
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            I may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.
                            I encourage you to review this policy periodically.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> Contact Me
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

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

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
        <div className="min-h-screen bg-[#070708] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute top-[-80px] right-[-80px] w-[480px] h-[480px] bg-toxic/3 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-60px] left-[-60px] w-[420px] h-[420px] bg-cyber/3 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-4 uppercase tracking-tight text-white">
                        Terms of <span className="bg-gradient-to-r from-toxic via-white to-cyber bg-clip-text text-transparent">Service</span>
                    </h1>
                    <p className="text-[#a1a1aa] font-mono text-xs uppercase tracking-wider">
                        Last Updated: February 23, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="legal-content bg-[#0e0e11] border border-[#1a1a22] p-6 sm:p-10 rounded-lg space-y-8 relative overflow-hidden">

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                            <span className="break-words">Agreement to Terms</span>
                        </h2>
                        <p className="text-[#a1a1aa] text-sm sm:text-base leading-relaxed">
                            By accessing and using this portfolio website (<span className="text-white font-semibold">ggauravky.vercel.app</span>),
                            you accept and agree to be bound by the terms and conditions outlined in this agreement. If you disagree with any part of these terms,
                            please do not use this website.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Use of Website
                        </h2>
                        <p className="leading-relaxed">
                            This website is a personal portfolio showcasing my work, skills, and projects as a developer. You may:
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li>View and browse content for personal and professional purposes</li>
                            <li>Contact me through the provided contact form for legitimate inquiries</li>
                            <li>Share links to this website with others</li>
                            <li>View my projects and code examples for learning purposes</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-11.795H13.43l1.562-6.52L6 14.518h5.373L9.813 15.904z" /></svg> AI Features and Data Processing
                        </h2>
                        <p className="leading-relaxed">
                            If you use AI tools on this website (including the Image Analyzer and Prompt Improver), you authorize processing and storage of related data to provide, secure, and improve these features.
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li>Uploaded images may be stored in secure media infrastructure and linked with analysis logs.</li>
                            <li>Submitted prompts, improved prompts, and prompt settings may be stored in secure databases.</li>
                            <li>Related technical and usage metadata (such as IP, user agent, and coarse location headers) may be logged for security, abuse prevention, debugging, and analytics.</li>
                            <li>You should not upload confidential, sensitive, or legally restricted content unless you are authorized to share it.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg> Prohibited Activities
                        </h2>
                        <p className="leading-relaxed">
                            You may NOT:
                        </p>
                        <ul className="space-y-2 ml-4">
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
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Intellectual Property Rights
                        </h2>
                        <p className="leading-relaxed">
                            All content on this website, including but not limited to:
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li>Text, graphics, images, and visual content</li>
                            <li>Code, projects, and technical implementations</li>
                            <li>Design, layout, and user interface elements</li>
                            <li>Logos, branding, and personal identity</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            ...are the intellectual property of <span className="text-white font-semibold">Gaurav Kumar Yadav</span> and
                            are protected by copyright laws. Unauthorized use, reproduction, or distribution is strictly prohibited.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg> Third-Party Links & Content
                        </h2>
                        <p className="leading-relaxed">
                            This website may contain links to external websites and third-party services (GitHub, LinkedIn, etc.). I am not responsible for:
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li>Content, accuracy, or availability of external sites</li>
                            <li>Privacy practices of third-party services</li>
                            <li>Any damages arising from your use of external links</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            You access third-party links at your own risk.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg> Disclaimer of Warranties
                        </h2>
                        <p className="leading-relaxed">
                            This website is provided "as is" without warranties of any kind, either express or implied. I do not guarantee:
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li>Uninterrupted or error-free operation of the website</li>
                            <li>Accuracy, completeness, or reliability of content</li>
                            <li>Fitness for any particular purpose</li>
                            <li>Security of data transmission</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg> Limitation of Liability
                        </h2>
                        <p className="leading-relaxed">
                            To the fullest extent permitted by law, I shall not be liable for any:
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li>Direct, indirect, incidental, or consequential damages</li>
                            <li>Loss of profits, data, or business opportunities</li>
                            <li>Damages resulting from use or inability to use this website</li>
                            <li>Errors, viruses, or security breaches</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg> Professional Services & Hiring
                        </h2>
                        <p className="leading-relaxed">
                            If you contact me for freelance work, internships, or job opportunities:
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li>Any agreement must be formalized in writing</li>
                            <li>Project terms, deliverables, and payment will be discussed separately</li>
                            <li>This website's terms do not constitute a work agreement</li>
                            <li>I reserve the right to accept or decline any opportunity</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg> Changes to Terms
                        </h2>
                        <p className="leading-relaxed">
                            I reserve the right to modify these terms at any time. Any changes will be posted on this page with an updated revision date.
                            Your continued use of the website after changes constitutes acceptance of the modified terms.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0112 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg> Governing Law
                        </h2>
                        <p className="leading-relaxed">
                            These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction
                            of the courts in Lucknow, Uttar Pradesh, India.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> Contact &amp; Questions
                        </h2>
                        <p className="leading-relaxed">
                            If you have any questions about these terms, please contact:
                        </p>
                        <div className="contact-box">
                            <p>
                                <strong>Gaurav Kumar Yadav</strong><br />
                                Email: <a href="mailto:kumar.gaurav.yadav2007@gmail.com">kumar.gaurav.yadav2007@gmail.com</a><br />
                                Location: Lucknow, Uttar Pradesh, India<br />
                                Website: <a href="https://ggauravky.vercel.app">ggauravky.vercel.app</a>
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4 border-t border-[#1a1a22] pt-6">
                        <p className="text-zinc-500 text-xs italic font-mono">
                            // By using this website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    )
}

export default Terms

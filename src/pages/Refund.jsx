// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import useSEO from '../hooks/useSEO'
import './Legal.css'

function Refund() {
    useSEO({
        title: 'Refund Policy - Gaurav Kumar Yadav Services',
        description: 'Refund policy for mentorship, review, debugging, and development services booked through this portfolio.',
        keywords: 'refund policy, cancellation policy, developer services, payment policy',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
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
                        Refund <span className="bg-gradient-to-r from-toxic via-white to-cyber bg-clip-text text-transparent">Policy</span>
                    </h1>
                    <p className="text-[#a1a1aa] font-mono text-xs uppercase tracking-wider">
                        Last Updated: March 18, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="legal-content bg-[#0e0e11] border border-[#1a1a22] p-6 sm:p-10 rounded-lg space-y-8 relative overflow-hidden">

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>
                            <span className="break-words">Service Delivery</span>
                        </h2>
                        <p className="text-[#a1a1aa] text-sm sm:text-base leading-relaxed">
                            Most services are delivered digitally via email, call, or direct support sessions. Development work timelines are shared before work starts.
                        </p>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="break-words">Refund Eligibility</span>
                        </h2>
                        <ul className="space-y-2 ml-4">
                            <li>Full refund if cancellation is requested before the session/work starts.</li>
                            <li>Partial refund may be considered for development services based on completed scope.</li>
                            <li>No refund after full service delivery (for example, completed mentoring/review session).</li>
                        </ul>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="break-words">Non-Refundable Cases</span>
                        </h2>
                        <ul className="space-y-2 ml-4">
                            <li>Missed sessions without prior notice.</li>
                            <li>Change of mind after successful completion.</li>
                            <li>Delays caused by missing information from the client side.</li>
                        </ul>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                            <span className="break-words">How to Request a Refund</span>
                        </h2>
                        <p className="text-[#a1a1aa] leading-relaxed">
                            Send a request within 3 days of payment with your payment ID and issue summary.
                        </p>
                        <div className="contact-box">
                            <p>
                                Email: <a href="mailto:kumar.gaurav.yadav2007@gmail.com">kumar.gaurav.yadav2007@gmail.com</a><br />
                                Subject: Refund Request - Payment ID
                            </p>
                        </div>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                            <span className="break-words">Payment Security Note</span>
                        </h2>
                        <p className="text-[#a1a1aa] leading-relaxed">
                            Payments are processed via Cashfree secure checkout. No card number, CVV, or UPI PIN data is stored on this website.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Refund

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
        <div className="min-h-screen bg-slate-900 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
            <div className="absolute top-20 right-5 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-5 sm:left-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent px-2">
                        Refund Policy
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg">Last Updated: March 18, 2026</p>
                </div>

                <div className="legal-content bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl sm:rounded-2xl border border-slate-700/50 space-y-6 sm:space-y-8">
                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-400">Service Delivery</h2>
                        <p className="text-slate-300">
                            Most services are delivered digitally via email, call, or direct support sessions. Development work timelines are shared before work starts.
                        </p>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-purple-400">Refund Eligibility</h2>
                        <ul>
                            <li>Full refund if cancellation is requested before the session/work starts.</li>
                            <li>Partial refund may be considered for development services based on completed scope.</li>
                            <li>No refund after full service delivery (for example, completed mentoring/review session).</li>
                        </ul>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">Non-Refundable Cases</h2>
                        <ul>
                            <li>Missed sessions without prior notice.</li>
                            <li>Change of mind after successful completion.</li>
                            <li>Delays caused by missing information from the client side.</li>
                        </ul>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-emerald-400">How to Request a Refund</h2>
                        <p className="text-slate-300">
                            Send a request within 3 days of payment with your payment ID and issue summary.
                        </p>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                            <p className="text-slate-300">
                                Email: <a href="mailto:kumar.gaurav.yadav2007@gmail.com" className="text-blue-400 hover:underline">kumar.gaurav.yadav2007@gmail.com</a><br />
                                Subject: Refund Request - Payment ID
                            </p>
                        </div>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-orange-400">Payment Security Note</h2>
                        <p className="text-slate-300">
                            Payment gateway is currently under construction. No card or UPI PIN data is stored on this website.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Refund

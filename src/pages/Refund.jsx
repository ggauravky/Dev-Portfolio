// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import useSEO from '../hooks/useSEO'
import { staticSeo } from '../lib/seo'
import LegalPage, { LegalSection } from '../components/page/LegalPage'

const SEO = staticSeo('/refund')

const EMAIL = 'kumar.gaurav.yadav2007@gmail.com'

function Refund() {
    useSEO({
        ...SEO,
    })

    return (
        <LegalPage
            title="Refund policy"
            updated="March 18, 2026"
            lede="When a booked service can be refunded, when it can't, and how to ask."
        >
            <LegalSection title="Service delivery">
                <p>Most services are delivered digitally via email, call, or direct support sessions. Development work timelines are shared before work starts.</p>
            </LegalSection>

            <LegalSection title="Refund eligibility">
                <ul>
                    <li>Full refund if cancellation is requested before the session/work starts.</li>
                    <li>Partial refund may be considered for development services based on completed scope.</li>
                    <li>No refund after full service delivery (for example, completed mentoring/review session).</li>
                </ul>
            </LegalSection>

            <LegalSection title="Non-refundable cases">
                <ul>
                    <li>Missed sessions without prior notice.</li>
                    <li>Change of mind after successful completion.</li>
                    <li>Delays caused by missing information from the client side.</li>
                </ul>
            </LegalSection>

            <LegalSection title="How to request a refund">
                <p>Send a request within 3 days of payment with your payment ID and issue summary.</p>
                <p>
                    Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a><br />
                    Subject: Refund Request - Payment ID
                </p>
            </LegalSection>

            <LegalSection title="Payment security note">
                <p>Payments use Razorpay Standard Checkout. No card number, CVV, UPI PIN, or bank credential is stored on this website.</p>
            </LegalSection>
        </LegalPage>
    )
}

export default Refund

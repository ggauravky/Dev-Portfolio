// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import useSEO from '../hooks/useSEO'
import { staticSeo } from '../lib/seo'
import LegalPage, { LegalSection } from '../components/page/LegalPage'

const SEO = staticSeo('/privacy')

const EMAIL = 'kumar.gaurav.yadav2007@gmail.com'

const Ext = ({ href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
)

function Privacy() {
    useSEO({
        ...SEO,
    })

    return (
        <LegalPage
            title="Privacy policy"
            updated="February 23, 2026"
            lede="What this site collects, why, who else handles it, and how to have it removed."
        >
            <LegalSection title="Introduction">
                <p>Welcome to my portfolio website. I respect your privacy and am committed to protecting your personal data. This privacy policy explains how I collect, use, and safeguard your information when you visit ggauravky.vercel.app.</p>
            </LegalSection>

            <LegalSection title="Information I collect">
                <h3>Information you provide</h3>
                <ul>
                    <li><strong>Contact Form:</strong> Name, email address, subject, and message when you reach out via the contact form</li>
                    <li><strong>Email Communication:</strong> Any additional information you choose to share in emails</li>
                    <li><strong>AI Image Analyzer Uploads:</strong> Images you upload for analysis, along with related prediction results</li>
                    <li><strong>Prompt Improver Content:</strong> Prompts you submit, improved prompt output, and selected prompt settings</li>
                </ul>
                <h3>Automatically collected information</h3>
                <ul>
                    <li><strong>Analytics Data:</strong> Basic usage data through Google Analytics (page views, time spent, device type)</li>
                    <li><strong>Technical Data:</strong> IP address, browser type, operating system, referral source</li>
                    <li><strong>AI Usage Metadata:</strong> Demo type, event logs, and approximate location data (country/city from request headers)</li>
                </ul>
            </LegalSection>

            <LegalSection title="How I use your information">
                <ul>
                    <li>To respond to your inquiries and communication</li>
                    <li>To improve website functionality and user experience</li>
                    <li>To analyze website traffic and usage patterns</li>
                    <li>To operate AI demo features, including image analysis and prompt improvement</li>
                    <li>To monitor misuse, debug issues, and improve reliability of AI features</li>
                    <li>To consider you for potential collaboration or job opportunities</li>
                    <li>To comply with legal obligations if required</li>
                </ul>
            </LegalSection>

            <LegalSection title="AI feature data handling">
                <p>When you use AI features on this website, the submitted data is processed and stored on secure infrastructure to provide the feature and maintain service quality.</p>
                <ul>
                    <li><strong>Image Analyzer:</strong> Uploaded images may be stored in secure cloud media storage and linked with analysis logs.</li>
                    <li><strong>Prompt Improver:</strong> Input prompts, improved prompts, and prompt settings may be stored in secure databases for feature operation, abuse prevention, debugging, and quality improvement.</li>
                    <li><strong>Retention:</strong> Data may be retained as needed for legitimate operational and security purposes, unless deletion is requested and technically feasible.</li>
                </ul>
                <p className="lg-note">Please avoid uploading sensitive personal, confidential, or regulated information to AI tools.</p>
            </LegalSection>

            <LegalSection title="Data security">
                <p>I implement appropriate security measures to protect your personal information:</p>
                <ul>
                    <li>Contact form data is sent via secure HTTPS connection</li>
                    <li>Email addresses are never shared with third parties</li>
                    <li>Data is stored securely and accessed only when necessary</li>
                    <li>Uploaded AI inputs and outputs are protected with administrative and technical safeguards</li>
                </ul>
            </LegalSection>

            <LegalSection title="Cookies & tracking">
                <p>This website uses minimal tracking technologies:</p>
                <ul>
                    <li><strong>Google Analytics:</strong> For understanding visitor behavior and improving content</li>
                    <li><strong>Essential Cookies:</strong> For website functionality (e.g., remembering preferences)</li>
                </ul>
                <p>You can disable cookies through your browser settings, but some features may not work properly.</p>
            </LegalSection>

            <LegalSection title="Third-party services">
                <p>This website uses the following third-party services:</p>
                <ul>
                    <li><strong>Vercel:</strong> Website hosting (read their <Ext href="https://vercel.com/legal/privacy-policy" />)</li>
                    <li><strong>Google Analytics:</strong> Website analytics (read their <Ext href="https://policies.google.com/privacy" />)</li>
                    <li><strong>MongoDB Atlas:</strong> Database storage (read their <Ext href="https://www.mongodb.com/legal/privacy-policy" />)</li>
                    <li><strong>Cloudinary:</strong> Secure image storage and delivery for AI image uploads (read their <Ext href="https://cloudinary.com/privacy" />)</li>
                </ul>
            </LegalSection>

            <LegalSection title="Your rights">
                <p>You have the right to:</p>
                <ul>
                    <li><strong>Access:</strong> Request copies of your personal data</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                    <li><strong>Object:</strong> Object to processing of your personal data</li>
                    <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
                </ul>
                <p>To exercise these rights, please contact me at <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            </LegalSection>

            <LegalSection title="Changes to this policy">
                <p>I may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date. I encourage you to review this policy periodically.</p>
            </LegalSection>

            <LegalSection title="Contact me">
                <p>If you have any questions about this privacy policy or how your data is handled, please contact:</p>
                <p>
                    <strong>Gaurav Kumar Yadav</strong><br />
                    Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a><br />
                    Location: Lucknow, India<br />
                    Website: <a href="https://ggauravky.vercel.app">ggauravky.vercel.app</a>
                </p>
            </LegalSection>
        </LegalPage>
    )
}

export default Privacy

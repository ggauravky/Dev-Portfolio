// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import useSEO from '../hooks/useSEO'
import { staticSeo } from '../lib/seo'
import LegalPage, { LegalSection } from '../components/page/LegalPage'

const SEO = staticSeo('/terms')

const EMAIL = 'kumar.gaurav.yadav2007@gmail.com'

function Terms() {
    useSEO({
        ...SEO,
    })

    return (
        <LegalPage
            title="Terms of service"
            updated="February 23, 2026"
            lede="The rules for using this site, its AI tools and its content."
        >
            <LegalSection title="Agreement to terms">
                <p>By accessing and using this portfolio website (ggauravky.vercel.app), you accept and agree to be bound by the terms and conditions outlined in this agreement. If you disagree with any part of these terms, please do not use this website.</p>
            </LegalSection>

            <LegalSection title="Use of website">
                <p>This website is a personal portfolio showcasing my work, skills, and projects as a developer. You may:</p>
                <ul>
                    <li>View and browse content for personal and professional purposes</li>
                    <li>Contact me through the provided contact form for legitimate inquiries</li>
                    <li>Share links to this website with others</li>
                    <li>View my projects and code examples for learning purposes</li>
                </ul>
            </LegalSection>

            <LegalSection title="AI features and data processing">
                <p>If you use AI tools on this website (including the Image Analyzer and Prompt Improver), you authorize processing and storage of related data to provide, secure, and improve these features.</p>
                <ul>
                    <li>Uploaded images may be stored in secure media infrastructure and linked with analysis logs.</li>
                    <li>Submitted prompts, improved prompts, and prompt settings may be stored in secure databases.</li>
                    <li>Related technical and usage metadata (such as IP, user agent, and coarse location headers) may be logged for security, abuse prevention, debugging, and analytics.</li>
                    <li>You should not upload confidential, sensitive, or legally restricted content unless you are authorized to share it.</li>
                </ul>
            </LegalSection>

            <LegalSection title="Prohibited activities">
                <p>You may not:</p>
                <ul>
                    <li>Copy, reproduce, or redistribute content without permission</li>
                    <li>Use automated tools (bots, scrapers) to access or collect data</li>
                    <li>Attempt to gain unauthorized access to any part of the website</li>
                    <li>Interfere with or disrupt the website&rsquo;s functionality</li>
                    <li>Use the contact form for spam, harassment, or malicious purposes</li>
                    <li>Claim my work, projects, or code as your own</li>
                    <li>Use website content for commercial purposes without explicit permission</li>
                </ul>
            </LegalSection>

            <LegalSection title="Intellectual property rights">
                <p>All content on this website, including but not limited to:</p>
                <ul>
                    <li>Text, graphics, images, and visual content</li>
                    <li>Code, projects, and technical implementations</li>
                    <li>Design, layout, and user interface elements</li>
                    <li>Logos, branding, and personal identity</li>
                </ul>
                <p>…are the intellectual property of Gaurav Kumar Yadav and are protected by copyright laws. Unauthorized use, reproduction, or distribution is strictly prohibited.</p>
            </LegalSection>

            <LegalSection title="Third-party links & content">
                <p>This website may contain links to external websites and third-party services (GitHub, LinkedIn, etc.). I am not responsible for:</p>
                <ul>
                    <li>Content, accuracy, or availability of external sites</li>
                    <li>Privacy practices of third-party services</li>
                    <li>Any damages arising from your use of external links</li>
                </ul>
                <p>You access third-party links at your own risk.</p>
            </LegalSection>

            <LegalSection title="Disclaimer of warranties">
                <p>This website is provided &ldquo;as is&rdquo; without warranties of any kind, either express or implied. I do not guarantee:</p>
                <ul>
                    <li>Uninterrupted or error-free operation of the website</li>
                    <li>Accuracy, completeness, or reliability of content</li>
                    <li>Fitness for any particular purpose</li>
                    <li>Security of data transmission</li>
                </ul>
            </LegalSection>

            <LegalSection title="Limitation of liability">
                <p>To the fullest extent permitted by law, I shall not be liable for any:</p>
                <ul>
                    <li>Direct, indirect, incidental, or consequential damages</li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Damages resulting from use or inability to use this website</li>
                    <li>Errors, viruses, or security breaches</li>
                </ul>
            </LegalSection>

            <LegalSection title="Professional services & hiring">
                <p>If you contact me for freelance work, internships, or job opportunities:</p>
                <ul>
                    <li>Any agreement must be formalized in writing</li>
                    <li>Project terms, deliverables, and payment will be discussed separately</li>
                    <li>This website&rsquo;s terms do not constitute a work agreement</li>
                    <li>I reserve the right to accept or decline any opportunity</li>
                </ul>
            </LegalSection>

            <LegalSection title="Changes to terms">
                <p>I reserve the right to modify these terms at any time. Any changes will be posted on this page with an updated revision date. Your continued use of the website after changes constitutes acceptance of the modified terms.</p>
            </LegalSection>

            <LegalSection title="Governing law">
                <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Lucknow, Uttar Pradesh, India.</p>
            </LegalSection>

            <LegalSection title="Contact & questions">
                <p>If you have any questions about these terms, please contact:</p>
                <p>
                    <strong>Gaurav Kumar Yadav</strong><br />
                    Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a><br />
                    Location: Lucknow, Uttar Pradesh, India<br />
                    Website: <a href="https://ggauravky.vercel.app">ggauravky.vercel.app</a>
                </p>
                <p className="lg-note">By using this website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
            </LegalSection>
        </LegalPage>
    )
}

export default Terms

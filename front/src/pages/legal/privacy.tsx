import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { paths } from '../../routes/paths';
import '../../styles/legal.css';

export default function Privacy() {
    return (
        <div className="leg-page">
            <div className="leg-container">
                <Link to={paths.signup} className="leg-back">
                    <Icon icon="mdi:arrow-left" width={14} />
                    Back
                </Link>

                <div className="leg-header">
                    <div className="leg-eyebrow">Legal</div>
                    <h1 className="leg-title">Privacy <em>Policy.</em></h1>
                    <div className="leg-meta">Last updated: May 28, 2026 · Effective immediately</div>
                </div>

                <div className="leg-body">
                    <div className="leg-note">
                        Your privacy matters to us. This policy explains what data we collect, how we use it, and the choices you have.
                    </div>

                    <h2>1. Information We Collect</h2>
                    <p>We collect the following types of information:</p>
                    <ul>
                        <li><strong>Account information:</strong> username, email address, and password (stored as a secure hash)</li>
                        <li><strong>Content you provide:</strong> images and text prompts you upload or enter to use the Service</li>
                        <li><strong>Usage data:</strong> generation history, credit usage, feature interactions, and session metadata</li>
                        <li><strong>Device and technical data:</strong> IP address, browser type, operating system, and referring URLs</li>
                        <li><strong>Payment information:</strong> billing details processed securely by our payment provider — we do not store card numbers</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Provide, maintain, and improve the Service</li>
                        <li>Process generations and manage your credits and subscriptions</li>
                        <li>Send transactional emails such as verification codes and billing receipts</li>
                        <li>Detect and prevent fraud, abuse, and policy violations</li>
                        <li>Comply with legal obligations</li>
                        <li>Communicate service updates and important notices</li>
                    </ul>
                    <p>We do not sell your personal information to third parties.</p>

                    <h2>3. Content and AI Training</h2>
                    <p>
                        By default, we do not use your prompts or generated outputs to train our AI models. Content you submit is processed solely to generate your requested output and stored only as necessary to display your history within the Service.
                    </p>
                    <p>
                        If you opt in to a content-sharing or community program, different terms may apply and will be clearly disclosed.
                    </p>

                    <h2>4. Data Sharing</h2>
                    <p>We may share your information with:</p>
                    <ul>
                        <li><strong>Service providers:</strong> hosting, payments, email delivery, and analytics vendors who process data on our behalf under strict confidentiality obligations</li>
                        <li><strong>AI model providers:</strong> your prompts and reference images are sent to third-party model APIs to generate outputs; these providers have their own privacy policies</li>
                        <li><strong>Law enforcement:</strong> when required by law or to protect the rights, property, or safety of MovyAI, our users, or others</li>
                    </ul>

                    <h2>5. Data Retention</h2>
                    <p>
                        We retain your account data for as long as your account is active. Generated content and generation history are retained for up to 90 days after creation, after which they may be automatically deleted. You may delete your account and associated data at any time from your profile settings.
                    </p>

                    <h2>6. Cookies and Tracking</h2>
                    <p>
                        We use session cookies and local storage to keep you signed in and remember your preferences. We may use analytics tools that set cookies to help us understand how the Service is used. You can control cookies through your browser settings, though disabling them may affect Service functionality.
                    </p>

                    <h2>7. Security</h2>
                    <p>
                        We implement industry-standard security measures including HTTPS encryption, hashed passwords, and access controls. No system is completely secure, and we cannot guarantee the absolute security of your data.
                    </p>

                    <h2>8. Children's Privacy</h2>
                    <p>
                        The Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If we learn we have collected such information, we will delete it promptly.
                    </p>

                    <h2>9. Your Rights</h2>
                    <p>Depending on your location, you may have the right to:</p>
                    <ul>
                        <li>Access the personal data we hold about you</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Object to or restrict certain processing</li>
                        <li>Data portability</li>
                    </ul>
                    <p>To exercise these rights, contact us at <a href="mailto:privacy@movyai.com">privacy@movyai.com</a>.</p>

                    <h2>10. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy and revising the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the updated policy.
                    </p>

                    <h2>11. Contact</h2>
                    <p>
                        If you have questions or concerns about this Privacy Policy, please reach out at <a href="mailto:privacy@movyai.com">privacy@movyai.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}

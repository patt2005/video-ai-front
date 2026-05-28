import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { paths } from '../../routes/paths';
import '../../styles/legal.css';

export default function Terms() {
    return (
        <div className="leg-page">
            <div className="leg-container">
                <Link to={paths.signup} className="leg-back">
                    <Icon icon="mdi:arrow-left" width={14} />
                    Back
                </Link>

                <div className="leg-header">
                    <div className="leg-eyebrow">Legal</div>
                    <h1 className="leg-title">Terms of <em>Service.</em></h1>
                    <div className="leg-meta">Last updated: May 28, 2026 · Effective immediately</div>
                </div>

                <div className="leg-body">
                    <div className="leg-note">
                        Please read these Terms of Service carefully before using MovyAI. By creating an account or using our services, you agree to be bound by these terms.
                    </div>

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using MovyAI ("Service"), you agree to be bound by these Terms of Service ("Terms") and our <Link to={paths.privacy}>Privacy Policy</Link>. If you do not agree to these Terms, please do not use the Service.
                    </p>
                    <p>
                        These Terms apply to all users of the Service, including users who contribute content, information, and other materials.
                    </p>

                    <h2>2. Description of Service</h2>
                    <p>
                        MovyAI is an AI-powered platform for generating and editing images and videos. We provide tools that allow users to create visual content using artificial intelligence models.
                    </p>

                    <h2>3. Account Registration</h2>
                    <p>
                        To use certain features of the Service, you must create an account. You agree to:
                    </p>
                    <ul>
                        <li>Provide accurate, current, and complete information during registration</li>
                        <li>Maintain and promptly update your account information</li>
                        <li>Keep your password secure and confidential</li>
                        <li>Notify us immediately of any unauthorized use of your account</li>
                        <li>Be responsible for all activity that occurs under your account</li>
                    </ul>

                    <h2>4. Acceptable Use</h2>
                    <p>You agree not to use the Service to:</p>
                    <ul>
                        <li>Generate content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable</li>
                        <li>Create non-consensual intimate imagery or content that sexualizes minors</li>
                        <li>Infringe upon the intellectual property rights of others</li>
                        <li>Impersonate any person or entity</li>
                        <li>Attempt to circumvent usage limits, credits, or subscription restrictions</li>
                        <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                        <li>Use automated scripts or bots to access the Service without permission</li>
                    </ul>

                    <h2>5. Content and Intellectual Property</h2>
                    <p>
                        <strong>Your content:</strong> You retain ownership of the original inputs you provide to the Service. By submitting content, you grant MovyAI a worldwide, non-exclusive license to process your inputs solely to provide the Service.
                    </p>
                    <p>
                        <strong>Generated content:</strong> Subject to these Terms and your plan, you own the images and videos generated through the Service. You are solely responsible for ensuring your use of generated content complies with applicable laws.
                    </p>
                    <p>
                        <strong>Our content:</strong> The Service, including its design, code, and branding, is the property of MovyAI and is protected by intellectual property laws.
                    </p>

                    <h2>6. Credits and Subscriptions</h2>
                    <p>
                        Access to generation features requires credits. Credits may be acquired through free allocations, subscription plans, or purchase. Credits are non-transferable, non-refundable, and expire according to your plan terms. Subscription fees are billed in advance and are non-refundable except as required by law.
                    </p>

                    <h2>7. Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, third parties, or the integrity of the Service.
                    </p>

                    <h2>8. Disclaimer of Warranties</h2>
                    <p>
                        The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or that generated content will meet your expectations.
                    </p>

                    <h2>9. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, MovyAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service.
                    </p>

                    <h2>10. Changes to Terms</h2>
                    <p>
                        We may update these Terms from time to time. We will notify you of significant changes by posting the new Terms on this page and updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the new Terms.
                    </p>

                    <h2>11. Contact</h2>
                    <p>
                        If you have questions about these Terms, please contact us at <a href="mailto:legal@movyai.com">legal@movyai.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}

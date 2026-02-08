import "./Pricing.css";

export default function Pricing() {
    return (
        <main className="login-page">
            {/* Background blobs (reutilizat) */}
            <div className="login-blobs" aria-hidden="true">
                <div className="blob blob-purple" />
                <div className="blob blob-cyan" />
                <div className="blob-wash" />
            </div>

            <div className="login-container">
                <div className="pricing-wrap">
                    <header className="pricing-header">
                        <h1 className="login-title">
                            Pricing <span className="login-title-muted">for MovyAI</span>
                        </h1>
                        <p className="login-subtitle">
                            Choose a plan that fits your workflow. Upgrade or cancel anytime.
                        </p>
                    </header>

                    <section className="pricing-grid">
                        <div className="pricing-card">
                            <div className="pricing-head">
                                <h3 className="pricing-name">Starter</h3>
                                <p className="pricing-desc">For trying MovyAI.</p>
                            </div>

                            <div className="pricing-price">
                                <span className="pricing-amount">$0</span>
                                <span className="pricing-period">/ month</span>
                            </div>

                            <button className="pricing-cta" type="button">
                                Get started
                            </button>

                            <ul className="pricing-features">
                                <li>✓ 720p exports</li>
                                <li>✓ Basic edits</li>
                                <li>✓ Community support</li>
                            </ul>
                        </div>

                        <div className="pricing-card pricing-card--featured">
                            <div className="pricing-head">
                                <div className="pricing-top">
                                    <h3 className="pricing-name">Pro</h3>
                                    <span className="pricing-badge">Most popular</span>
                                </div>
                                <p className="pricing-desc">Best for creators and freelancers.</p>
                            </div>

                            <div className="pricing-price">
                                <span className="pricing-amount">$19</span>
                                <span className="pricing-period">/ month</span>
                            </div>

                            <button className="pricing-cta pricing-cta--featured" type="button">
                                Start Pro
                            </button>

                            <ul className="pricing-features">
                                <li>✓ 4K exports</li>
                                <li>✓ Advanced timeline tools</li>
                                <li>✓ Priority renders</li>
                                <li>✓ Email support</li>
                            </ul>
                        </div>

                        <div className="pricing-card">
                            <div className="pricing-head">
                                <h3 className="pricing-name">Studio</h3>
                                <p className="pricing-desc">For teams and production workflows.</p>
                            </div>

                            <div className="pricing-price">
                                <span className="pricing-amount">$49</span>
                                <span className="pricing-period">/ month</span>
                            </div>

                            <button className="pricing-cta" type="button">
                                Contact sales
                            </button>

                            <ul className="pricing-features">
                                <li>✓ Team workspaces</li>
                                <li>✓ Shared assets</li>
                                <li>✓ Cloud collaboration</li>
                                <li>✓ Dedicated support</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

import { useMemo, useState } from "react";
import "./Signup.css";

export default function Signup() {
    const [password, setPassword] = useState("");

    const strength = useMemo(() => {
        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const label =
            score <= 1 ? "Weak" :
                score === 2 ? "Fair" :
                    score === 3 ? "Good" :
                        "Strong";

        const bars = Math.min(4, Math.max(0, score));

        return { bars, label };
    }, [password]);

    return (
        <main className="login-page">
            {/* Background blobs */}
            <div className="login-blobs" aria-hidden="true">
                <div className="blob blob-purple" />
                <div className="blob blob-cyan" />
                <div className="blob-wash" />
            </div>

            <div className="login-container">
                {/* LEFT */}
                <div className="login-left">
          <span className="login-pill">
            <span className="login-dot" />
            AI Studio · MovyAI
          </span>

                    <h1 className="login-title">
                        Create your account{" "}
                        <span className="login-title-muted">with MovyAI</span>
                    </h1>

                    <p className="login-subtitle">
                        Join the AI workspace designed for creators. Start building,
                        editing, and rendering instantly.
                    </p>

                    <div className="signup-benefits">
                        <div className="signup-benefit">
                            <div className="signup-benefit-title">Free to start</div>
                            <div className="signup-benefit-desc">
                                Create an account and explore the studio instantly.
                            </div>
                        </div>

                        <div className="signup-benefit">
                            <div className="signup-benefit-title">Your workspace</div>
                            <div className="signup-benefit-desc">
                                Save presets, projects and cloud renders in one place.
                            </div>
                        </div>

                        <div className="signup-benefit">
                            <div className="signup-benefit-title">Privacy-first</div>
                            <div className="signup-benefit-desc">
                                Your account is secure by default.
                            </div>
                        </div>
                    </div>

                    <p className="signup-note">
                        By creating an account, you agree to our{" "}
                        <a href="/terms">Terms</a> and{" "}
                        <a href="/privacy">Privacy Policy</a>.
                    </p>
                </div>

                {/* RIGHT */}
                <div className="login-right">
                    <div className="login-card">
                        <div className="login-card-head">
                            <h2 className="login-card-title">Sign up</h2>
                            <span className="login-badge">v0.1</span>
                        </div>

                        <p className="login-card-sub">
                            Create your account to continue.
                        </p>

                        <form className="login-form">
                            <div className="login-field">
                                <label>Email</label>
                                <input type="email" placeholder="you@example.com" />
                            </div>

                            <div className="login-field">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                {password.length > 0 && (
                                    <div className="pw-meter" aria-live="polite">
                                        <div className="pw-bars" data-bars={strength.bars}>
                                            <span />
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                        <div className="pw-label">
                                            Strength: <strong>{strength.label}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="login-field">
                                <label>Confirm Password</label>
                                <input type="password" placeholder="••••••••" />
                            </div>

                            <button className="login-primary" type="submit">
                                Sign up
                            </button>

                            <div className="login-links">
                                <a href="/login" className="login-link">
                                    Already have an account?
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

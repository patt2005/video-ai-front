export default function Login() {
    return (
        <main className="login-page">
            {/* blobs */}
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
                        Create, edit, and explore{" "}
                        <span className="login-title-muted">with MovyAI</span>
                    </h1>


                    <p className="login-subtitle">
                        A dark, glassy workspace designed for creators. Sign in to access your
                        projects, presets, and cloud renders.
                    </p>

                    <div className="login-features">
                        <FeatureCard title="Fast" desc="Generate in minutes" />
                        <FeatureCard title="Precise" desc="Frame-level edits" />
                        <FeatureCard title="Cloud" desc="Projects anywhere" />
                    </div>
                </div>

                {/* RIGHT */}
                <div className="login-right">
                    <div className="login-card">
                        <div className="login-card-head">
                            <h2 className="login-card-title">Sign in</h2>
                            <span className="login-badge">v0.1</span>
                        </div>

                        <p className="login-card-sub">Welcome back — let’s continue.</p>

                        <form className="login-form">
                            <div className="login-field">
                                <label>Email</label>
                                <input type="email" placeholder="you@example.com" />
                            </div>

                            <div className="login-field">
                                <label>Password</label>
                                <input type="password" placeholder="••••••••" />
                            </div>

                            <button className="login-primary" type="submit">
                                Login
                            </button>

                            <div className="login-links">
                                <a href="/signup" className="login-link">
                                    Create account
                                </a>
                                <button type="button" className="login-ghost">
                                    Forgot password?
                                </button>
                            </div>

                            <div className="login-divider">
                                <span />
                                <p>or</p>
                                <span />
                            </div>

                            <button type="button" className="login-secondary">
                                Continue with Google
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="login-feature">
            <div className="login-feature-title">{title}</div>
            <div className="login-feature-desc">{desc}</div>
        </div>
    );
}

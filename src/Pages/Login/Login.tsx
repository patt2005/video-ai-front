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
                        MovyAI
                    </span>

                    <h1 className="login-title">
                        Create, edit, and explore{" "}
                        <span className="login-title-muted">with MovyAI</span>
                    </h1>
                </div>

                {/* RIGHT */}
                <div className="login-right">
                    <div className="login-card">
                        <div className="login-card-head">
                            <h2 className="login-card-title">Sign in</h2>

                        </div>

                        <p className="login-card-sub">Welcome back — let's continue.</p>

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
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/500px-Google_%22G%22_logo.svg.png" 
                                    alt="Google" 
                                    className="login-google-icon" 
                                />
                                Continue with Google
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

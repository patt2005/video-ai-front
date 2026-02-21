import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { object, string, ref, ValidationError } from 'yup';
import { useAuth } from '../../contexts/authContext';
import { paths } from '../../routes/paths';

const signupSchema = object({
    email: string().required('Email is required').email('Enter a valid email address'),
    password: string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: string()
        .required('Please confirm your password')
        .oneOf([ref('password')], 'Passwords must match'),
});

export default function SignUp() {
    const navigate = useNavigate();
    const { loginWithMockUser } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const payload = { email, password, confirmPassword };

        try {
            await signupSchema.validate(payload, { abortEarly: false });
            loginWithMockUser();
            navigate(paths.root, { replace: true });
        } catch (err) {
            if (err instanceof ValidationError) {
                const next: Record<string, string> = {};
                if (err.inner?.length) {
                    err.inner.forEach((e) => {
                        if (e.path) next[e.path] = e.message;
                    });
                } else if (err.path) {
                    next[err.path] = err.message;
                }
                setErrors(next);
            }
        }
    };

    return (
        <main className="signup-page login-page">
            <div className="login-blobs signup-blobs" aria-hidden="true">
                <div className="blob blob-purple" />
                <div className="blob blob-cyan" />
                <div className="blob-wash" />
            </div>

            <div className="login-layout signup-layout">
                <div className="login-left signup-copy">
                    <h1 className="login-title signup-value-prop">
                        Create videos in minutes, not hours
                    </h1>
                    <ul className="signup-features" aria-label="Features">
                        <li className="signup-feature-item">
                            <span className="signup-feature-icon" aria-hidden>🎬</span>
                            AI video generation
                        </li>
                        <li className="signup-feature-item">
                            <span className="signup-feature-icon" aria-hidden>✍️</span>
                            Script → video in one click
                        </li>
                        <li className="signup-feature-item">
                            <span className="signup-feature-icon" aria-hidden>🎨</span>
                            Smart styles & templates
                        </li>
                        <li className="signup-feature-item">
                            <span className="signup-feature-icon" aria-hidden>🚀</span>
                            Export ready for social
                        </li>
                    </ul>
                </div>

                <div className="login-right signup-form-wrap">
                    <div className="login-card signup-card">
                        <div className="login-card-head">
                            <h2 className="login-card-title">Create account</h2>
                        </div>

                        <p className="login-card-sub">
                            Get started — we'll have you creating in no time.
                        </p>

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className={`login-field${errors.email ? ' login-field--error' : ''}`}>
                                <label htmlFor="signup-email">Email</label>
                                <input
                                    id="signup-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? 'signup-email-error' : undefined}
                                />
                                {errors.email && (
                                    <p id="signup-email-error" className="login-field-error" role="alert">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className={`login-field${errors.password ? ' login-field--error' : ''}`}>
                                <label htmlFor="signup-password">Password</label>
                                <input
                                    id="signup-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    aria-invalid={!!errors.password}
                                    aria-describedby={errors.password ? 'signup-password-error' : undefined}
                                />
                                {errors.password && (
                                    <p id="signup-password-error" className="login-field-error" role="alert">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className={`login-field${errors.confirmPassword ? ' login-field--error' : ''}`}>
                                <label htmlFor="signup-confirm-password">Confirm password</label>
                                <input
                                    id="signup-confirm-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    aria-invalid={!!errors.confirmPassword}
                                    aria-describedby={errors.confirmPassword ? 'signup-confirm-password-error' : undefined}
                                />
                                {errors.confirmPassword && (
                                    <p id="signup-confirm-password-error" className="login-field-error" role="alert">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <button className="login-primary signup-primary" type="submit">
                                Create account
                            </button>

                            <div className="login-links signup-links">
                                <Link to={paths.login} className="login-link">
                                    Already have an account? Sign in
                                </Link>
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

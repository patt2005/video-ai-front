import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { object, string, ref, ValidationError } from 'yup';
import type { InferType } from 'yup';
import { useAuth } from '../../contexts/authContext';
import { paths } from '../../routes/paths';

const loginSchema = object({
    email: string().required('Email is required').email('Enter a valid email address'),
    password: string().required('Password is required').min(8, 'Password must be at least 8 characters'),
});

const signupSchema = loginSchema.shape({
    repeatPassword: string()
        .required('Please repeat your password')
        .oneOf([ref('password')], 'Passwords must match'),
});

type LoginFormValues = InferType<typeof loginSchema>;

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginWithMockUser } = useAuth();
    const isSignup = location.pathname === paths.signup;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues | 'repeatPassword', string>>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const payload = { email, password, ...(isSignup ? { repeatPassword } : {}) };

        try {
            if (isSignup) {
                await signupSchema.validate(payload, { abortEarly: false });
            } else {
                await loginSchema.validate(payload, { abortEarly: false });
            }
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
        <main className="login-page">
            <div className="login-blobs" aria-hidden="true">
                <div className="blob blob-purple" />
                <div className="blob blob-cyan" />
                <div className="blob-wash" />
            </div>

            <div className="login-layout">
                <div className="login-left">
                    <h1 className="login-title">
                        Create, edit, and explore{" "}
                        <span className="login-title-muted">with MovyAI</span>
                    </h1>
                    <p className="login-subtitle">
                        {isSignup
                            ? "Create an account to get started with AI-powered tools."
                            : "Sign in to your account to create, edit, and explore with AI-powered tools."}
                    </p>
                </div>

                <div className="login-right">
                                <div className="login-card">
                                    <div className="login-card-head">
                                        <h2 className="login-card-title">{isSignup ? 'Sign up' : 'Sign in'}</h2>
                                    </div>

                                    <p className="login-card-sub">
                                        {isSignup ? "Create your account — let's get started." : "Welcome back — let's continue."}
                                    </p>

                                    <form className="login-form" onSubmit={handleSubmit}>
                                        <div className={`login-field${errors.email ? ' login-field--error' : ''}`}>
                                            <label htmlFor="login-email">Email</label>
                                            <input
                                                id="login-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                autoComplete="email"
                                                aria-invalid={!!errors.email}
                                                aria-describedby={errors.email ? 'login-email-error' : undefined}
                                            />
                                            {errors.email && (
                                                <p id="login-email-error" className="login-field-error" role="alert">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className={`login-field${errors.password ? ' login-field--error' : ''}`}>
                                            <label htmlFor="login-password">Password</label>
                                            <input
                                                id="login-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                autoComplete={isSignup ? 'new-password' : 'current-password'}
                                                aria-invalid={!!errors.password}
                                                aria-describedby={errors.password ? 'login-password-error' : undefined}
                                            />
                                            {errors.password && (
                                                <p id="login-password-error" className="login-field-error" role="alert">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        {isSignup && (
                                            <div className={`login-field${errors.repeatPassword ? ' login-field--error' : ''}`}>
                                                <label htmlFor="login-repeat-password">Repeat password</label>
                                                <input
                                                    id="login-repeat-password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={repeatPassword}
                                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                                    autoComplete="new-password"
                                                    aria-invalid={!!errors.repeatPassword}
                                                    aria-describedby={errors.repeatPassword ? 'login-repeat-password-error' : undefined}
                                                />
                                                {errors.repeatPassword && (
                                                    <p id="login-repeat-password-error" className="login-field-error" role="alert">
                                                        {errors.repeatPassword}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <button className="login-primary" type="submit">
                                            {isSignup ? 'Sign up' : 'Login'}
                                        </button>

                                        <div className="login-links">
                                            {!isSignup && (
                                                <Link to={paths.signup} className="login-link">
                                                    Create account
                                                </Link>
                                            )}
                                            {!isSignup && (
                                                <button type="button" className="login-ghost">
                                                    Forgot password?
                                                </button>
                                            )}
                                            {isSignup && (
                                                <Link to={paths.login} className="login-link">
                                                    Already have an account? Sign in
                                                </Link>
                                            )}
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

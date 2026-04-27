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
    const { login } = useAuth();

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
            const success = login(email, password);
            if (success) {
                navigate(paths.root, { replace: true });
            } else {
                setErrors({
                    form: 'This demo only accepts existing test accounts. Sign in with e.g. mihai@movyai.app / password123',
                });
            }
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
        <main className="signup-page">
            <div className="login-blobs signup-blobs" aria-hidden="true">
                <div className="blob blob-purple" />
                <div className="blob blob-cyan" />
                <div className="blob-wash" />
            </div>

            <div className="signup-layout">
                <div className="login-left">
                    <div className="signup-video-card-wrap">
                        <div className="signup-video-card">
                            <video
                                className="signup-video"
                                src="https://static.higgsfield.ai/quiz-v2/kling-3-quiz.mp4"
                                autoPlay
                                controls
                                loop
                                muted
                                playsInline
                                preload="auto"
                                aria-label="MovyAI video demo"
                            />
                        </div>
                    </div>
                </div>
                
                    <div className="login-card signup-card">
                        <div className="login-card-head">
                            <h2 className="login-card-title">Create account</h2>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            {errors.form && (
                                <p className="login-field-error login-field-error--form" role="alert">
                                    {errors.form}
                                </p>
                            )}
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
                        </form>
                    </div>
                </div>
        </main>
    );
}

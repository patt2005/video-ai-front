import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { object, string, ref, ValidationError } from 'yup';
import { useAuth } from '../../contexts/authContext';
import { useApi } from '../../hooks/useApi';
import { authService } from '../../services/authService';
import { paths } from '../../routes/paths';

const signupSchema = object({
    username: string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    email: string().required('Email is required').email('Enter a valid email address'),
    password: string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: string()
        .required('Please confirm your password')
        .oneOf([ref('password')], 'Passwords must match'),
});

type Step = 'form' | 'code';

export default function SignUp() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const api = useApi();

    const [step, setStep] = useState<Step>('form');

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState('');
    const [sending, setSending] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            await signupSchema.validate({ username, email, password, confirmPassword }, { abortEarly: false });
        } catch (err) {
            if (err instanceof ValidationError) {
                const next: Record<string, string> = {};
                if (err.inner?.length) {
                    err.inner.forEach((e) => { if (e.path) next[e.path] = e.message; });
                } else if (err.path) {
                    next[err.path] = err.message;
                }
                setErrors(next);
            }
            return;
        }

        setSending(true);
        try {
            await authService.sendVerificationCode(api, email);
            setStep('code');
        } catch {
            setErrors({ form: 'Failed to send verification code. Please try again.' });
        } finally {
            setSending(false);
        }
    };

    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setCodeError('');

        if (code.length !== 6) {
            setCodeError('Please enter the 6-digit code sent to your email.');
            return;
        }

        setSubmitting(true);
        try {
            const verified = await authService.verifyCode(api, email, code);
            if (!verified) {
                setCodeError('Invalid or expired code. Please try again.');
                return;
            }

            const success = await register(username, email, password);
            if (success) {
                navigate(paths.root, { replace: true });
            } else {
                setCodeError('Could not create account. Email may already be in use.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        setCodeError('');
        setSending(true);
        try {
            await authService.sendVerificationCode(api, email);
        } catch {
            setCodeError('Failed to resend code. Please try again.');
        } finally {
            setSending(false);
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
                    {step === 'form' ? (
                        <>
                            <div className="login-card-head">
                                <h2 className="login-card-title">Create account</h2>
                            </div>

                            <form className="login-form" onSubmit={handleSendCode}>
                                {errors.form && (
                                    <p className="login-field-error login-field-error--form" role="alert">
                                        {errors.form}
                                    </p>
                                )}

                                <div className={`login-field${errors.username ? ' login-field--error' : ''}`}>
                                    <label htmlFor="signup-username">Username</label>
                                    <input
                                        id="signup-username"
                                        type="text"
                                        placeholder="your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        autoComplete="username"
                                    />
                                    {errors.username && (
                                        <p className="login-field-error" role="alert">{errors.username}</p>
                                    )}
                                </div>

                                <div className={`login-field${errors.email ? ' login-field--error' : ''}`}>
                                    <label htmlFor="signup-email">Email</label>
                                    <input
                                        id="signup-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                    {errors.email && (
                                        <p className="login-field-error" role="alert">{errors.email}</p>
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
                                    />
                                    {errors.password && (
                                        <p className="login-field-error" role="alert">{errors.password}</p>
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
                                    />
                                    {errors.confirmPassword && (
                                        <p className="login-field-error" role="alert">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <button className="login-primary signup-primary" type="submit" disabled={sending}>
                                    {sending ? 'Sending code…' : 'Send verification code'}
                                </button>

                                <div className="login-links signup-links">
                                    <Link to={paths.login} className="login-link">
                                        Already have an account? Sign in
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="login-card-head">
                                <h2 className="login-card-title">Verify your email</h2>
                                <p className="login-card-sub">
                                    We sent a 6-digit code to <strong>{email}</strong>
                                </p>
                            </div>

                            <form className="login-form" onSubmit={handleVerifyAndRegister}>
                                <div className={`login-field${codeError ? ' login-field--error' : ''}`}>
                                    <label htmlFor="signup-code">Verification code</label>
                                    <input
                                        id="signup-code"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="123456"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        autoComplete="one-time-code"
                                        autoFocus
                                    />
                                    {codeError && (
                                        <p className="login-field-error" role="alert">{codeError}</p>
                                    )}
                                </div>

                                <button className="login-primary signup-primary" type="submit" disabled={submitting}>
                                    {submitting ? 'Creating account…' : 'Create account'}
                                </button>

                                <div className="login-links signup-links">
                                    <button
                                        type="button"
                                        className="login-link"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                        onClick={handleResend}
                                        disabled={sending}
                                    >
                                        {sending ? 'Resending…' : "Didn't receive a code? Resend"}
                                    </button>
                                    <button
                                        type="button"
                                        className="login-link"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                        onClick={() => { setStep('form'); setCode(''); setCodeError(''); }}
                                    >
                                        Change email
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

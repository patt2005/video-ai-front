import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { object, string, ref, ValidationError } from 'yup';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/authContext';
import { useApi } from '../../hooks/useApi';
import { authService } from '../../services/authService';
import { paths } from '../../routes/paths';
import '../../styles/signup.css';

const signupSchema = object({
    username: string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    email: string().required('Email is required').email('Enter a valid email address'),
    password: string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: string()
        .required('Please confirm your password')
        .oneOf([ref('password')], 'Passwords must match'),
});

type Step = 'form' | 'code';

function getPasswordScore(pwd: string) {
    const checks = {
        len: pwd.length >= 8,
        upper: /[A-Z]/.test(pwd),
        lower: /[a-z]/.test(pwd),
        num: /\d/.test(pwd),
        sym: /[^A-Za-z0-9]/.test(pwd),
    };
    const score = [checks.len, checks.upper && checks.lower, checks.num, checks.sym].filter(Boolean).length;
    return { checks, score };
}

const STRENGTH_LABELS = ['—', 'Weak', 'OK', 'Strong', 'Great'];
const STRENGTH_CLASSES = ['', 'su-meter-s1', 'su-meter-s2', 'su-meter-s3', 'su-meter-s4'];

export default function SignUp() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const api = useApi();

    const [step, setStep] = useState<Step>('form');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState('');
    const [sending, setSending] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const id = setInterval(() => setResendCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
        return () => clearInterval(id);
    }, [resendCooldown]);

    const { checks, score } = getPasswordScore(password);
    const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
    const usernameValid = /^[a-z0-9_.-]{3,20}$/i.test(username);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const formReady = usernameValid && emailValid && score >= 3 && passwordsMatch && termsAccepted;

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
            setResendCooldown(60);
        } catch {
            setErrors({ form: 'Failed to send verification code. Please try again.' });
        } finally {
            setSending(false);
        }
    };

    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setCodeError('');
        if (code.length !== 6) { setCodeError('Please enter the 6-digit code sent to your email.'); return; }
        setSubmitting(true);
        try {
            const verified = await authService.verifyCode(api, email, code);
            if (!verified) { setCodeError('Invalid or expired code. Please try again.'); return; }
            const success = await register(username, email, password);
            if (success) { navigate(paths.root, { replace: true }); }
            else { setCodeError('Could not create account. Email may already be in use.'); }
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setCodeError('');
        setSending(true);
        try {
            await authService.sendVerificationCode(api, email);
            setResendCooldown(60);
        } catch {
            setCodeError('Failed to resend code. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="su-page">
            <div className="su-container">
                <div className="su-wrap">

                    {/* ── LEFT: form panel ── */}
                    <div className="su-form-panel">
                        <div className="su-eyebrow">Create account</div>
                        <h1 className="su-title">Start shipping <em>finished work.</em></h1>
                        <p className="su-sub">Free forever. No credit card. Three renders a day, every day.</p>

                        {step === 'form' ? (
                            <form className="su-form" onSubmit={handleSendCode} noValidate>
                                {errors.form && (
                                    <div className="su-error-banner" role="alert">{errors.form}</div>
                                )}

                                <div className="su-fields">
                                    {/* Username */}
                                    <div className="su-field">
                                        <label htmlFor="su-username" className="su-label">
                                            Username
                                            {username && (
                                                <span className="su-label-meta">
                                                    {usernameValid ? 'looks good' : '3–20 chars, letters/numbers/_.-'}
                                                </span>
                                            )}
                                        </label>
                                        <div className={`su-input-wrap${usernameValid && username ? ' su-input-valid' : ''}${errors.username ? ' su-input-error' : ''}`}>
                                            <span className="su-input-ico">
                                                <Icon icon="mdi:account-outline" width={16} />
                                            </span>
                                            <input
                                                id="su-username"
                                                type="text"
                                                placeholder="your-handle"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                autoComplete="username"
                                            />
                                            {usernameValid && username && (
                                                <span className="su-input-status">
                                                    <Icon icon="mdi:check" width={14} />
                                                </span>
                                            )}
                                        </div>
                                        {errors.username && <p className="su-field-error">{errors.username}</p>}
                                    </div>

                                    {/* Email */}
                                    <div className="su-field">
                                        <label htmlFor="su-email" className="su-label">Email</label>
                                        <div className={`su-input-wrap${emailValid && email ? ' su-input-valid' : ''}${errors.email ? ' su-input-error' : ''}`}>
                                            <span className="su-input-ico">
                                                <Icon icon="mdi:email-outline" width={16} />
                                            </span>
                                            <input
                                                id="su-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                autoComplete="email"
                                            />
                                            {emailValid && email && (
                                                <span className="su-input-status">
                                                    <Icon icon="mdi:check" width={14} />
                                                </span>
                                            )}
                                        </div>
                                        {errors.email && <p className="su-field-error">{errors.email}</p>}
                                    </div>

                                    {/* Password */}
                                    <div className="su-field">
                                        <label htmlFor="su-password" className="su-label">
                                            Password
                                            <span className="su-label-meta">{score >= 3 ? 'strong enough' : 'at least 8 characters'}</span>
                                        </label>
                                        <div className={`su-input-wrap${errors.password ? ' su-input-error' : ''}`}>
                                            <span className="su-input-ico">
                                                <Icon icon="mdi:lock-outline" width={16} />
                                            </span>
                                            <input
                                                id="su-password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="At least 8 characters"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                className="su-reveal-btn"
                                                onClick={() => setShowPassword((v) => !v)}
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={16} />
                                            </button>
                                        </div>
                                        {errors.password && <p className="su-field-error">{errors.password}</p>}

                                        {/* Strength meter */}
                                        {password && (
                                            <>
                                                <div className="su-meter">
                                                    <div className="su-meter-bar">
                                                        <div className={`su-meter-fill ${STRENGTH_CLASSES[score]}`} />
                                                    </div>
                                                    <div className="su-meter-label">{STRENGTH_LABELS[score]}</div>
                                                </div>
                                                <div className="su-rules">
                                                    <div className={`su-rule${checks.len ? ' su-rule--ok' : ''}`}>
                                                        <span className="su-rule-ic"><Icon icon="mdi:check" width={8} /></span>
                                                        8+ characters
                                                    </div>
                                                    <div className={`su-rule${checks.upper && checks.lower ? ' su-rule--ok' : ''}`}>
                                                        <span className="su-rule-ic"><Icon icon="mdi:check" width={8} /></span>
                                                        Upper + lower case
                                                    </div>
                                                    <div className={`su-rule${checks.num ? ' su-rule--ok' : ''}`}>
                                                        <span className="su-rule-ic"><Icon icon="mdi:check" width={8} /></span>
                                                        A number
                                                    </div>
                                                    <div className={`su-rule${checks.sym ? ' su-rule--ok' : ''}`}>
                                                        <span className="su-rule-ic"><Icon icon="mdi:check" width={8} /></span>
                                                        A symbol
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Confirm password */}
                                    <div className="su-field">
                                        <label htmlFor="su-confirm" className="su-label">Confirm password</label>
                                        <div className={`su-input-wrap${passwordsMatch ? ' su-input-valid' : ''}${errors.confirmPassword ? ' su-input-error' : ''}`}>
                                            <span className="su-input-ico">
                                                <Icon icon="mdi:lock-outline" width={16} />
                                            </span>
                                            <input
                                                id="su-confirm"
                                                type={showConfirm ? 'text' : 'password'}
                                                placeholder="Re-enter password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                className="su-reveal-btn"
                                                onClick={() => setShowConfirm((v) => !v)}
                                                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                            >
                                                <Icon icon={showConfirm ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={16} />
                                            </button>
                                            {passwordsMatch && (
                                                <span className="su-input-status">
                                                    <Icon icon="mdi:check" width={14} />
                                                </span>
                                            )}
                                        </div>
                                        {errors.confirmPassword && <p className="su-field-error">{errors.confirmPassword}</p>}
                                    </div>
                                </div>

                                {/* Terms */}
                                <label className="su-terms">
                                    <input
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                    />
                                    <span className="su-checkbox">
                                        <Icon icon="mdi:check" width={11} style={{ color: '#fff' }} />
                                    </span>
                                    <span className="su-terms-text">
                                        I agree to the <Link to={paths.terms} target="_blank" rel="noopener noreferrer">Terms of Service</Link> and <Link to={paths.privacy} target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
                                    </span>
                                </label>

                                <button type="submit" className="su-submit" disabled={!formReady || sending}>
                                    {sending ? (
                                        <><Icon icon="mdi:loading" width={16} className="su-spinner" />Sending code…</>
                                    ) : (
                                        <>Send verification code <Icon icon="mdi:arrow-right" width={14} /></>
                                    )}
                                </button>

                                <p className="su-signin-link">
                                    Already have an account? <Link to={paths.login}>Sign in</Link>
                                </p>
                            </form>
                        ) : (
                            /* ── Step 2: verify code ── */
                            <form className="su-form" onSubmit={handleVerifyAndRegister} noValidate>
                                <div className="su-verify-head">
                                    <div className="su-verify-ico">
                                        <Icon icon="mdi:email-check-outline" width={28} style={{ color: '#A78BFA' }} />
                                    </div>
                                    <p className="su-verify-sub">
                                        We sent a 6-digit code to <strong>{email}</strong>
                                    </p>
                                </div>

                                <div className="su-fields">
                                    <div className="su-field">
                                        <label htmlFor="su-code" className="su-label">Verification code</label>
                                        <div className={`su-input-wrap${codeError ? ' su-input-error' : ''}`}>
                                            <span className="su-input-ico">
                                                <Icon icon="mdi:shield-key-outline" width={16} />
                                            </span>
                                            <input
                                                id="su-code"
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                placeholder="123456"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                autoComplete="one-time-code"
                                                autoFocus
                                            />
                                        </div>
                                        {codeError && <p className="su-field-error">{codeError}</p>}
                                    </div>
                                </div>

                                <button type="submit" className="su-submit" disabled={submitting || code.length !== 6}>
                                    {submitting ? (
                                        <><Icon icon="mdi:loading" width={16} className="su-spinner" />Creating account…</>
                                    ) : (
                                        <>Create account <Icon icon="mdi:arrow-right" width={14} /></>
                                    )}
                                </button>

                                <div className="su-verify-links">
                                    <button
                                        type="button"
                                        className="su-link-btn"
                                        onClick={handleResend}
                                        disabled={sending || resendCooldown > 0}
                                    >
                                        {sending ? 'Resending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive it? Resend"}
                                    </button>
                                    <span className="su-link-sep" aria-hidden>·</span>
                                    <button
                                        type="button"
                                        className="su-link-btn"
                                        onClick={() => { setStep('form'); setCode(''); setCodeError(''); }}
                                    >
                                        Change email
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* ── RIGHT: video panel ── */}
                    <aside className="su-video-panel">
                        <video
                            className="su-video"
                            src="https://static.higgsfield.ai/quiz-v2/kling-3-quiz.mp4"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                        <div className="su-video-overlay" aria-hidden />

                        <div className="su-video-content">
                            <div className="su-video-top">
                                <span className="su-live-badge">
                                    <span className="su-live-dot" />
                                    Live render
                                </span>
                                <span className="su-prompt-pill">
                                    <Icon icon="mdi:pencil-outline" width={12} />
                                    "Night drive, 80s muscle car, headlights cutting through fog"
                                </span>
                            </div>

                            <div className="su-video-bottom">
                                <p className="su-quote">"I shipped a 6-shot reel <em>in an evening.</em> The first cut of the year that actually felt like mine."</p>
                                <div className="su-attribution">
                                    <div className="su-avatar">MV</div>
                                    <div className="su-who">
                                        <span className="su-who-name">Mara Voss</span>
                                        <span className="su-who-role">Director · @maravoss</span>
                                    </div>
                                </div>
                                <div className="su-stats">
                                    <div className="su-stat">
                                        <div className="su-stat-n">120<em>K</em></div>
                                        <div className="su-stat-l">creators</div>
                                    </div>
                                    <div className="su-stat">
                                        <div className="su-stat-n">8.4<em>M</em></div>
                                        <div className="su-stat-l">renders shipped</div>
                                    </div>
                                    <div className="su-stat">
                                        <div className="su-stat-n">4.9<em>★</em></div>
                                        <div className="su-stat-l">app store</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}

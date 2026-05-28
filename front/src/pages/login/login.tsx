import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { object, string, ValidationError } from 'yup';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/authContext';
import { paths } from '../../routes/paths';
import '../../styles/login.css';

const loginSchema = object({
    email: string().required('Email is required').email('Enter a valid email address'),
    password: string().required('Password is required').min(8, 'Password must be at least 8 characters'),
});

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            await loginSchema.validate({ email, password }, { abortEarly: false });
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

        setSubmitting(true);
        try {
            const result = await login(email, password);
            if (result.ok) {
                navigate(paths.root, { replace: true });
            } else if (result.reason === 'blocked') {
                setErrors({ form: 'Your account is blocked. Contact an administrator.' });
            } else if (result.reason === 'network') {
                setErrors({ form: 'Network error. Please try again.' });
            } else {
                setErrors({ form: 'Invalid email or password.' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="li-page">
            <div className="li-container">
                <div className="li-wrap">
                    <div className="li-card">

                        {/* ── Card head ── */}
                        <div className="li-card-head">
                            <img src="/icon-512.png" alt="MovyAI" className="li-card-logo" />
                            <h1 className="li-title">Welcome <em>back.</em></h1>
                            <p className="li-sub">Pick up where you left off.</p>
                        </div>

                        {/* ── Form ── */}
                        <form className="li-form" onSubmit={handleSubmit} noValidate>
                            {errors.form && (
                                <div className="li-error-banner" role="alert">{errors.form}</div>
                            )}

                            {/* Email */}
                            <div className="li-field">
                                <label htmlFor="li-email" className="li-label">Email</label>
                                <div className={`li-input-wrap${errors.email ? ' li-input-error' : ''}`}>
                                    <span className="li-input-ico">
                                        <Icon icon="mdi:email-outline" width={16} />
                                    </span>
                                    <input
                                        id="li-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && <p className="li-field-error">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div className="li-field">
                                <label htmlFor="li-password" className="li-label">
                                    Password
                                    <Link to={paths.forgotPassword} className="li-forgot">Forgot?</Link>
                                </label>
                                <div className={`li-input-wrap${errors.password ? ' li-input-error' : ''}`}>
                                    <span className="li-input-ico">
                                        <Icon icon="mdi:lock-outline" width={16} />
                                    </span>
                                    <input
                                        id="li-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="li-reveal-btn"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={16} />
                                    </button>
                                </div>
                                {errors.password && <p className="li-field-error">{errors.password}</p>}
                            </div>

                            {/* Remember me */}
                            <div className="li-row-between">
                                <label className="li-check-line">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="li-checkbox">
                                        <Icon icon="mdi:check" width={11} style={{ color: '#fff' }} />
                                    </span>
                                    Remember me for 30 days
                                </label>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="li-submit" disabled={submitting}>
                                {submitting ? (
                                    <><Icon icon="mdi:loading" width={16} className="li-spinner" />Signing in…</>
                                ) : (
                                    <>Log in <Icon icon="mdi:arrow-right" width={14} /></>
                                )}
                            </button>

                        </form>

                        {/* ── Card footer ── */}
                        <div className="li-card-foot">
                            New to MovyAI? <Link to={paths.signup}>Create an account</Link>
                        </div>
                        <div className="li-card-foot" style={{ marginTop: 0, paddingTop: 12, borderTop: 'none', fontSize: '12px' }}>
                            <Link to={paths.terms} target="_blank" rel="noopener noreferrer">Terms of Service</Link>
                            <span style={{ margin: '0 8px', color: '#6A6678' }}>·</span>
                            <Link to={paths.privacy} target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiContext } from '../../contexts/apiContext';
import { useAuth } from '../../contexts/authContext';
import { authService } from '../../services/authService';
import { paths } from '../../routes/paths';

export default function VerifyEmail() {
    const { api } = useContext(ApiContext)!;
    const { user, isLoggedIn, updateUser } = useAuth();
    const navigate = useNavigate();

    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sending, setSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [sentInitial, setSentInitial] = useState(false);

    useEffect(() => {
        if (cooldown <= 0) return;
        const id = setInterval(() => setCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
        return () => clearInterval(id);
    }, [cooldown]);

    useEffect(() => {
        if (!isLoggedIn || !user?.email || sentInitial) return;
        if (user.isEmailVerified) return;
        setSentInitial(true);
        authService.sendVerificationCode(api, user.email)
            .then(() => setCooldown(60))
            .catch(() => { /* silent */ });
    }, [api, isLoggedIn, user?.email, user?.isEmailVerified, sentInitial]);

    if (!isLoggedIn) {
        return (
            <main className="login-page">
                <div className="login-blobs" aria-hidden="true">
                    <div className="blob blob-purple" />
                    <div className="blob blob-cyan" />
                    <div className="blob-wash" />
                </div>
                <div className="login-card">
                    <div className="login-card-head">
                        <h2 className="login-card-title">Email verification</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>You must be logged in to verify your email.</p>
                    <Link to={paths.login} style={{ display: 'inline-block', marginTop: 16 }}>Go to login</Link>
                </div>
            </main>
        );
    }

    if (user?.isEmailVerified) {
        return (
            <main className="login-page">
                <div className="login-blobs" aria-hidden="true">
                    <div className="blob blob-purple" />
                    <div className="blob blob-cyan" />
                    <div className="blob-wash" />
                </div>
                <div className="login-card">
                    <div className="login-card-head">
                        <h2 className="login-card-title">Email verification</h2>
                    </div>
                    <p>Your email is already verified.</p>
                    <Link to={paths.profile} className="login-primary" style={{ display: 'inline-block', marginTop: 16, padding: '10px 20px', textDecoration: 'none', borderRadius: 8 }}>
                        Back to profile
                    </Link>
                </div>
            </main>
        );
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setCodeError('');

        if (code.length !== 6) {
            setCodeError('Please enter the 6-digit code sent to your email.');
            return;
        }

        if (!user?.email) return;

        try {
            setSubmitting(true);
            const ok = await authService.verifyCode(api, user.email, code);
            if (!ok) {
                setCodeError('Invalid or expired code. Try again.');
                return;
            }
            updateUser({ isEmailVerified: true });
            toast.success('Email verified successfully.');
            navigate(paths.profile);
        } catch {
            setCodeError('Failed to verify. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || sending || !user?.email) return;
        setCodeError('');
        try {
            setSending(true);
            await authService.sendVerificationCode(api, user.email);
            setCooldown(60);
            toast.success('Code sent. Check your inbox.');
        } catch {
            toast.error('Failed to resend code.');
        } finally {
            setSending(false);
        }
    };

    return (
        <main className="login-page">
            <div className="login-blobs" aria-hidden="true">
                <div className="blob blob-purple" />
                <div className="blob blob-cyan" />
                <div className="blob-wash" />
            </div>
            <div className="login-card">
                <div className="login-card-head">
                    <h2 className="login-card-title">Verify your email</h2>
                    <p className="login-card-sub" style={{ marginTop: 8 }}>
                        We sent a 6-digit code to <strong>{user?.email}</strong>
                    </p>
                </div>

                <form className="login-form" onSubmit={handleVerify}>
                    <div className={`login-field${codeError ? ' login-field--error' : ''}`}>
                        <label htmlFor="verify-code">Verification code</label>
                        <input
                            id="verify-code"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            autoComplete="one-time-code"
                            autoFocus
                        />
                        {codeError && <p className="login-field-error" role="alert">{codeError}</p>}
                    </div>

                    <button className="login-primary signup-primary" type="submit" disabled={submitting || code.length !== 6}>
                        {submitting ? 'Verifying…' : 'Verify email'}
                    </button>

                    <div className="login-links signup-links" style={{ marginTop: 18 }}>
                        <button
                            type="button"
                            className="login-link"
                            onClick={handleResend}
                            disabled={sending || cooldown > 0}
                        >
                            {sending
                                ? 'Sending…'
                                : cooldown > 0
                                    ? `Resend in ${cooldown}s`
                                    : "Didn't receive a code? Resend"}
                        </button>
                        <span className="signup-links-separator" aria-hidden />
                        <Link to={paths.profile} className="login-link">
                            Back to profile
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}

import { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiContext } from '../../contexts/apiContext';
import { useAuth } from '../../contexts/authContext';
import { authService } from '../../services/authService';
import { paths } from '../../routes/paths';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function VerifyEmail() {
    const { api } = useContext(ApiContext)!;
    const { user, isLoggedIn, updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<Status>(token ? 'loading' : 'idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!token) return;
        authService.verifyEmail(api, token)
            .then(() => {
                setStatus('success');
                if (isLoggedIn) updateUser({ isEmailVerified: true });
            })
            .catch((err) => {
                setStatus('error');
                setErrorMessage(err?.response?.data?.error ?? 'Verification failed.');
            });
    }, [api, token, isLoggedIn, updateUser]);

    const handleResend = async () => {
        try {
            setResending(true);
            await authService.resendVerification(api);
            toast.success('Verification email sent. Check your inbox.');
        } catch (err) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 400) toast.info('Your email is already verified.');
            else toast.error('Failed to send verification email.');
        } finally {
            setResending(false);
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
                    <h2 className="login-card-title">Email verification</h2>
                </div>

                {status === 'loading' && (
                    <p style={{ color: 'var(--text-muted)' }}>Verifying your email…</p>
                )}

                {status === 'success' && (
                    <>
                        <p>Your email has been verified.</p>
                        <Link
                            to={isLoggedIn ? paths.profile : paths.login}
                            className="login-primary"
                            style={{ display: 'inline-block', marginTop: 16, padding: '10px 20px', textDecoration: 'none', borderRadius: 8 }}
                        >
                            {isLoggedIn ? 'Back to profile' : 'Go to login'}
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <p style={{ color: '#dc2626', marginBottom: 16 }}>{errorMessage}</p>
                        {isLoggedIn && !user?.isEmailVerified && (
                            <button
                                type="button"
                                className="login-primary"
                                onClick={handleResend}
                                disabled={resending}
                                style={{ marginRight: 12 }}
                            >
                                {resending ? 'Sending…' : 'Send a new email'}
                            </button>
                        )}
                        <Link to={isLoggedIn ? paths.profile : paths.login} style={{ marginLeft: 12 }}>
                            {isLoggedIn ? 'Back to profile' : 'Back to login'}
                        </Link>
                    </>
                )}

                {status === 'idle' && (
                    <>
                        {isLoggedIn && user && !user.isEmailVerified && (
                            <>
                                <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
                                    We sent a verification link to <strong>{user.email}</strong>.
                                </p>
                                <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
                                    Click the link in the email to confirm your address. If you don't see it, check spam or request a new one.
                                </p>
                                <button
                                    type="button"
                                    className="login-primary"
                                    onClick={handleResend}
                                    disabled={resending}
                                    style={{ padding: '10px 20px', borderRadius: 8 }}
                                >
                                    {resending ? 'Sending…' : 'Resend verification email'}
                                </button>
                            </>
                        )}
                        {isLoggedIn && user?.isEmailVerified && (
                            <>
                                <p>Your email is already verified.</p>
                                <Link to={paths.profile} style={{ display: 'inline-block', marginTop: 16 }}>
                                    Back to profile
                                </Link>
                            </>
                        )}
                        {!isLoggedIn && (
                            <>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Open the verification link from your email to confirm your address.
                                </p>
                                <Link to={paths.login} style={{ display: 'inline-block', marginTop: 16 }}>
                                    Back to login
                                </Link>
                            </>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

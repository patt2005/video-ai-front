import { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiContext } from '../../contexts/apiContext';
import { authService } from '../../services/authService';
import { paths } from '../../routes/paths';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
    const { api } = useContext(ApiContext)!;
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<Status>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('No verification token in URL.');
            return;
        }
        authService.verifyEmail(api, token)
            .then(() => setStatus('success'))
            .catch((err) => {
                setStatus('error');
                setErrorMessage(err?.response?.data?.error ?? 'Verification failed.');
            });
    }, [api, token]);

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
                {status === 'loading' && <p>Verifying your email…</p>}
                {status === 'success' && (
                    <>
                        <p>Your email has been verified. You can now log in.</p>
                        <Link to={paths.login} className="login-primary" style={{ display: 'inline-block', marginTop: 16, padding: '8px 16px', textDecoration: 'none' }}>
                            Go to login
                        </Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <p style={{ color: '#dc2626' }}>{errorMessage}</p>
                        <Link to={paths.login} style={{ display: 'inline-block', marginTop: 16 }}>
                            Back to login
                        </Link>
                    </>
                )}
            </div>
        </main>
    );
}

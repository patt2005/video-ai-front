import { useState } from 'react';
import { Link } from 'react-router-dom';
import { object, string, ValidationError } from 'yup';
import { useApi } from '../../hooks/useApi';
import { authService } from '../../services/authService';
import { paths } from '../../routes/paths';

const forgotSchema = object({
    email: string().required('Email is required').email('Enter a valid email address'),
});

export default function ForgotPassword() {
    const api = useApi();

    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            await forgotSchema.validate({ email }, { abortEarly: false });
        } catch (err) {
            if (err instanceof ValidationError) {
                const next: Record<string, string> = {};
                err.inner.forEach((e) => { if (e.path) next[e.path] = e.message; });
                setErrors(next);
            }
            return;
        }

        setSubmitting(true);
        try {
            await authService.forgotPassword(api, email);
            setSent(true);
        } catch {
            setErrors({ form: 'Could not send reset email. Please try again.' });
        } finally {
            setSubmitting(false);
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
                    <h2 className="login-card-title">Forgot password</h2>
                    {!sent && (
                        <p className="login-card-sub" style={{ marginTop: 8 }}>
                            Enter your account email and we'll send you a reset link.
                        </p>
                    )}
                </div>

                {sent ? (
                    <>
                        <p style={{ color: 'var(--text-muted)' }}>
                            If an account exists for <strong>{email}</strong>, a reset link has been sent.
                            The link expires in 1 hour.
                        </p>
                        <div className="login-links signup-links" style={{ marginTop: 18 }}>
                            <Link to={paths.login} className="login-link">Back to login</Link>
                        </div>
                    </>
                ) : (
                    <form className="login-form" onSubmit={handleSubmit}>
                        {errors.form && (
                            <p className="login-field-error login-field-error--form" role="alert">
                                {errors.form}
                            </p>
                        )}
                        <div className={`login-field${errors.email ? ' login-field--error' : ''}`}>
                            <label htmlFor="forgot-email">Email</label>
                            <input
                                id="forgot-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                autoFocus
                            />
                            {errors.email && (
                                <p className="login-field-error" role="alert">{errors.email}</p>
                            )}
                        </div>

                        <button className="login-primary signup-primary" type="submit" disabled={submitting}>
                            {submitting ? 'Sending…' : 'Send reset link'}
                        </button>

                        <div className="login-links signup-links" style={{ marginTop: 18 }}>
                            <Link to={paths.login} className="login-link">Back to login</Link>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}

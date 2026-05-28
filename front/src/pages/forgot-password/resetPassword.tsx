import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { object, string, ref, ValidationError } from 'yup';
import { useApi } from '../../hooks/useApi';
import { authService } from '../../services/authService';
import { paths } from '../../routes/paths';

const resetSchema = object({
    password: string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: string()
        .required('Please confirm your password')
        .oneOf([ref('password')], 'Passwords must match'),
});

export default function ResetPassword() {
    const api = useApi();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    if (!token) {
        return (
            <main className="login-page">
                <div className="login-blobs" aria-hidden="true">
                    <div className="blob blob-purple" />
                    <div className="blob blob-cyan" />
                    <div className="blob-wash" />
                </div>
                <div className="login-card">
                    <div className="login-card-head">
                        <h2 className="login-card-title">Reset password</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Missing or invalid reset link. Request a new one.
                    </p>
                    <div className="login-links signup-links" style={{ marginTop: 18 }}>
                        <Link to={paths.forgotPassword} className="login-link">Request new link</Link>
                    </div>
                </div>
            </main>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            await resetSchema.validate({ password, confirmPassword }, { abortEarly: false });
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
            const ok = await authService.resetPassword(api, token, password);
            if (!ok) {
                setErrors({ form: 'Invalid or expired reset link. Request a new one.' });
                return;
            }
            toast.success('Password updated. You can now log in.');
            navigate(paths.login, { replace: true });
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
                    <h2 className="login-card-title">Choose a new password</h2>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {errors.form && (
                        <p className="login-field-error login-field-error--form" role="alert">
                            {errors.form}
                        </p>
                    )}

                    <div className={`login-field${errors.password ? ' login-field--error' : ''}`}>
                        <label htmlFor="reset-password">New password</label>
                        <input
                            id="reset-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            autoFocus
                        />
                        {errors.password && (
                            <p className="login-field-error" role="alert">{errors.password}</p>
                        )}
                    </div>

                    <div className={`login-field${errors.confirmPassword ? ' login-field--error' : ''}`}>
                        <label htmlFor="reset-confirm-password">Confirm password</label>
                        <input
                            id="reset-confirm-password"
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

                    <button className="login-primary signup-primary" type="submit" disabled={submitting}>
                        {submitting ? 'Updating…' : 'Update password'}
                    </button>

                    <div className="login-links signup-links" style={{ marginTop: 18 }}>
                        <Link to={paths.login} className="login-link">Back to login</Link>
                    </div>
                </form>
            </div>
        </main>
    );
}

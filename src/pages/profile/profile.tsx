import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Profile.css';

function formatRole(role: string) {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function formatRegisterDate(isoDate: string | undefined) {
    if (!isoDate) return null;
    try {
        const d = new Date(isoDate);
        return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return isoDate;
    }
}

export default function Profile() {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const displayEmail = user.email || `${user.username}@movyai.app`;
    const registerDateFormatted = formatRegisterDate(user.registerDate);

    return (
        <div className="page-wrapper profile-wrapper">
            <h1 className="page-title profile-title">Profilul Meu</h1>
            <div className="profile-card">
                <div className="profile-content">
                    <Icon icon="solar:user-circle-bold" width="80" color="#8b5cf6" />
                    <div>
                        <h2 className="profile-name">{user.username}</h2>
                        <p className="profile-email">{displayEmail}</p>
                        <span className="profile-role">Rol: {formatRole(user.role)}</span>
                        {registerDateFormatted && (
                            <p className="profile-register-date">
                                Membru din: {registerDateFormatted}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

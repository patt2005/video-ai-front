import { Icon } from '@iconify/react';
import './Profile.css';

// Aceasta este Interfața pentru utilizator (Cerința Nota 6)
interface UserProfile {
    name: string;
    email: string;
    role: 'User' | 'Admin';
}

export default function Profile() {
    // Date simulate (Mock Data - Cerința Nota 7)
    const user: UserProfile = {
        name: "Silviu AI Creator",
        email: "silviu@higgsclone.ai",
        role: 'Admin'
    };

    return (
        <div className="page-wrapper profile-wrapper">
            <h1 className="page-title profile-title">Profilul Meu</h1>
            {/* Casetă neagră stil Higgsfield (Layout - Cerința Nota 6) */}
            <div className="profile-card">
                <div className="profile-content">
                    <Icon icon="solar:user-circle-bold" width="80" color="#8b5cf6" />
                    <div>
                        <h2 className="profile-name">{user.name}</h2>
                        <p className="profile-email">{user.email}</p>
                        <span className="profile-role">Rol: {user.role}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

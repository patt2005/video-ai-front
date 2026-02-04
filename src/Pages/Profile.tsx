import { Icon } from '@iconify/react';

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
        <div className="page-wrapper" style={{ padding: '40px' }}>
            <h1 className="page-title" style={{ color: '#8b5cf6' }}>Profilul Meu</h1>
            {/* Casetă neagră stil Higgsfield (Layout - Cerința Nota 6) */}
            <div style={{ background: '#141414', padding: '30px', borderRadius: '15px', border: '1px solid #333', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Icon icon="solar:user-circle-bold" width="80" color="#8b5cf6" />
                    <div>
                        <h2 style={{ margin: 0 }}>{user.name}</h2>
                        <p style={{ color: '#9ca3af', margin: '5px 0' }}>{user.email}</p>
                        <span style={{ background: '#8b5cf6', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
               Rol: {user.role}
            </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useState } from 'react';
import '../../styles/Admin.css';
import { mockUsers } from '../../_mock/user';

function formatRegisterDate(isoDate: string | undefined) {
    if (!isoDate) return '—';
    try {
        const d = new Date(isoDate);
        return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return isoDate;
    }
}

export default function Admin() {
    const [users, setUsers] = useState(mockUsers);

    const handleDelete = (id: number) => {
        setUsers(users.filter((u) => u.id !== id));
    };

    return (
        <div className="page-wrapper admin-wrapper">
            <h1 className="page-title admin-title">Panou de Control (Admin)</h1>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Data înregistrării</th>
                            <th>Rol</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email ?? '—'}</td>
                                <td>{formatRegisterDate(user.registerDate)}</td>
                                <td className={user.role === 'admin' ? 'role-admin' : 'role-user'}>
                                    {user.role}
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(user.id)}
                                        className="admin-delete-btn"
                                    >
                                        Șterge
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

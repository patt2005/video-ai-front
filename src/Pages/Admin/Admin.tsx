import { useState } from 'react';
import './Admin.css';

export default function Admin() {
    // Utilizarea hook-ului useState pentru mock data (Nota 7 & 8)
    const [videos, setVideos] = useState([
        { id: 1, title: 'Cyberpunk Astronaut', status: 'Terminat' },
        { id: 2, title: 'Mars Colony', status: 'În procesare' },
        { id: 3, title: 'Neon Cityscape', status: 'Terminat' }
    ]);

    // Funcție handling pentru procesarea datelor (Nota 8 & 16)
    const handleDelete = (id: number) => {
        setVideos(videos.filter(v => v.id !== id));
    };

    return (
        <div className="page-wrapper admin-wrapper">
            <h1 className="page-title admin-title">Panou de Control (Admin)</h1>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Titlu Video</th>
                        <th>Status</th>
                        <th>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {videos.map(v => (
                        <tr key={v.id}>
                            <td>{v.id}</td>
                            <td>{v.title}</td>
                            <td className={v.status === 'Terminat' ? 'status-completed' : 'status-processing'}>{v.status}</td>
                            <td>
                                <button
                                    onClick={() => handleDelete(v.id)}
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

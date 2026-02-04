import { useState } from 'react';

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
        <div className="page-wrapper" style={{ padding: '40px' }}>
            <h1 className="page-title" style={{ marginBottom: '20px' }}>Panou de Control (Adminnp)</h1>
            <div style={{ background: '#141414', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                    <thead style={{ background: '#1a1a1a' }}>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                        <th style={{ padding: '15px' }}>ID</th>
                        <th>Titlu Video</th>
                        <th>Status</th>
                        <th>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {videos.map(v => (
                        <tr key={v.id} style={{ borderBottom: '1px solid #222' }}>
                            <td style={{ padding: '15px' }}>{v.id}</td>
                            <td>{v.title}</td>
                            <td style={{ color: v.status === 'Terminat' ? '#4caf50' : '#ff9800' }}>{v.status}</td>
                            <td>
                                <button
                                    onClick={() => handleDelete(v.id)}
                                    style={{ background: 'none', border: '1px solid #ff4444', color: '#ff4444', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}
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
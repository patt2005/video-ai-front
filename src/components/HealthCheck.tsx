import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi.ts';
import { getHealth } from '../services/healthApi.ts';

type LoadState = 'loading' | 'success' | 'error';

export default function HealthCheck() {
    const api = useApi();
    const [status, setStatus] = useState<LoadState>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let active = true;

        async function runHealthCheck() {
            try {
                const result = await getHealth(api);
                if (!active) return;
                setMessage(result);
                setStatus('success');
            } catch (error) {
                if (!active) return;
                console.error('Health check failed:', error);
                setStatus('error');
            }
        }

        runHealthCheck();

        return () => {
            active = false;
        };
    }, [api]);

    if (status === 'loading') {
        return <p>Checking backend health...</p>;
    }

    if (status === 'error') {
        return <p>Health check failed.</p>;
    }

    return <p>Backend health: {message}</p>;
}

import { useContext } from 'react';
import { ApiContext } from '../contexts/apiContext.tsx';

export function useApi() {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used inside ApiProvider');
    }
    return context.api;
}

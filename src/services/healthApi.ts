import type { AxiosInstance } from 'axios';

export async function getHealth(api: AxiosInstance): Promise<string> {
    const response = await api.get('/api/health');
    if (typeof response.data === 'string') {
        return response.data;
    }
    return JSON.stringify(response.data);
}

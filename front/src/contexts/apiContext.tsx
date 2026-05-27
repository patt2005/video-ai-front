import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { createContext, useMemo, type ReactNode } from 'react';

type ApiContextValue = {
    api: AxiosInstance;
};

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

type ApiProviderProps = {
    children: ReactNode;
};

const API_BASE_URL = 'http://localhost:5014';

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const response = await axios.post(`${API_BASE_URL}/api/User/Refresh`, { refreshToken });
        const data = response.data as { token: string; refreshToken: string };
        localStorage.setItem('token', data.token);
        localStorage.setItem('refresh_token', data.refreshToken);
        return data.token;
    })();
    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
}

export function ApiProvider({ children }: ApiProviderProps) {
    const api = useMemo(() => {
        const instance = axios.create({ baseURL: API_BASE_URL });

        instance.interceptors.request.use((config) => {
            config.headers['Content-Type'] = 'application/json';
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        });

        instance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const status = error.response?.status;
                const requestUrl = error.config?.url ?? '';
                const isAuthEndpoint = requestUrl.includes('/Login') || requestUrl.includes('/Refresh');
                const originalRequest = error.config as
                    | (InternalAxiosRequestConfig & { _retry?: boolean })
                    | undefined;

                if (status === 401 && !isAuthEndpoint && originalRequest && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const newToken = await refreshAccessToken();
                        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
                        return instance.request(originalRequest);
                    } catch {
                        localStorage.removeItem('token');
                        localStorage.removeItem('refresh_token');
                        window.location.href = '/login';
                        return Promise.reject(error);
                    }
                }

                if (status === 500) {
                    console.error('[API] Internal server error (500):', error);
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }, []);

    return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
}

export { ApiContext };

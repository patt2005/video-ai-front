import axios, { AxiosError, type AxiosInstance } from 'axios';
import { createContext, useMemo, type ReactNode } from 'react';

type ApiContextValue = {
    api: AxiosInstance;
};

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

type ApiProviderProps = {
    children: ReactNode;
};

export function ApiProvider({ children }: ApiProviderProps) {
    const api = useMemo(() => {
        const instance = axios.create({
            baseURL: 'http://localhost:5014',
        });

        instance.interceptors.request.use((config) => {
            config.headers['Content-Type'] = 'application/json';
            return config;
        });

        instance.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 500) {
                    console.error('[API] Internal server error (500):', error);
                    console.error('A apărut o eroare internă pe server.');
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }, []);

    return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
}

export { ApiContext };

import type { AxiosInstance } from 'axios';

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    token: string;
    refreshToken: string;
    userId: string;
    email: string;
    role: string;
};

export type RegisterRequest = {
    username: string;
    email: string;
    password: string;
};

export const authService = {
    async login(api: AxiosInstance, request: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/api/User/Login', request);
        return response.data;
    },

    async register(api: AxiosInstance, request: RegisterRequest): Promise<void> {
        await api.post('/api/User/Register', request);
    },

    async refresh(api: AxiosInstance, refreshToken: string): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/api/User/Refresh', { refreshToken });
        return response.data;
    },

    async verifyEmail(api: AxiosInstance, token: string): Promise<void> {
        await api.post('/api/User/VerifyEmail', { token });
    },

    async sendVerificationCode(api: AxiosInstance, email: string): Promise<void> {
        await api.post('/api/User/SendCode', { email });
    },

    async verifyCode(api: AxiosInstance, email: string, code: string): Promise<boolean> {
        try {
            await api.post('/api/User/VerifyCode', { email, code });
            return true;
        } catch {
            return false;
        }
    },

    async resendVerification(api: AxiosInstance): Promise<void> {
        await api.post('/api/User/me/ResendVerification');
    },

    async forgotPassword(api: AxiosInstance, email: string): Promise<void> {
        await api.post('/api/User/ForgotPassword', { email });
    },

    async resetPassword(api: AxiosInstance, token: string, newPassword: string): Promise<boolean> {
        try {
            await api.post('/api/User/ResetPassword', { token, newPassword });
            return true;
        } catch {
            return false;
        }
    },
};

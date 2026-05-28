import type { AxiosInstance } from 'axios';
import type { PaddleConfig, Subscription, SubscriptionPlan } from '../types/subscription/subscription';

export const subscriptionService = {
    async getPaddleConfig(api: AxiosInstance): Promise<PaddleConfig> {
        const response = await api.get<PaddleConfig>('/api/Subscription/config');
        return response.data;
    },

    async syncFromPaddle(api: AxiosInstance, paddleSubscriptionId: string): Promise<Subscription> {
        const response = await api.post<Subscription>('/api/Subscription/sync', { paddleSubscriptionId });
        return response.data;
    },

    async cancelMine(api: AxiosInstance): Promise<void> {
        await api.patch('/api/Subscription/me/cancel');
    },

    async getAll(api: AxiosInstance): Promise<Subscription[]> {
        const response = await api.get<Subscription[]>('/api/Subscription');
        return response.data;
    },

    async getMine(api: AxiosInstance): Promise<Subscription | null> {
        const response = await api.get<Subscription | null>('/api/Subscription/me');
        return response.data;
    },

    async getByUserId(api: AxiosInstance, userId: string): Promise<Subscription | null> {
        const response = await api.get<Subscription | null>(`/api/Subscription/user/${userId}`);
        return response.data;
    },

    async subscribe(api: AxiosInstance, plan: SubscriptionPlan): Promise<Subscription> {
        const response = await api.post<Subscription>('/api/Subscription/subscribe', { plan });
        return response.data;
    },

    async cancel(api: AxiosInstance, id: string): Promise<Subscription> {
        const response = await api.patch<Subscription>(`/api/Subscription/${id}/cancel`);
        return response.data;
    },

    async setUserPlan(api: AxiosInstance, userId: string, plan: SubscriptionPlan): Promise<Subscription | null> {
        const response = await api.patch<Subscription | null>(`/api/Subscription/user/${userId}/plan`, { plan });
        return response.data;
    },
};

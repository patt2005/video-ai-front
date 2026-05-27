import type { AxiosInstance } from 'axios';
import type { Task } from '../types/generation/task';

export const taskService = {
    async getAll(api: AxiosInstance): Promise<Task[]> {
        const response = await api.get<Task[]>('/api/Task');
        return response.data;
    },

    async getByUserId(api: AxiosInstance, userId: string): Promise<Task[]> {
        const response = await api.get<Task[]>(`/api/Task/user/${userId}`);
        return response.data;
    },

    async getById(api: AxiosInstance, taskId: string): Promise<Task> {
        const response = await api.get<Task>(`/api/Task/${taskId}`);
        return response.data;
    },
};

import type { User, UserRole } from '../types/user/user';
import type { AxiosInstance } from 'axios';

export const userService = {
    async getUsers(api: AxiosInstance): Promise<User[]> {
        const response = await api.get<User[]>('/api/User');
        return response.data;
    },

    async updateUserRole(api: AxiosInstance, userId: string, role: UserRole): Promise<User> {
        const response = await api.patch<User>(`/api/User/${userId}/role`, { role });
        return response.data;
    },

    async deleteUser(api: AxiosInstance, userId: string): Promise<void> {
        await api.delete(`/api/User/${userId}`);
    },
};

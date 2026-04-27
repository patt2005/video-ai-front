import type { User } from '../types/user/user';
import type { UserRole } from '../types/user/user';
import { mockUsers } from '../_mock/user';

export type UserWithId = User & { id: number };

export const userService = {
    getUsers(search?: string | null): UserWithId[] {
        if (search == null || search.trim() === '') {
            return mockUsers;
        }

        const term = search.trim().toLowerCase();
        return mockUsers.filter(
            (user) =>
                String(user.id).toLowerCase().includes(term) ||
                user.username?.toLowerCase().includes(term) ||
                (user.email ?? '').toLowerCase().includes(term)
        );
    },

    updateUserRole(userId: number, role: UserRole): void {
        const user = mockUsers.find((u) => u.id === userId);
        if (user) user.role = role;
    },
};

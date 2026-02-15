import type { User } from '../types/user/user';
import { mockUsers } from '../_mock/user';

export type UserWithId = User & { id: number };

export const userService = {
    /**
     * Get all users, optionally filtered by id, username, or email when search is provided.
     */
    getUsers(search?: string | null): UserWithId[] {
        if (search == null || search.trim() === '') {
            return mockUsers;
        }

        const term = search.trim().toLowerCase();
        return mockUsers.filter(
            (user) =>
                String(user.id).toLowerCase().includes(term) ||
                user.username.toLowerCase().includes(term) ||
                (user.email ?? '').toLowerCase().includes(term)
        );
    },
};

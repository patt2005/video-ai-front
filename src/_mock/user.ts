import type { User, UserRole } from '../types/user/user.ts';

export const mockUser: User = {
    username: 'mihai',
    role: 'admin' as UserRole,
    email: 'mihai@movyai.app',
    registerDate: '2025-01-10',
};

export const mockUsers: (User & { id: number })[] = [
    { id: 2, username: 'ana', role: 'user', email: 'ana@movyai.app', registerDate: '2025-02-01' },
    { id: 3, username: 'andrei', role: 'user', email: 'andrei@movyai.app', registerDate: '2025-02-05' },
    { id: 4, username: 'maria', role: 'user', email: 'maria@movyai.app', registerDate: '2025-03-12' },
    { id: 5, username: 'alex', role: 'user', email: 'alex@movyai.app', registerDate: '2025-04-20' },
];

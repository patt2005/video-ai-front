import { UserRole, type User } from '../types/user/user.ts';

export const mockUser: User = {
    id: 1,
    username: 'mihai',
    role: UserRole.User,
    email: 'mihai@movyai.app',
    registerDate: '2025-01-10',
};

export const mockUsers: (User & { id: number })[] = [
    { id: 2, username: 'ana', role: UserRole.User, email: 'ana@movyai.app', registerDate: '2025-02-01' },
    { id: 3, username: 'andrei', role: UserRole.User, email: 'andrei@movyai.app', registerDate: '2025-02-05' },
    { id: 4, username: 'maria', role: UserRole.User, email: 'maria@movyai.app', registerDate: '2025-03-12' },
    { id: 5, username: 'alex', role: UserRole.User, email: 'alex@movyai.app', registerDate: '2025-04-20' },
];

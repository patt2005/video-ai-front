export const UserRole = {
    Admin: "Admin",
    User: "User",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
    id: string;
    username?: string;
    role: UserRole;
    email: string;
    registerDate: string;
    isBlocked: boolean;
    isEmailVerified: boolean;
    avatarUrl?: string | null;
    credits?: number;
}
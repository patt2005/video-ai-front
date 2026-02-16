export enum UserRole {
    Admin = "Admin",
    User = "User"
}

export interface User {
    id?: number;
    username: string;
    role: UserRole;
    email: string;
    registerDate?: string;
}
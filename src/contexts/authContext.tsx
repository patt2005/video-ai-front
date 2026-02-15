import { createContext, useCallback, useContext, useState } from 'react';
import type { User } from '../types/user/user';
import { mockUser } from '../_mock/user';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  loginWithMockUser: () => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((u: User) => setUser(u), []);
  const loginWithMockUser = useCallback(() => setUser(mockUser), []);
  const logout = useCallback(() => setUser(null), []);

  const isLoggedIn = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, loginWithMockUser, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { createContext, useCallback, useContext, useState } from 'react';
import {type User, UserRole} from '../types/user/user';

const AUTH_STORAGE_KEY = 'movyai_user';

function readUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (parsed?.email && parsed?.role != null) return parsed;
  } catch {
    console.log('error reading user from storage');
  }
  return null;
}

function saveUserToStorage(user: User | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(readUserFromStorage);

  const login = useCallback((email: string, password: string): boolean => {
    const entry: User = {
      id: "a4da2b5b-85a0-4868-a2a5-3974ce4cc085",
      email: email,
      registerDate: Date.now().toString(),
      role: UserRole.User,
    };
    
    console.log("User password", password);

    setUser(entry);
    saveUserToStorage(entry);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveUserToStorage(null);
  }, []);

  const isLoggedIn = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


import { createContext, useCallback, useContext, useState } from 'react';
import { type User, UserRole } from '../types/user/user';
import { useApi } from '../hooks/useApi';
import { authService } from '../services/authService';

const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'movyai_user';

function readUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
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
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const api = useApi();
  const [user, setUser] = useState<User | null>(readUserFromStorage);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(api, { email, password });

      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);

      const loggedUser: User = {
        id: response.userId,
        email: response.email,
        role: response.role as UserRole,
        registerDate: new Date().toISOString(),
      };

      setUser(loggedUser);
      saveUserToStorage(loggedUser);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, [api]);
   const register = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      await authService.register(api, { username, email, password });
      return await login(email, password);
    } catch (error) {
      console.error('Register failed:', error);
      return false;
    }
  }, [api, login]);  

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    saveUserToStorage(null);
  }, []);

  const isLoggedIn = user !== null;

  return (
      <AuthContext.Provider value={{ user, login,register, logout, isLoggedIn }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
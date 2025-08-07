'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { DecodedToken } from '@/lib/auth';

interface AuthContextType {
  user: DecodedToken | null;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user info from /api/auth/me (uses cookie)
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async () => {
    // After login, refetch user info
    await fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user || null));
  };

  const logout = () => {
    // Clear cookie by calling logout endpoint (to be implemented)
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => setUser(null));
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
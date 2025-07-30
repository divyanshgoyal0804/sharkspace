
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { DecodedToken } from '@/lib/auth';
import { storage } from '@/lib/storage';

interface AuthContextType {
  user: DecodedToken | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize storage first
    storage.initializeData();
    
    const token = localStorage.getItem('token');
    console.log('AuthProvider: Checking for token...', token ? 'Found' : 'Not found');
    
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log('AuthProvider: Decoded token:', decoded);
        
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          console.log('AuthProvider: User set from token:', decoded.username, decoded.role);
        } else {
          console.log('AuthProvider: Token expired, removing...');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('AuthProvider: Invalid token, removing...', error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    console.log('AuthProvider: Login called with token');
    localStorage.setItem('token', token);
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('AuthProvider: Setting user from login:', decoded);
      setUser(decoded);
    } catch (error) {
      console.error('AuthProvider: Invalid token during login', error);
    }
  };

  const logout = () => {
    console.log('AuthProvider: Logout called');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

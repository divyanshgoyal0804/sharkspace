// components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'client';
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'client',
  fallbackPath = '/?error=auth_required' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          router.push(fallbackPath);
          return;
        }

        const userData = JSON.parse(userStr);
        
        // Verify token is still valid by making a test API call
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // Token is invalid, clear storage and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/?error=invalid_token');
          return;
        }

        // Check role-based access
        if (requiredRole === 'admin' && userData.role !== 'admin') {
          router.push('/?error=access_denied');
          return;
        }

        if (requiredRole === 'client' && userData.role !== 'client' && userData.role !== 'admin') {
          router.push('/?error=access_denied');
          return;
        }

        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/?error=auth_check_failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole, fallbackPath]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Don't render anything if not authenticated (redirect is handled in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Render children with user context
  return <>{children}</>;
}

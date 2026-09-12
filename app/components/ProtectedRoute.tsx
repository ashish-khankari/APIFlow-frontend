// app/components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken, clearAuth } from '@/app/lib/auth';
import api from '@/app/services/api';
import LoadingScreen from './Loading/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Verify token with backend using the api instance (port 8080)
    api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 200) {
          setIsAuthenticated(true);
        } else {
          throw new Error('Unauthorized');
        }
      })
      .catch(() => {
        clearAuth();
        router.push('/login');
      });
  }, [router]);

  if (isAuthenticated === null) return <LoadingScreen />;
  return isAuthenticated ? <>{children}</> : null;
}
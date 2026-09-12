// app/components/PublicRoute.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken } from '@/app/lib/auth';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps pages that should only be visible to unauthenticated users
 * (e.g. /login, /register). If the user already has a valid token,
 * they are redirected to the home page.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      router.replace('/');
    } else {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) return null;
  return <>{children}</>;
}

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './UserProvider';

interface UseProtectedRouteOptions {
  adminOnly?: boolean;
  providerOnly?: boolean;
  redirectPath?: string;
}

export default function useProtectedRoute(options?: UseProtectedRouteOptions) {
  const { user, userRole, loading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user) {
        const currentPath = window.location.pathname;
        const redirectTo = options?.redirectPath || `/signin?redirect=${encodeURIComponent(currentPath)}`;
        router.push(redirectTo);
        return;
      }
      
      // Admin only check
      if (options?.adminOnly && userRole !== 'admin') {
        router.push('/');
        return;
      }
      
      // Provider only check
      if (options?.providerOnly && !user.provider) {
        router.push('/');
        return;
      }
      
      // User is authorized
      setIsAuthorized(true);
    }
  }, [user, userRole, loading, router, options]);
  
  return {
    isAuthorized,
    isLoading: loading,
    user,
    userRole
  };
}
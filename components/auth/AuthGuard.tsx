"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './UserProvider';
import AuthVerifying from './AuthVerifying';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  adminOnly?: boolean;
  providerOnly?: boolean;
  redirectPath?: string;
}

export default function AuthGuard({
  children,
  fallback,
  adminOnly = false,
  providerOnly = false,
  redirectPath
}: AuthGuardProps) {
  const router = useRouter();
  const { user, userRole, loading } = useUser();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated
        const currentPath = window.location.pathname;
        const redirectTo = redirectPath || `/signin?redirect=${encodeURIComponent(currentPath)}`;
        router.push(redirectTo);
      } else if (adminOnly && userRole !== 'admin') {
        // Not an admin
        router.push('/');
      } else if (providerOnly && !user.provider) {
        // Not a provider
        router.push('/');
      } else {
        // User is authorized
        setAuthChecked(true);
      }
    }
  }, [user, userRole, loading, router, adminOnly, providerOnly, redirectPath]);

  // If still loading or not authorized, show loading state or fallback
  if (loading || !authChecked) {
    return fallback || <AuthVerifying />;
  }

  // User is authenticated and authorized, render children
  return <>{children}</>;
}
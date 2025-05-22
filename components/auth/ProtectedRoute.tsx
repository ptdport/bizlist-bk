"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseClient';
import { useUser } from './UserProvider';
import AuthVerifying from './AuthVerifying';

export default function ProtectedRoute({ 
  children,
  fallback
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useUser();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // If user state is already loaded from UserProvider
    if (!loading) {
      if (!user) {
        // Get the current path for redirect
        const currentPath = window.location.pathname;
        router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        // User is authenticated, mark auth as checked
        setAuthChecked(true);
      }
    }
  }, [user, loading, router]);

  // If still loading or not authenticated, show loading state or fallback
  if (loading || !authChecked) {
    return fallback || <AuthVerifying />;
  }

  // User is authenticated and auth check is complete, render children
  return <>{children}</>;
}
"use client";

import React from 'react';
import { useUser } from './UserProvider';
import { useRouter } from 'next/navigation';
import AuthVerifying from './AuthVerifying';

export default function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    adminOnly?: boolean;
    providerOnly?: boolean;
    customFallback?: React.ReactNode;
    redirectPath?: string;
  }
) {
  return function WithAuth(props: P) {
    const { user, userRole, loading } = useUser();
    const router = useRouter();
    
    // If still loading, show loading state
    if (loading) {
      return options?.customFallback || <AuthVerifying />;
    }
    
    // If not authenticated, redirect to signin
    if (!user) {
      const currentPath = window.location.pathname;
      const redirectTo = options?.redirectPath || `/signin?redirect=${encodeURIComponent(currentPath)}`;
      
      // Use setTimeout to avoid React hydration issues
      setTimeout(() => {
        router.push(redirectTo);
      }, 0);
      
      return options?.customFallback || <AuthVerifying message="Redirecting to login..." />;
    }
    
    // If admin only and user is not admin
    if (options?.adminOnly && userRole !== 'admin') {
      setTimeout(() => {
        router.push('/');
      }, 0);
      return options?.customFallback || <AuthVerifying message="Checking permissions..." />;
    }
    
    // If provider only and user is not a provider
    if (options?.providerOnly && !user.provider) {
      setTimeout(() => {
        router.push('/');
      }, 0);
      return options?.customFallback || <AuthVerifying message="Checking permissions..." />;
    }
    
    // User is authenticated and has required permissions
    return <Component {...props} />;
  };
}
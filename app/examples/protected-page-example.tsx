"use client";

import React from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import withAuth from '@/components/auth/withAuth';
import useProtectedRoute from '@/components/auth/useProtectedRoute';

// Example 1: Using AuthGuard component
export function ProtectedPageWithAuthGuard() {
  return (
    <AuthGuard>
      {/* This content will only be visible to authenticated users */}
      <div>Protected content</div>
    </AuthGuard>
  );
}

// Example 2: Using withAuth HOC
function AdminPage() {
  return <div>Admin only content</div>;
}

export const ProtectedAdminPage = withAuth(AdminPage, { adminOnly: true });

// Example 3: Using useProtectedRoute hook
export function ProtectedPageWithHook() {
  const { isAuthorized, isLoading } = useProtectedRoute();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthorized) {
    return null; // This will never render because the hook will redirect
  }
  
  return <div>Protected content using hook</div>;
}

// Example 4: Using the original ProtectedRoute component
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export function OriginalProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Protected content with original component</div>
    </ProtectedRoute>
  );
}
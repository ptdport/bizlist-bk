"use client";

import React from 'react';
import { useRequireProfileCompletion } from '../../hooks/useRequireProfileCompletion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';    

export default function MessageCenter() {
  useRequireProfileCompletion(false);
  return (
    <ProtectedRoute>
      <div>
      <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Message Center</h1>
      <p>This is your message center. Only users with a completed profile can access this page.</p>
    </main>
      </div>
    </ProtectedRoute>
  );
} 
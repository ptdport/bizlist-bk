"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Check if user profile exists
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
        
        if (!profileDoc.exists()) {
          // New user - redirect to finish signup
          router.push('/finish-signup');
        } else {
          // Existing user - redirect to home
          router.push('/');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Processing your sign in...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      </div>
    </div>
  );
} 
"use client";
import { auth } from '@/lib/firebaseClient';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { useAuthModal } from './AuthModalContext';
import { useToast } from '@/components/ui/toast-provider';

export default function GoogleAuthButton({ mode = 'signIn', onLoading }: { mode?: 'signIn' | 'signUp', onLoading?: (loading: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const { closeModal } = useAuthModal();
  const { showToast } = useToast();

  const handleGoogleAuth = async () => {
    setLoading(true);
    onLoading?.(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast({ title: 'Success', description: mode === 'signIn' ? 'Signed in successfully!' : 'Account created successfully!' });
      closeModal();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during sign in');
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 font-medium bg-white hover:bg-gray-50 transition disabled:opacity-60"
    >
      <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_17_40)">
          <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.1H37.4C36.7 32.2 34.7 34.7 31.8 36.4V42.1H39.3C44 38 47.5 31.9 47.5 24.5Z" fill="#4285F4"/>
          <path d="M24 48C30.6 48 36.2 45.8 39.3 42.1L31.8 36.4C30.1 37.5 27.9 38.2 24 38.2C17.7 38.2 12.2 34.1 10.3 28.7H2.5V34.6C5.7 41.1 14.1 48 24 48Z" fill="#34A853"/>
          <path d="M10.3 28.7C9.7 27.1 9.4 25.4 9.4 23.6C9.4 21.8 9.7 20.1 10.3 18.5V12.6H2.5C0.8 15.7 0 19.2 0 23.6C0 28 0.8 31.5 2.5 34.6L10.3 28.7Z" fill="#FBBC05"/>
          <path d="M24 9.8C27.7 9.8 30.3 11.3 31.7 12.6L39.4 5C36.2 2.1 30.6 0 24 0C14.1 0 5.7 6.9 2.5 12.6L10.3 18.5C12.2 13.1 17.7 9.8 24 9.8Z" fill="#EA4335"/>
        </g>
        <defs>
          <clipPath id="clip0_17_40">
            <rect width="48" height="48" fill="white"/>
          </clipPath>
        </defs>
      </svg>
      {mode === 'signIn' ? 'Sign in with Google' : 'Sign up with Google'}
    </button>
  );
} 
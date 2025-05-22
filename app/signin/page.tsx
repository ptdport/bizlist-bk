"use client";
import React, { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseClient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/components/ui/toast-provider';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import Link from 'next/link';

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select-method' | 'email-password'>('select-method');

  useEffect(() => {
    // Check if user is already signed in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const redirect = searchParams.get('redirect') || '/dashboard/business-profile';
        router.push(redirect);
      }
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast({ title: 'Signed in successfully', description: 'Welcome back!' });
      const redirect = searchParams.get('redirect') || '/dashboard/business-profile';
      router.push(redirect);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        {step === 'select-method' ? (
          <div className="space-y-4">
            <GoogleAuthButton />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <button
              onClick={() => setStep('email-password')}
              className="w-full border border-slate-200 rounded px-4 py-2 font-medium bg-white hover:bg-slate-50 transition"
            >
              Email and Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="relative">
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full border px-3 py-2 rounded"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            {message && <p className="text-center text-sm text-red-600">{message}</p>}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('select-method')}
                className="text-sm text-blue-600 hover:underline"
              >
                Back to sign in options
              </button>
            </div>
          </form>
        )}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignIn() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
} 
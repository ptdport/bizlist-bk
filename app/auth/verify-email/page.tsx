"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '../../../lib/firebaseClient';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (mode === 'verifyEmail' && oobCode) {
      // Check if the code is valid first
      checkActionCode(auth, oobCode)
        .then(() => {
          // Apply the action code to verify the email
          return applyActionCode(auth, oobCode);
        })
        .then(() => {
          setStatus('success');
          setMessage('Your email has been verified! You can now sign in.');
        })
        .catch((err) => {
          setStatus('error');
          setMessage('This verification link is invalid or has expired.');
        });
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }
  }, [mode, oobCode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Email Verification</h1>
        {status === 'verifying' && (
          <p className="text-gray-600 text-center">Verifying your email...</p>
        )}
        {status === 'success' && (
          <>
            <p className="text-green-700 text-center mb-4">{message}</p>
            <button
              className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => router.push('/signin')}
            >
              Go to Sign In
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-600 text-center mb-4">{message}</p>
            <button
              className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => router.push('/')}
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
} 
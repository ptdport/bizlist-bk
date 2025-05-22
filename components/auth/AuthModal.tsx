"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import { useAuthModal } from './AuthModalContext';
import GoogleAuthButton from './GoogleAuthButton';
import { auth, db } from '../../lib/firebaseClient';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useToast } from '../ui/toast-provider';
import { doc, setDoc, updateDoc, serverTimestamp, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default function AuthModal() {
  const { open, closeModal, mode, step, setStep, openModal } = useAuthModal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [profile, setProfile] = useState({ firstName: '', lastName: '' });
  const [dob, setDob] = useState({ month: '', day: '', year: '' });
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const { showToast } = useToast();

  // DOB dropdown options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - 18 - i).toString());

  // Handle OTP resend timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!canResendOtp && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(timer);
  }, [canResendOtp, resendTimer]);

  // Handle sign in with email/password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        await auth.signOut();
        setMessage("Please verify your email before signing in. Check your inbox for the activation link.");
        return;
      }
      // Try to update last_login, or create the profile if it doesn't exist
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        await updateDoc(profileRef, {
          last_login: serverTimestamp(),
          updated_at: serverTimestamp(),
          ...(profileData.verified !== true ? { verified: true } : {}),
          status: 'active',
        });
      } else {
        await setDoc(profileRef, {
          id: user.uid,
          email: user.email,
          first_name: user.displayName?.split(' ')[0] || '',
          last_name: user.displayName?.split(' ')[1] || '',
          phone: user.phoneNumber || '',
          dob: '',
          avatar_url: user.photoURL || '',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          last_login: serverTimestamp(),
          verified: true,
          status: 'active',
          role: 'user', // Default role
        });
      }
      // Update profile status to 'active'
      await updateDoc(profileRef, { status: 'active', updated_at: serverTimestamp() });

      showToast({ title: 'Success', description: 'Signed in successfully!' });
      closeModal();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle sign up with email/password
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Create the account but don't sign in
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Sign out immediately after account creation
      await auth.signOut();
      // Send verification email
      await sendEmailVerification(userCredential.user);
      setStep('verification-pending');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Here you would typically verify the OTP with your backend
      // For now, we'll just move to the next step
      setStep('profile-details');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile completion
  const handleProfileCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Save profile data to Firestore
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'profiles', user.uid), {
          id: user.uid,
          email: user.email,
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: '', // You can add a phone field to your form if needed
          dob: `${dob.year}-${dob.month}-${dob.day}`,
          avatar_url: user.photoURL || '',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          verified: false,
        }, { merge: true });
      }
      setStep('verification-pending');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    setLoading(true);
    setMessage("");
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setResendTimer(30);
        setCanResendOtp(false);
        showToast({ title: 'Success', description: 'Verification email sent!' });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    setLoading(true);
    setMessage("");
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        showToast({ title: 'Success', description: 'Verification email sent!' });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Modal content for sign in
  const renderSignIn = () => {
    if (step === 'select-method') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
          </div>
          
          <div className="space-y-4">
            <button
              className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 font-medium bg-white hover:bg-gray-50 transition"
              onClick={() => setStep('email-password')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Continue with email
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <GoogleAuthButton mode="signIn" onLoading={setLoading} />
          </div>

          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <button 
              className="text-green-600 hover:text-green-700 font-medium" 
              onClick={() => openModal('signUp')}
            >
              Sign up
            </button>
          </div>
        </div>
      );
    }

    if (step === 'email-password') {
      return (
        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setStep('select-method')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Sign in with email</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {message && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{message}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        </form>
      );
    }

    return null;
  };

  // Modal content for sign up
  const renderSignUp = () => {
    if (step === 'select-method') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">Join our community today</p>
          </div>
          
          <div className="space-y-4">
            <button
              className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 font-medium bg-white hover:bg-gray-50 transition"
              onClick={() => setStep('name-dob')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Continue with email
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <GoogleAuthButton mode="signUp" onLoading={setLoading} />
          </div>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              className="text-green-600 hover:text-green-700 font-medium" 
              onClick={() => openModal('signIn')}
            >
              Sign in
            </button>
          </div>
        </div>
      );
    }

    // Step 1: Name and DOB
    if (step === 'name-dob') {
      return (
        <form onSubmit={e => { e.preventDefault(); setStep('email-password'); }} className="space-y-6">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setStep('select-method')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                value={profile.firstName}
                onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                value={profile.lastName}
                onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Enter your last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of birth
              </label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <select
                  value={dob.month}
                  onChange={e => setDob(d => ({ ...d, month: e.target.value }))}
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Month</option>
                  {months.map((m, i) => (
                    <option key={m} value={(i + 1).toString().padStart(2, '0')}>{m}</option>
                  ))}
                </select>
                <select
                  value={dob.day}
                  onChange={e => setDob(d => ({ ...d, day: e.target.value }))}
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Day</option>
                  {days.map(d => (
                    <option key={d} value={d.padStart(2, '0')}>{d}</option>
                  ))}
                </select>
                <select
                  value={dob.year}
                  onChange={e => setDob(d => ({ ...d, year: e.target.value }))}
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Year</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">You must be at least 18 years old to sign up.</p>
            </div>
          </div>

          {message && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{message}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Continue
            </button>
          </div>
        </form>
      );
    }

    // Step 2: Email and Password
    if (step === 'email-password') {
      return (
        <form onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          setMessage("");
          try {
            // Create the account but don't sign in
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Fetch location data from ipapi.co
            let locationData: any = {};
            try {
              const locationResponse = await fetch('https://ipapi.co/json/');
              locationData = await locationResponse.json();
            } catch (err) {
              // If location fetch fails, just continue
              locationData = {};
            }
            // Sign out immediately after account creation
            await auth.signOut();
            // Send verification email
            await sendEmailVerification(userCredential.user);
            // Create Firestore profile with UID as doc ID and all data
            await setDoc(doc(db, 'profiles', userCredential.user.uid), {
              uid: userCredential.user.uid,
              email: email,
              first_name: profile.firstName,
              last_name: profile.lastName,
              dob: `${dob.year}-${dob.month}-${dob.day}`,
              status: 'pending',
              role: 'user', // Default role
              country: locationData.country_name || null,
              city: locationData.city || null,
              region: locationData.region || null,
              is_european: locationData.continent_code === 'EU',
              timezone: locationData.timezone || null,
              created_at: serverTimestamp(),
              updated_at: serverTimestamp(),
            });
            setStep('verification-pending');
          } catch (error) {
            setMessage(error instanceof Error ? error.message : 'An error occurred');
          } finally {
            setLoading(false);
          }
        }} className="space-y-6">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setStep('name-dob')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {message && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{message}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Continue'}
            </button>
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </form>
      );
    }

    // Step 3: Verification Pending
    if (step === 'verification-pending') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a verification link to {email}. Please check your email and click the link to verify your account.
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Resend verification email'}
            </button>

            <button
              type="button"
              onClick={() => setStep('name-dob')}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Back to sign up
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />

        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={closeModal}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {mode === 'signIn' && renderSignIn()}
          {mode === 'signUp' && renderSignUp()}
        </div>
      </div>
    </div>
  );
} 
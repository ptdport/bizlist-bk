"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth, db } from '@/lib/firebaseClient';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/toast-provider';

export default function FinishSignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState({ month: '', day: '', year: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email || '');
        // Parse display name from Google
        const displayName = user.displayName || '';
        if (displayName) {
          const [first, ...rest] = displayName.split(' ');
          setFirstName(first || '');
          setLastName(rest.join(' ') || '');
        }
      } else {
        // No user found, redirect to home
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user found');
      }

      // Fetch location data from ipapi.co
      const locationResponse = await fetch('https://ipapi.co/json/');
      const locationData = await locationResponse.json();

      // Create profile in Firestore with location data
      await setDoc(doc(db, 'profiles', user.uid), {
        first_name: firstName,
        last_name: lastName,
        dob: dob.year ? `${dob.year}-${dob.month.padStart(2, '0')}-${dob.day.padStart(2, '0')}` : null,
        country: locationData.country_name || null,
        city: locationData.city || null,
        region: locationData.region || null,
        is_european: locationData.continent_code === 'EU',
        timezone: locationData.timezone || null,
        role: 'user', // Default role
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      showToast({
        title: 'Profile created successfully',
        description: 'Welcome to BizList!',
      });

      // Redirect to home
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={dob.month}
              onChange={e => setDob(p => ({ ...p, month: e.target.value }))}
              required
              className="border rounded px-2 py-1"
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                  {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={dob.day}
              onChange={e => setDob(p => ({ ...p, day: e.target.value }))}
              required
              className="border rounded px-2 py-1"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                  {i + 1}
                </option>
              ))}
            </select>
            <select
              value={dob.year}
              onChange={e => setDob(p => ({ ...p, year: e.target.value }))}
              required
              className="border rounded px-2 py-1"
            >
              <option value="">Year</option>
              {Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getFullYear() - 18 - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Creating profile...' : 'Complete Profile'}
        </button>
      </form>
    </main>
  );
} 
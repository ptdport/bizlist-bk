"use client";
import { useEffect, useState, useRef } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { useToast } from '@/components/ui/toast-provider';
import { useProfile } from '@/components/auth/ProfileContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { db, storage } from '@/lib/firebaseClient';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AddressAutocomplete, AddressComponents } from '@/components/ui/address-autocomplete';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => (currentYear - 18 - i).toString());

function getInitials(profile: any, user: any) {
  const fullName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user?.displayName || '';
  const firstName = profile?.first_name || fullName.split(' ')[0] || '';
  const lastName = profile?.last_name || fullName.split(' ')[1] || '';
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  if (user?.email) return user.email[0].toUpperCase();
  return 'U';
}

// Helper to format DOB
function formatDOB(dob: { year: string, month: string, day: string }) {
  if (!dob.year || !dob.month || !dob.day) return '';
  const monthName = months[parseInt(dob.month, 10) - 1];
  return `${monthName} ${parseInt(dob.day, 10)}, ${dob.year}`;
}

export default function Profile() {
  const { user, userRole } = useUser();
  const { showToast } = useToast();
  const { profile, refreshProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileState, setProfileState] = useState({
    first_name: '',
    last_name: '',
    preferred_name: '',
    phone: '',
    dob: { month: '', day: '', year: '' },
    avatar_url: '',
    country: '',
    city: '',
    region: '',
    role: '',
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
      },
      privacy: {
        profile_visibility: 'public', // public, registered, private
        show_email: false,
        show_phone: false,
      },
    },
    security: {
      two_factor_enabled: false,
      connected_accounts: {
        google: false,
        facebook: false,
        twitter: false,
      },
    },
  });
  const [error, setError] = useState('');
  const [signupDate, setSignupDate] = useState('');
  const [lastLogin, setLastLogin] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      // Default preferences and security settings
      const defaultPreferences = {
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false,
        },
        privacy: {
          profile_visibility: 'public',
          show_email: false,
          show_phone: false,
        }
      };

      const defaultSecurity = {
        two_factor_enabled: false,
        connected_accounts: {
          google: false,
          facebook: false,
          twitter: false,
        }
      };

      setProfileState(p => ({
        ...p,
        ...profile,
        country: profile.country || '',
        city: profile.city || '',
        region: profile.region || '',
        preferences: profile.preferences || defaultPreferences,
        security: profile.security || defaultSecurity,
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      setSignupDate(user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '');
      setLastLogin(user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    if (!user) {
      setError('User not found.');
      setSaving(false);
      return;
    }

    try {
      let avatar_url = profileState.avatar_url;
      // Handle avatar upload
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `avatars/${user.uid}.${fileExt}`;
        const storageRef = ref(storage, filePath);
        
        // Upload the file
        await uploadBytes(storageRef, file);
        // Get the public URL
        avatar_url = await getDownloadURL(storageRef);
        setProfileState(p => ({ ...p, avatar_url }));
        showToast({ title: 'Profile picture updated', description: 'Your new profile picture has been uploaded.' });
      }

      // Prepare the profile data to update in Firestore
      const profileData = {
        first_name: profileState.first_name,
        last_name: profileState.last_name,
        preferred_name: profileState.preferred_name,
        phone: profileState.phone,
        avatar_url,
        dob: `${profileState.dob.year}-${profileState.dob.month.padStart(2, '0')}-${profileState.dob.day.padStart(2, '0')}`,
        country: profileState.country,
        city: profileState.city,
        region: profileState.region,
        preferences: {
          notifications: {
            email: profileState.preferences?.notifications?.email || false,
            push: profileState.preferences?.notifications?.push || false,
            sms: profileState.preferences?.notifications?.sms || false,
            marketing: profileState.preferences?.notifications?.marketing || false,
          },
          privacy: {
            profile_visibility: profileState.preferences?.privacy?.profile_visibility || 'public',
            show_email: profileState.preferences?.privacy?.show_email || false,
            show_phone: profileState.preferences?.privacy?.show_phone || false,
          },
        },
        security: {
          two_factor_enabled: profileState.security?.two_factor_enabled || false,
          // Preserve existing connected accounts if they exist
          connected_accounts: profileState.security?.connected_accounts || {
            google: false,
            facebook: false,
            twitter: false,
          },
        },
        // Add updated_at timestamp
        updated_at: new Date().toISOString(),
        // Don't update the role here - it should be managed separately
      };

      // Update profile in Firestore
      await setDoc(doc(db, 'profiles', user.uid), profileData, { merge: true });

      showToast({ title: 'Profile updated', description: 'Your profile has been saved.' });
      setEditMode(false);
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving your profile');
    } finally {
      setSaving(false);
    }
  };

  // Function to get role badge color
  const getRoleBadgeColor = (role: string | null) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <ProtectedRoute>
      <main className="max-w-4xl mx-auto py-12 px-4 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!editMode && (
            <button 
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {!editMode ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden md:col-span-1">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 h-32 flex items-center justify-center">
                {profileState.avatar_url ? (
                  <div className="relative">
                    <img 
                      src={profileState.avatar_url} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" 
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center font-bold text-gray-700 text-3xl border-4 border-white shadow-md">
                    {getInitials(profileState, user)}
                  </div>
                )}
              </div>
              <div className="p-6 text-center">
                <h2 className="text-xl font-bold text-gray-900">{profileState.first_name} {profileState.last_name}</h2>
                <p className="text-gray-500 mb-3">{user?.email}</p>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(userRole)}`}>
                  {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User'}
                </div>
                
                {profileState.preferred_name && (
                  <p className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Preferred name:</span> {profileState.preferred_name}
                  </p>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden md:col-span-2">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">First Name</p>
                    <p className="font-medium">{profileState.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="font-medium">{profileState.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{profileState.phone || <span className="text-gray-400">Not set</span>}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{formatDOB(profileState.dob) || <span className="text-gray-400">Not set</span>}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Location</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Country</p>
                      <p className="font-medium">{profileState.country || <span className="text-gray-400">Not set</span>}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium">{profileState.city || <span className="text-gray-400">Not set</span>}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">State/Region</p>
                      <p className="font-medium">{profileState.region || <span className="text-gray-400">Not set</span>}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden md:col-span-3">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Account Created</p>
                    <p className="font-medium">{signupDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">{lastLogin}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden md:col-span-3">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Notifications */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">Email Notifications</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profileState.preferences?.notifications?.email ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {profileState.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">Push Notifications</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profileState.preferences?.notifications?.push ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {profileState.preferences?.notifications?.push ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">SMS Notifications</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profileState.preferences?.notifications?.sms ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {profileState.preferences?.notifications?.sms ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">Marketing Emails</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profileState.preferences?.notifications?.marketing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {profileState.preferences?.notifications?.marketing ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Privacy */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Privacy</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-700">Profile Visibility</p>
                        <p className="font-medium capitalize">
                          {profileState.preferences?.privacy?.profile_visibility || 'Public'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">Show Email to Others</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profileState.preferences?.privacy?.show_email ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {profileState.preferences?.privacy?.show_email ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">Show Phone to Others</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profileState.preferences?.privacy?.show_phone ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {profileState.preferences?.privacy?.show_phone ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden md:col-span-3">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Password */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Password</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Secure your account with a strong password. We recommend using a combination of letters, numbers, and special characters.
                    </p>
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={() => showToast({ title: 'Coming Soon', description: 'Password change functionality will be available soon.' })}
                    >
                      Change Password
                    </button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Two-Factor Authentication</h4>
                    <div className="flex items-center mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profileState.security?.two_factor_enabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {profileState.security?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={() => showToast({ title: 'Coming Soon', description: 'Two-factor authentication will be available soon.' })}
                    >
                      {profileState.security?.two_factor_enabled ? 'Manage 2FA' : 'Enable 2FA'}
                    </button>
                  </div>

                  {/* Connected Accounts */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Connected Accounts</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Link your account with other services for easier login and additional features.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#4285F4">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Google
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profileState.security?.connected_accounts?.google ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {profileState.security?.connected_accounts?.google ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profileState.security?.connected_accounts?.facebook ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {profileState.security?.connected_accounts?.facebook ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1DA1F2">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                          Twitter
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profileState.security?.connected_accounts?.twitter ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {profileState.security?.connected_accounts?.twitter ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={() => showToast({ title: 'Coming Soon', description: 'Account connection functionality will be available soon.' })}
                    >
                      Manage Connections
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
            </div>
            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    placeholder="Enter your first name"
                    required
                    value={profileState.first_name}
                    onChange={e => setProfileState(p => ({ ...p, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    placeholder="Enter your last name"
                    required
                    value={profileState.last_name}
                    onChange={e => setProfileState(p => ({ ...p, last_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Name</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    placeholder="Enter your preferred name"
                    value={profileState.preferred_name}
                    onChange={e => setProfileState(p => ({ ...p, preferred_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    placeholder="Enter your phone number"
                    value={profileState.phone}
                    onChange={e => setProfileState(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <div className="grid grid-cols-3 gap-3">
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    required 
                    value={profileState.dob.month} 
                    onChange={e => setProfileState(p => ({ ...p, dob: { ...p.dob, month: e.target.value } }))}
                  >
                    <option value="" disabled>Month</option>
                    {months.map((m, i) => (
                      <option key={m} value={(i + 1).toString().padStart(2, '0')}>{m}</option>
                    ))}
                  </select>
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    required 
                    value={profileState.dob.day} 
                    onChange={e => setProfileState(p => ({ ...p, dob: { ...p.dob, day: e.target.value } }))}
                  >
                    <option value="" disabled>Day</option>
                    {days.map(d => (
                      <option key={d} value={d.padStart(2, '0')}>{d}</option>
                    ))}
                  </select>
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    required 
                    value={profileState.dob.year} 
                    onChange={e => setProfileState(p => ({ ...p, dob: { ...p.dob, year: e.target.value } }))}
                  >
                    <option value="" disabled>Year</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <div className="flex items-center gap-4">
                  {profileState.avatar_url ? (
                    <img src={profileState.avatar_url} alt="Current profile" className="w-16 h-16 rounded-full object-cover border" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-xl border">
                      {getInitials(profileState, user)}
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="flex flex-col items-center px-4 py-2 bg-white text-green-600 rounded-lg border border-green-600 cursor-pointer hover:bg-green-50 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">Choose a file</span>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Location Section */}
              <div className="mb-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="space-y-4">
                  <AddressAutocomplete
                    label="Your Address"
                    placeholder="Start typing your address..."
                    value={[profileState.country, profileState.city, profileState.region].filter(Boolean).join(', ')}
                    onChange={(fullAddress, components) => {
                      setProfileState(prev => ({
                        ...prev,
                        country: components.country,
                        city: components.city,
                        region: components.state
                      }));
                    }}
                  />
                  
                  {/* Display the individual location components for review/editing */}
                  {(profileState.country || profileState.city || profileState.region) && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium mb-2">Location Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                            placeholder="Country"
                            value={profileState.country}
                            onChange={e => setProfileState(p => ({ ...p, country: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                            placeholder="City"
                            value={profileState.city}
                            onChange={e => setProfileState(p => ({ ...p, city: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State/Region</label>
                          <input
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                            placeholder="State/Region"
                            value={profileState.region}
                            onChange={e => setProfileState(p => ({ ...p, region: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences Section */}
              <div className="mb-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                
                {/* Notifications */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Notification Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="email-notifications"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={profileState.preferences?.notifications?.email}
                        onChange={(e) => setProfileState(p => ({
                          ...p,
                          preferences: {
                            ...p.preferences,
                            notifications: {
                              ...p.preferences?.notifications,
                              email: e.target.checked
                            }
                          }
                        }))}
                      />
                      <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                        Email Notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="push-notifications"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={profileState.preferences?.notifications?.push}
                        onChange={(e) => setProfileState(p => ({
                          ...p,
                          preferences: {
                            ...p.preferences,
                            notifications: {
                              ...p.preferences?.notifications,
                              push: e.target.checked
                            }
                          }
                        }))}
                      />
                      <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-700">
                        Push Notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="sms-notifications"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={profileState.preferences?.notifications?.sms}
                        onChange={(e) => setProfileState(p => ({
                          ...p,
                          preferences: {
                            ...p.preferences,
                            notifications: {
                              ...p.preferences?.notifications,
                              sms: e.target.checked
                            }
                          }
                        }))}
                      />
                      <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-700">
                        SMS Notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="marketing-emails"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={profileState.preferences?.notifications?.marketing}
                        onChange={(e) => setProfileState(p => ({
                          ...p,
                          preferences: {
                            ...p.preferences,
                            notifications: {
                              ...p.preferences?.notifications,
                              marketing: e.target.checked
                            }
                          }
                        }))}
                      />
                      <label htmlFor="marketing-emails" className="ml-2 block text-sm text-gray-700">
                        Marketing Emails
                      </label>
                    </div>
                  </div>
                </div>

                {/* Privacy */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Privacy Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                        value={profileState.preferences?.privacy?.profile_visibility || 'public'}
                        onChange={(e) => setProfileState(p => ({
                          ...p,
                          preferences: {
                            ...p.preferences,
                            privacy: {
                              ...p.preferences?.privacy,
                              profile_visibility: e.target.value
                            }
                          }
                        }))}
                      >
                        <option value="public">Public - Anyone can view your profile</option>
                        <option value="registered">Registered Users - Only registered users can view your profile</option>
                        <option value="private">Private - Only you can view your profile</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="show-email"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={profileState.preferences?.privacy?.show_email}
                        onChange={(e) => setProfileState(p => ({
                          ...p,
                          preferences: {
                            ...p.preferences,
                            privacy: {
                              ...p.preferences?.privacy,
                              show_email: e.target.checked
                            }
                          }
                        }))}
                      />
                      <label htmlFor="show-email" className="ml-2 block text-sm text-gray-700">
                        Show my email address to other users
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="show-phone"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={profileState.preferences?.privacy?.show_phone}
                        onChange={(e) => setProfileState(p => ({
                          ...p,
                          preferences: {
                            ...p.preferences,
                            privacy: {
                              ...p.preferences?.privacy,
                              show_phone: e.target.checked
                            }
                          }
                        }))}
                      />
                      <label htmlFor="show-phone" className="ml-2 block text-sm text-gray-700">
                        Show my phone number to other users
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="mb-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                
                <div className="flex items-center mb-4">
                  <input
                    id="two-factor"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    checked={profileState.security?.two_factor_enabled}
                    onChange={(e) => {
                      if (e.target.checked) {
                        showToast({ 
                          title: 'Coming Soon', 
                          description: 'Two-factor authentication will be available soon.' 
                        });
                      }
                      setProfileState(p => ({
                        ...p,
                        security: {
                          ...p.security,
                          two_factor_enabled: e.target.checked
                        }
                      }));
                    }}
                  />
                  <label htmlFor="two-factor" className="ml-2 block text-sm text-gray-700">
                    Enable Two-Factor Authentication
                  </label>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to sign in.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setEditMode(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-70"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
} 
"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from './UserProvider';
import { db } from '@/lib/firebaseClient';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface Profile {
  first_name: string;
  last_name: string;
  preferred_name: string;
  phone: string;
  dob: { year: string; month: string; day: string };
  avatar_url: string;
  country?: string;
  city?: string;
  region?: string;
  has_provider?: boolean;
  provider_status?: 'pending' | 'active' | 'rejected';
  preferences?: {
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
      marketing: boolean;
    };
    privacy?: {
      profile_visibility: string; // 'public', 'registered', or 'private'
      show_email: boolean;
      show_phone: boolean;
    };
  };
  security?: {
    two_factor_enabled: boolean;
    connected_accounts?: {
      google: boolean;
      facebook: boolean;
      twitter: boolean;
    };
  };
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
      
      // Check if user has a provider account (in any status)
      let hasProvider = false;
      let providerStatus = undefined;
      
      try {
        // Query providers collection to check if user has a provider account
        const providersQuery = await getDoc(doc(db, 'providers', `provider_${user.uid}`));
        
        if (providersQuery.exists()) {
          hasProvider = true;
          providerStatus = providersQuery.data().status;
        } else {
          // If not found by ID pattern, try querying by user_id field
          const providersCollectionQuery = await getDocs(
            query(collection(db, 'providers'), where('user_id', '==', user.uid))
          );
          
          if (!providersCollectionQuery.empty) {
            hasProvider = true;
            providerStatus = providersCollectionQuery.docs[0].data().status;
          }
        }
      } catch (providerError) {
        console.error('Error checking provider status:', providerError);
      }
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        const dob = data.dob ? data.dob.split('-') : ['', '', ''];
        // Default preferences and security settings if not present in the database
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

        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          preferred_name: data.preferred_name || '',
          phone: data.phone || '',
          dob: { year: dob[0] || '', month: dob[1] || '', day: dob[2] || '' },
          avatar_url: data.avatar_url || '',
          country: data.country || '',
          city: data.city || '',
          region: data.region || '',
          has_provider: hasProvider,
          provider_status: providerStatus,
          preferences: data.preferences || defaultPreferences,
          security: data.security || defaultSecurity,
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 
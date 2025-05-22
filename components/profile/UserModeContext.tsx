"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { useProfile } from '@/components/auth/ProfileContext';
import { db } from '@/lib/firebaseClient';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface UserModeContextType {
  providerData: any | null;
  isProviderActive: boolean;
  loading: boolean;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export function UserModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { profile } = useProfile();
  const [providerData, setProviderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch provider data if user has a provider account
  useEffect(() => {
    const fetchProviderData = async () => {
      if (!user || !profile?.has_provider) {
        setProviderData(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Find the provider document for this user
        const providersQuery = query(
          collection(db, 'providers'),
          where('user_id', '==', user.uid)
        );
        
        const providerSnapshot = await getDocs(providersQuery);
        
        if (!providerSnapshot.empty) {
          const providerData = {
            id: providerSnapshot.docs[0].id,
            ...providerSnapshot.docs[0].data()
          };
          setProviderData(providerData);
        } else {
          setProviderData(null);
        }
      } catch (error) {
        console.error('Error fetching provider data:', error);
        setProviderData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProviderData();
  }, [user, profile]);

  // Check if provider is active
  const isProviderActive = providerData?.status === 'active';

  return (
    <UserModeContext.Provider
      value={{
        providerData,
        isProviderActive,
        loading
      }}
    >
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (context === undefined) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
}
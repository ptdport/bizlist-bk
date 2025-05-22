"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebaseClient';
import { useToast } from '@/components/ui/toast-provider';
import { doc, getDoc } from 'firebase/firestore';
import { UserRole } from '@/lib/roles';

interface UserContextType {
  user: FirebaseUser | null;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const toastShownRef = useRef(false);

  // Fetch user role from Firestore
  const fetchUserRole = async (userId: string) => {
    try {
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const role = profileSnap.data()?.role as UserRole;
        setUserRole(role || 'user'); // Default to 'user' if no role is set
      } else {
        setUserRole('user'); // Default role
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user'); // Default to 'user' on error
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user role when user is authenticated
        await fetchUserRole(user.uid);
        
        if (!toastShownRef.current) {
          showToast({ title: 'Welcome!', description: 'You have successfully signed in.' });
          toastShownRef.current = true;
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showToast]);

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setUserRole(null);
    toastShownRef.current = false;
    
    // Redirect to homepage after sign out
    window.location.href = '/';
  };

  return (
    <UserContext.Provider value={{ user, userRole, loading, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 
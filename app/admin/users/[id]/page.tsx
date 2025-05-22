import { db } from '@/lib/firebaseClient';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import UserDetailClient from './user-client';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  try {
    // Get a limited number of user IDs to pre-render
    const usersRef = collection(db, 'profiles').withConverter({
      fromFirestore: (snapshot) => ({ id: snapshot.id }),
      toFirestore: () => ({})
    });
    
    const usersQuery = query(usersRef, limit(10));
    const usersSnapshot = await getDocs(usersQuery);
    
    return usersSnapshot.docs.map(doc => ({
      id: doc.id
    }));
  } catch (error) {
    console.error('Error generating static params for admin users:', error);
    return []; // Return empty array if there's an error
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  return <UserDetailClient id={id} />;
}
import { db } from '@/lib/firebaseClient';
import { collection, getDocs, limit } from 'firebase/firestore';

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  try {
    // Get a limited number of user IDs to pre-render
    const usersSnapshot = await getDocs(collection(db, 'profiles').withConverter(
      {
        fromFirestore: (snapshot) => ({ id: snapshot.id }),
        toFirestore: () => ({})
      }
    ).limit(10));
    
    return usersSnapshot.docs.map(doc => ({
      id: doc.id
    }));
  } catch (error) {
    console.error('Error generating static params for admin users:', error);
    return []; // Return empty array if there's an error
  }
}
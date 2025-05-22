import { db } from '@/lib/firebaseClient';
import { collection, getDocs, limit } from 'firebase/firestore';

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  try {
    // Get a limited number of report IDs to pre-render
    const reportsSnapshot = await getDocs(collection(db, 'reports').withConverter(
      {
        fromFirestore: (snapshot) => ({ id: snapshot.id }),
        toFirestore: () => ({})
      }
    ).limit(10));
    
    return reportsSnapshot.docs.map(doc => ({
      id: doc.id
    }));
  } catch (error) {
    console.error('Error generating static params for admin reports:', error);
    return []; // Return empty array if there's an error
  }
}
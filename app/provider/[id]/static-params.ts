import { db } from '@/lib/firebaseClient';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  try {
    // Get a limited number of provider IDs to pre-render
    // In a production environment, you might want to be more selective
    const providersQuery = query(collection(db, 'providers'), where('status', '==', 'active'), limit(10));
    const providersSnapshot = await getDocs(providersQuery);
    
    return providersSnapshot.docs.map(doc => ({
      id: doc.id
    }));
  } catch (error) {
    console.error('Error generating static params for providers:', error);
    return []; // Return empty array if there's an error
  }
}
import { db } from '@/lib/firebaseClient';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import ListingDetailClient from './listing-client';

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  try {
    // Get a limited number of listing IDs to pre-render
    const listingsCollectionRef = collection(db, 'listings');
    const limitedQuery = query(listingsCollectionRef, limit(10));
    const convertedQuery = limitedQuery.withConverter({
      fromFirestore: (snapshot) => ({ id: snapshot.id }),
      toFirestore: () => ({})
    });
    const listingsSnapshot = await getDocs(convertedQuery);
    
    return listingsSnapshot.docs.map(doc => ({
      id: doc.id
    }));
  } catch (error) {
    console.error('Error generating static params for admin listings:', error);
    return []; // Return empty array if there's an error
  }
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  return <ListingDetailClient id={id} />;
}
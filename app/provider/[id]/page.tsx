import { db } from '@/lib/firebaseClient';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import ProviderProfileClient from './provider-client';

interface ProviderDetailPageProps {
  params: Promise<{ id: string }>;
}

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

export default async function ProviderProfilePage({ params }: ProviderDetailPageProps) {
  // In Next.js App Router, we need to properly await params before accessing its properties
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Now we can safely use the id
  return <ProviderProfileClient id={id} />;
}
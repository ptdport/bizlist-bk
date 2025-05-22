import { db } from '@/lib/firebaseClient';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import ReportDetailClient from './report-client';

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  try {
    // Get a limited number of report IDs to pre-render
    const reportsCollectionRef = collection(db, 'reports');
    const limitedQuery = query(reportsCollectionRef, limit(10));
    const convertedQuery = limitedQuery.withConverter({
      fromFirestore: (snapshot) => ({ id: snapshot.id }),
      toFirestore: () => ({})
    });
    const reportsSnapshot = await getDocs(convertedQuery);
    
    return reportsSnapshot.docs.map(doc => ({
      id: doc.id
    }));
  } catch (error) {
    console.error('Error generating static params for admin reports:', error);
    return []; // Return empty array if there's an error
  }
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  return <ReportDetailClient id={id} />;
}
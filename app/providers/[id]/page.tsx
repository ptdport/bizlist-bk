import { Metadata } from 'next';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ProviderProfileClient } from './provider-profile-client';
import { PROVIDERS } from '@/lib/constants';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Provider Profile - BizList',
  description: 'View detailed information about this service provider',
};

import { db } from '@/lib/firebaseClient';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

// This function tells Next.js which provider IDs to pre-render at build time
export async function generateStaticParams() {
  try {
    // Get a limited number of provider IDs to pre-render
    const providersQuery = query(collection(db, 'providers'), where('status', '==', 'active'), limit(10));
    const providersSnapshot = await getDocs(providersQuery);
    
    return providersSnapshot.docs.map(doc => ({
      id: doc.id
    }));
  } catch (error) {
    console.error('Error generating static params for providers:', error);
    // Fallback to some default IDs if there's an error
    return [
      { id: '1' }, // Premier Plumbing Solutions
      { id: '2' }, // Sparkling Clean Services
      { id: '3' }, // Elite Electrical Contractors
      { id: '4' }, // Landscape Masters
    ];
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProviderProfilePage({ params }: PageProps) {
  // Await the params object
  const resolvedParams = await params;
  
  // Validate the ID parameter
  if (!resolvedParams?.id) {
    notFound();
  }

  // Find the provider
  const provider = PROVIDERS.find((p) => p.id === resolvedParams.id);

  // If provider is not found, show 404
  if (!provider) {
    notFound();
  }

  // Generate dynamic metadata
  metadata.title = `${provider.name} - BizList`;
  metadata.description = provider.description;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Providers', href: '/providers' },
            { label: provider.name },
          ]}
          className="mb-6"
        />
        <ProviderProfileClient provider={provider} />
      </div>
    </div>
  );
}
import { Metadata } from 'next';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ProvidersClient } from './providers-client';

export const metadata: Metadata = {
  title: 'Find Providers | BizList',
  description: 'Browse and find professional service providers in your area',
};

export default function ProvidersPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Providers', href: '/providers' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      <ProvidersClient />
    </div>
  );
}
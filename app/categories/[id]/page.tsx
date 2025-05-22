import { Metadata } from 'next';
import { CATEGORIES, PROVIDERS } from '@/lib/constants';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { CategoryClient } from './category-client';

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

import { db } from '@/lib/firebaseClient';
import { collection, getDocs } from 'firebase/firestore';

export async function generateStaticParams() {
  try {
    // Get categories from Firestore
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    return categoriesSnapshot.docs.map(doc => ({
      id: doc.id
    }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    // Fallback to the constant categories if there's an error
    return CATEGORIES.map((category) => ({
      id: category.id,
    }));
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = CATEGORIES.find((c) => c.id === resolvedParams.id);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Services | BizList`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const category = CATEGORIES.find((c) => c.id === resolvedParams.id);
  
  if (!category) {
    notFound();
  }

  const categoryProviders = PROVIDERS.filter(
    (provider) => provider.category === category.name
  );

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: category.name, href: `/categories/${category.id}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      <CategoryClient category={category} providers={categoryProviders} />
    </div>
  );
} 
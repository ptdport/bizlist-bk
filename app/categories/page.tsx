import { Metadata } from 'next';
import CategoryGrid from '@/components/categories/category-grid';
import CategoryHero from '@/components/categories/category-hero';

export const metadata: Metadata = {
  title: 'Categories - BizList',
  description: 'Browse all service categories available on BizList',
};

export default function CategoriesPage() {
  return (
    <div className="flex flex-col">
      <CategoryHero />
      <CategoryGrid />
    </div>
  );
}
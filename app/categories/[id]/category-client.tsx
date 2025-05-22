"use client";

import { CATEGORIES, PROVIDERS } from '@/lib/constants';
import { ProviderCard } from '@/components/providers/provider-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';
import Link from 'next/link';

type Category = typeof CATEGORIES[number];
type Provider = typeof PROVIDERS[number];

interface CategoryClientProps {
  category: Category;
  providers: Provider[];
}

export function CategoryClient({ category, providers }: CategoryClientProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {category.subcategories.map((sub: string) => (
          <Badge key={sub} variant="secondary">{sub}</Badge>
        ))}
      </div>

      {providers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No providers found in {category.name}
          </h3>
          <p className="text-muted-foreground mb-6">
            We couldn't find any providers in this category at the moment.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/providers">
                Browse All Providers
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/categories">
                View Other Categories
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 
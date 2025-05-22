"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const CategoryHero = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <section className="relative bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Browse Service Categories</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Explore our comprehensive list of service categories to find the perfect professional for your needs
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategoryHero;
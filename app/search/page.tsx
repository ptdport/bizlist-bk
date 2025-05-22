"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearch } from '@/components/search/SearchContext';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { 
    searchTerm, 
    setSearchTerm, 
    category, 
    setCategory, 
    location, 
    setLocation 
  } = useSearch();

  // Sync URL params with search context when the page loads
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    const loc = searchParams.get('location');
    
    if (q) setSearchTerm(q);
    if (cat) setCategory(cat);
    if (loc) setLocation(loc);
  }, [searchParams, setSearchTerm, setCategory, setLocation]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Search Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Search Term:</span> {searchTerm || 'None'}
          </div>
          <div>
            <span className="font-medium">Category:</span> {category === 'all' ? 'All Categories' : category || 'All Categories'}
          </div>
          <div>
            <span className="font-medium">Location:</span> {location || 'Anywhere'}
          </div>
        </div>
      </div>
      
      {/* This is a placeholder for actual search results */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">
          This is a placeholder for the actual search results implementation.
          <br />
          The search functionality is now synchronized between the hero section and header.
        </p>
      </div>
    </div>
  );
}
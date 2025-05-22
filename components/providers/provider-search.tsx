"use client";

import { useState } from 'react';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProviderFilters from './provider-filters';
import { db } from '@/lib/firebaseClient';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const ProviderSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [businessType, setBusinessType] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm && !location && (businessType === 'all' || !businessType)) return;
    
    setIsSearching(true);
    
    try {
      // This is a simplified example - in a real app, you would need to implement
      // more complex search logic, possibly using a service like Algolia or a custom backend
      
      let providerQuery = query(
        collection(db, 'providers'),
        where('status', '==', 'active')
      );
      
      // In a real implementation, you would add filters based on search term, location, etc.
      // For now, we're just logging the search parameters
      
      console.log('Searching for providers with:', {
        searchTerm,
        location,
        businessType
      });
      
      // You would then update a global state or context with the search results
      
    } catch (error) {
      console.error('Error searching providers:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for services or providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="relative md:w-[200px]">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={businessType} onValueChange={setBusinessType}>
          <SelectTrigger className="md:w-[200px]">
            <SelectValue placeholder="Business Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="service_provider">Service Provider</SelectItem>
            <SelectItem value="retailer">Retailer</SelectItem>
            <SelectItem value="manufacturer">Manufacturer</SelectItem>
            <SelectItem value="wholesaler">Wholesaler</SelectItem>
            <SelectItem value="consultant">Consultant</SelectItem>
          </SelectContent>
        </Select>
        
        <Button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>
      
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <ProviderFilters />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </form>
  );
};

export default ProviderSearch;
"use client";

import { useState, useMemo } from 'react';
import { Provider, SearchFilters } from '@/types';
import { PROVIDERS } from '@/lib/constants';

export function useProviders() {
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    priceRange: [0, 200],
    rating: 0,
    availability: [],
    verifiedOnly: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const filteredProviders = useMemo(() => {
    return PROVIDERS.filter((provider) => {
      // Search term filter
      if (searchTerm && !provider.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !provider.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }

      // Location filter
      if (location && !provider.location.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(provider.category)) {
        return false;
      }

      // Price range filter
      if (provider.hourlyRate < filters.priceRange[0] || provider.hourlyRate > filters.priceRange[1]) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && provider.rating < filters.rating) {
        return false;
      }

      // Availability filter
      if (filters.availability.length > 0 && 
          !filters.availability.some(time => provider.availability.includes(time))) {
        return false;
      }

      // Verified only filter
      if (filters.verifiedOnly && !provider.verified) {
        return false;
      }

      return true;
    });
  }, [searchTerm, location, filters]);

  return {
    providers: filteredProviders,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    location,
    setLocation,
  };
} 
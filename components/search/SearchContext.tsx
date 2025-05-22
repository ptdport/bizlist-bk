"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LocationSuggestion } from '@/components/ui/location-autocomplete';

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  category: string;
  setCategory: (category: string) => void;
  location: string;
  setLocation: (location: string) => void;
  selectedPlace: LocationSuggestion | null;
  setSelectedPlace: (place: LocationSuggestion | null) => void;
  performSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const router = useRouter();
  
  // Initialize state from localStorage if available
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [category, setCategory] = useState<string>('all'); // Default to 'all'
  const [location, setLocation] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<LocationSuggestion | null>(null);

  // Load saved search state from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearchTerm = localStorage.getItem('searchTerm');
      const savedCategory = localStorage.getItem('searchCategory');
      const savedLocation = localStorage.getItem('searchLocation');
      const savedSelectedPlace = localStorage.getItem('selectedPlace');

      if (savedSearchTerm) setSearchTerm(savedSearchTerm);
      if (savedCategory) setCategory(savedCategory);
      if (savedLocation) setLocation(savedLocation);
      if (savedSelectedPlace) {
        try {
          setSelectedPlace(JSON.parse(savedSelectedPlace));
        } catch (e) {
          console.error('Error parsing saved place:', e);
        }
      }
    }
  }, []);

  // Save search state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('searchTerm', searchTerm);
      localStorage.setItem('searchCategory', category);
      localStorage.setItem('searchLocation', location);
      if (selectedPlace) {
        localStorage.setItem('selectedPlace', JSON.stringify(selectedPlace));
      }
    }
  }, [searchTerm, category, location, selectedPlace]);

  // Function to perform the actual search
  const performSearch = () => {
    console.log('Performing search with:', { searchTerm, category, location, selectedPlace });
    
    // Build query parameters
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (category && category !== 'all') params.append('category', category);
    if (location) params.append('location', location);
    if (selectedPlace?.placeId) params.append('placeId', selectedPlace.placeId);
    
    // Navigate to search results page
    router.push(`/search?${params.toString()}`);
  };

  const value = {
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    location,
    setLocation,
    selectedPlace,
    setSelectedPlace,
    performSearch,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
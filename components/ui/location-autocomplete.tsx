"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { loadGoogleMapsApi, isGoogleMapsLoaded } from '@/lib/googleMapsLoader';
import { cn } from '@/lib/utils';

export interface LocationSuggestion {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  suggestionsClassName?: string;
  maxLength?: number;
  showIcon?: boolean;
  disabled?: boolean;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "City or Zip",
  className,
  inputClassName,
  suggestionsClassName,
  maxLength = 50,
  showIcon = false,
  disabled = false,
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load Google Maps API when component mounts
  useEffect(() => {
    const loadMapsApi = async () => {
      if (!isGoogleMapsLoaded()) {
        setIsLoading(true);
        try {
          await loadGoogleMapsApi();
          if (window.google?.maps?.places) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
          }
        } catch (error) {
          console.error('Failed to load Google Maps API:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (window.google?.maps?.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
      }
    };

    loadMapsApi();
  }, []);

  // Handle clicks outside the component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions when input value changes
  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (!input || input.length < 2) {
        setSuggestions([]);
        return;
      }
      
      // Check if Google Maps API is loaded and autocomplete service is available
      if (!window.google?.maps?.places || !autocompleteService.current) {
        try {
          await loadGoogleMapsApi();
          if (window.google?.maps?.places) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
          } else {
            console.error('Google Maps Places API not available');
            return;
          }
        } catch (error) {
          console.error('Failed to load Google Maps API:', error);
          return;
        }
      }

      try {
        // First try with cities
        let response = await new Promise<google.maps.places.AutocompletePrediction[]>(
          (resolve, reject) => {
            autocompleteService.current?.getPlacePredictions(
              {
                input,
                types: ['(cities)'],
                componentRestrictions: { country: 'us' }, // Restrict to US - change as needed
              },
              (predictions, status) => {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                  // If no cities found or error, resolve with empty array
                  return resolve([]);
                }
                resolve(predictions || []);
              }
            );
          }
        );
        
        // If no cities found and input looks like a zip code (numbers only), try postal_code
        if (response.length === 0 && /^\d+$/.test(input)) {
          const postalResponse = await new Promise<google.maps.places.AutocompletePrediction[]>(
            (resolve, reject) => {
              autocompleteService.current?.getPlacePredictions(
                {
                  input,
                  types: ['postal_code'],
                  componentRestrictions: { country: 'us' },
                },
                (predictions, status) => {
                  if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    // If no postal codes found or error, resolve with empty array
                    return resolve([]);
                  }
                  resolve(predictions || []);
                }
              );
            }
          );
          
          // Combine results
          response = [...response, ...postalResponse];
        }
        
        // If still no results, try with geocode type as a fallback
        if (response.length === 0) {
          const geocodeResponse = await new Promise<google.maps.places.AutocompletePrediction[]>(
            (resolve, reject) => {
              autocompleteService.current?.getPlacePredictions(
                {
                  input,
                  types: ['geocode'], // This includes a wider range of geographic locations
                  componentRestrictions: { country: 'us' },
                },
                (predictions, status) => {
                  if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    return resolve([]);
                  }
                  resolve(predictions || []);
                }
              );
            }
          );
          
          // Add geocode results
          response = [...response, ...geocodeResponse];
        }

        const formattedSuggestions = response.map((prediction) => ({
          description: prediction.description,
          placeId: prediction.place_id,
          mainText: prediction.structured_formatting.main_text,
          secondaryText: prediction.structured_formatting.secondary_text,
        }));

        setSuggestions(formattedSuggestions);
        setIsOpen(true);
      } catch (error) {
        console.error('Error in location autocomplete:', error);
        setSuggestions([]);
        setIsOpen(false);
      }
    },
    [autocompleteService]
  );

  // Debounce input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value && isFocused) {
        fetchSuggestions(value);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, fetchSuggestions, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (!newValue) {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onChange(suggestion.description);
    setSuggestions([]);
    setIsOpen(false);
    
    if (onPlaceSelect) {
      onPlaceSelect(suggestion);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value && value.length >= 2) {
      fetchSuggestions(value);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        {showIcon && (
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={cn(
            showIcon && "pl-10",
            inputClassName
          )}
          maxLength={maxLength}
          disabled={disabled || isLoading}
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className={cn(
            "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            suggestionsClassName
          )}
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.placeId}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100 flex flex-col"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="font-medium">{suggestion.mainText}</span>
              <span className="text-sm text-gray-500">{suggestion.secondaryText}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
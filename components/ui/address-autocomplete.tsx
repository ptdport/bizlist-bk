"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { loadGoogleMapsApi, isGoogleMapsLoaded } from '@/lib/googleMapsLoader';

// Define the address components structure
export interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange: (address: string, components: AddressComponents) => void;
  className?: string;
  error?: string;
}

export function AddressAutocomplete({
  label = "Address",
  placeholder = "Start typing your address...",
  required = false,
  value = "",
  onChange,
  className = "",
  error
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded());
  const autocompleteService = useRef<any>(null);
  const geocoder = useRef<any>(null);

  // Load Google Maps API using our centralized loader
  useEffect(() => {
    if (isGoogleMapsLoaded()) {
      setIsLoaded(true);
      return;
    }

    loadGoogleMapsApi()
      .then(() => {
        setIsLoaded(true);
      })
      .catch(error => {
        console.error("Error loading Google Maps API:", error);
      });
  }, []);

  // Initialize services when API is loaded
  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.places) return;
    
    try {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      geocoder.current = new window.google.maps.Geocoder();
    } catch (error) {
      console.error("Error initializing Google Maps services:", error);
    }
  }, [isLoaded]);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length > 2 && autocompleteService.current && isLoaded) {
      autocompleteService.current.getPlacePredictions(
        { input: value },
        (predictions: any[], status: string) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (placeId: string, description: string) => {
    setInputValue(description);
    setShowSuggestions(false);
    
    if (geocoder.current) {
      // Get place details
      geocoder.current.geocode({ placeId }, (results: any[], status: string) => {
        if (status === 'OK' && results && results[0]) {
          const addressComponents = results[0].address_components;
          
          // Extract address components
          const components: AddressComponents = {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
          };
          
          // Street number and street name
          const streetNumber = addressComponents.find((component: any) => 
            component.types.includes('street_number')
          )?.long_name || '';
          
          const route = addressComponents.find((component: any) => 
            component.types.includes('route')
          )?.long_name || '';
          
          components.street = streetNumber && route 
            ? `${streetNumber} ${route}` 
            : route || '';
          
          // City
          components.city = addressComponents.find((component: any) => 
            component.types.includes('locality') || 
            component.types.includes('sublocality') ||
            component.types.includes('administrative_area_level_3')
          )?.long_name || '';
          
          // State/Province
          components.state = addressComponents.find((component: any) => 
            component.types.includes('administrative_area_level_1')
          )?.long_name || '';
          
          // Zip/Postal code
          components.zip = addressComponents.find((component: any) => 
            component.types.includes('postal_code')
          )?.long_name || '';
          
          // Country
          components.country = addressComponents.find((component: any) => 
            component.types.includes('country')
          )?.long_name || '';
          
          // Call the onChange callback with the full address and components
          onChange(description, components);
        }
      });
    }
  };

  return (
    <div className="relative">
      {label && (
        <Label htmlFor="address-autocomplete" className="mb-1 block">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <MapPin size={18} />
        </div>
        
        <Input
          id="address-autocomplete"
          type="text"
          className={`pl-10 ${className}`}
          placeholder={isLoaded ? placeholder : "Loading address service..."}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow for clicks
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          required={required}
          disabled={!isLoaded}
        />
      </div>
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                onMouseDown={() => handleSelectSuggestion(suggestion.place_id, suggestion.description)}
              >
                <MapPin size={16} className="mr-2 mt-1 flex-shrink-0 text-muted-foreground" />
                <span>{suggestion.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
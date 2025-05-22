"use client";

import { Search, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import LocationAutocomplete, { LocationSuggestion } from '@/components/ui/location-autocomplete';
import { useSearch } from '@/components/search/SearchContext';

const Hero = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    category, 
    setCategory, 
    location, 
    setLocation, 
    selectedPlace, 
    setSelectedPlace,
    performSearch
  } = useSearch();
  
  const handlePlaceSelect = (place: LocationSuggestion) => {
    setSelectedPlace(place);
  };

  return (
    <section id="hero-section" className="relative bg-gradient-to-r from-primary/10 to-secondary/10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-in fade-in slide-in-from-bottom duration-700 ease-in-out">
            Find Trusted Local <span className="text-primary">Service Providers</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-150 ease-in-out">
            Connect with top-rated professionals for your projects. Get quotes, compare services, and hire the best fit for your needs.
          </p>
          
          <div className="bg-white rounded-[16px] shadow p-2 md:p-3 md:min-w-[960px] mx-auto animate-in fade-in slide-in-from-bottom duration-200 delay-100 ease-in-out border-2 border-primary/10 hover:border-primary/20">
            <form 
              className="flex flex-col md:flex-row items-stretch w-full"
              onSubmit={(e) => {
                e.preventDefault();
                performSearch();
              }}>
              <div className="flex flex-[2] items-center bg-transparent min-w-0">
                <Search className="ml-4 mr-2 h-6 w-6 text-muted-foreground" />
                <Input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Product, service, influencer..." 
                  className="border-0 shadow-none bg-transparent px-0 text-lg placeholder:text-muted-foreground flex-1 min-w-0 focus-visible:ring-offset-none focus-visible:ring-0"
                />
              </div>
             
              <div className="hidden md:block h-8 w-px bg-border/50 self-center mx-2" />
              <div className="flex items-center min-w-[200px]">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-0 shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent text-lg px-0 min-w-0 font-semibold">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="home">Home Improvement</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="personal">Personal Services</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="lessons">Lessons</SelectItem>
                    <SelectItem value="business">Business Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="hidden md:block h-8 w-px bg-border/50 self-center mx-2" />
              <div className="flex items-center min-w-[80px] max-w-[120px] w-full">
                <LocationAutocomplete
                  value={location}
                  onChange={setLocation}
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="City or Zip"
                  inputClassName="border-0 shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent text-lg placeholder:text-muted-foreground px-0 min-w-0 focus-visible:ring-0"
                  suggestionsClassName="w-[250px] right-0"
                />
              </div>
              <Button type="submit" className="ml-2 rounded-[8px] bg-green-600 hover:bg-green-700 text-white text-lg font-semibold px-8 h-14 md:h-auto">
                Search
              </Button>
            </form>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <span className='popular-categories-hero'>Popular:</span>
            {['Plumbing', 'House Cleaning', 'Electrician', 'Landscaping', 'Moving'].map((term) => (
              <Button 
                key={term} 
                variant="outline" 
                size="sm" 
                className="hover:text-primary"
                onClick={() => setSearchTerm(term)}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
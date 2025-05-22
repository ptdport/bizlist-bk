"use client";

import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const categories = [
  'Home Improvement',
  'Cleaning',
  'Personal Services',
  'Events',
  'Lessons',
  'Business Services',
  'Health & Wellness',
  'Tech Services',
];

const ProviderFilters = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [rating, setRating] = useState(0);
  const [availability, setAvailability] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category]);
                  } else {
                    setSelectedCategories(selectedCategories.filter((c) => c !== category));
                  }
                }}
              />
              <label htmlFor={category} className="ml-2 text-sm cursor-pointer">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Price Range (per hour)</h3>
        <Slider
          value={priceRange}
          min={0}
          max={200}
          step={10}
          onValueChange={setPriceRange}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-sm">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <Button
              key={stars}
              variant="outline"
              className={cn(
                "w-full justify-start",
                rating === stars && "border-primary"
              )}
              onClick={() => setRating(stars === rating ? 0 : stars)}
            >
              <div className="flex items-center">
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4 mr-0.5",
                        i < stars
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                <span className="ml-2">{stars}+ stars</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="available-now" />
            <Label htmlFor="available-now">Available Now</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="available-today" />
            <Label htmlFor="available-today">Available Today</Label>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center mb-4">
          <Checkbox
            id="verified"
            checked={verifiedOnly}
            onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
          />
          <label htmlFor="verified" className="ml-2 text-sm cursor-pointer">
            Verified Providers Only
          </label>
        </div>
      </div>

      {(selectedCategories.length > 0 ||
        rating > 0 ||
        availability.length > 0 ||
        verifiedOnly) && (
        <div>
          <h3 className="font-medium mb-2">Active Filters</h3>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="cursor-pointer"
                onClick={() =>
                  setSelectedCategories(
                    selectedCategories.filter((c) => c !== category)
                  )
                }
              >
                {category}
                <Check className="ml-1 h-3 w-3" />
              </Badge>
            ))}
            {rating > 0 && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setRating(0)}
              >
                {rating}+ Stars
                <Check className="ml-1 h-3 w-3" />
              </Badge>
            )}
            {availability.map((time) => (
              <Badge
                key={time}
                variant="secondary"
                className="cursor-pointer"
                onClick={() =>
                  setAvailability(availability.filter((t) => t !== time))
                }
              >
                {time}
                <Check className="ml-1 h-3 w-3" />
              </Badge>
            ))}
            {verifiedOnly && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setVerifiedOnly(false)}
              >
                Verified Only
                <Check className="ml-1 h-3 w-3" />
              </Badge>
            )}
          </div>
          <Button
            variant="link"
            className="mt-2 h-auto p-0"
            onClick={() => {
              setSelectedCategories([]);
              setPriceRange([0, 200]);
              setRating(0);
              setAvailability([]);
              setVerifiedOnly(false);
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProviderFilters;
"use client";

import Link from 'next/link';
import { MapPin, Clock, Heart, Share2, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProviderCardProps {
  provider: any;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  // Format the address for display
  const formattedAddress = provider.address ? 
    [provider.address.city, provider.address.state, provider.address.country]
      .filter(Boolean)
      .join(', ') : '';

  return (
    <div className="bg-white border border-border/50 rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
      {/* Profile Image */}
      <div className="flex-shrink-0 flex flex-col items-center md:items-start">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-2 bg-primary/10 flex items-center justify-center">
          {provider.logo_url ? (
            <img
              src={provider.logo_url}
              alt={provider.business_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-primary text-2xl font-bold">
              {provider.business_name?.charAt(0) || 'B'}
            </span>
          )}
        </div>
        {provider.status === 'verified' && (
          <Badge className="bg-green-100 text-green-800 font-medium px-3 py-1 rounded mb-2 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{provider.business_name}</span>
            {/* If we had ratings, we would show them here */}
            {provider.rating && (
              <span className="flex items-center text-sm font-medium ml-2">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                {provider.rating}
                <span className="text-muted-foreground ml-1">
                  ({provider.review_count || 0} reviews)
                </span>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" aria-label="Favorite">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Share">
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button asChild className="ml-2">
              <Link href={`/provider/${provider.id}`}>See profile</Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm mt-1">
          {formattedAddress && (
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="font-medium">Serves {formattedAddress}</span>
            </span>
          )}
          {provider.year_established && (
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>Established <span className="font-medium">{provider.year_established}</span></span>
            </span>
          )}
        </div>
        <div className="text-muted-foreground text-sm mt-2 mb-2">
          {provider.description?.length > 150 
            ? `${provider.description.substring(0, 150)}...` 
            : provider.description}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {provider.service_types?.map((service: string, index: number) => (
            <span
              key={index}
              className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground"
            >
              {service}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


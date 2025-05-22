"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PROVIDERS } from '@/lib/constants';

const FeaturedProviders = () => {
  // Get top 4 providers sorted by rating
  const featuredProviders = [...PROVIDERS]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Top Rated Service Providers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover highly-rated professionals in your area who consistently deliver exceptional service
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48">
                <Image
                  src={provider.image}
                  alt={provider.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {provider.verified && (
                  <div className="absolute top-3 right-3 bg-primary/90 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Verified
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 text-xs px-2 py-1 rounded-full">
                  {provider.category}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{provider.name}</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{provider.rating}</span>
                    <span className="ml-1 text-xs text-muted-foreground">({provider.reviewCount})</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {provider.location}
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Services:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.services.map((service, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-secondary px-2 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  asChild
                >
                  <Link href={`/providers/${provider.id}`}>View Profile</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/providers">
              View All Service Providers
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProviders;
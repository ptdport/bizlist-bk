"use client";

import { db } from '@/lib/firebaseClient';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Globe, Clock, Star, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProviderProfileClient({ id }: { id: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        const providerDoc = await getDoc(doc(db, 'providers', id));
        
        if (!providerDoc.exists()) {
          setError('Provider not found');
          return;
        }
        
        const providerData = {
          id: providerDoc.id,
          ...providerDoc.data()
        };
        
        setProvider(providerData);
        
        // Fetch provider's listings
        const listingsQuery = query(
          collection(db, 'listings'),
          where('provider_id', '==', id)
        );
        
        const listingsSnapshot = await getDocs(listingsQuery);
        const listingsData = listingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setListings(listingsData);
      } catch (err) {
        console.error('Error fetching provider:', err);
        setError('Failed to load provider information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProvider();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || 'Provider information could not be loaded'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Cover Photo */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-8">
          {provider.cover_photo_url ? (
            <img 
              src={provider.cover_photo_url} 
              alt={`${provider.business_name} cover`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-semibold">{provider.business_name}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Provider Info */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  {provider.logo_url ? (
                    <img 
                      src={provider.logo_url} 
                      alt={provider.business_name} 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold mb-4">
                      {provider.business_name.charAt(0)}
                    </div>
                  )}
                  
                  <h1 className="text-2xl font-bold text-center mb-1">{provider.business_name}</h1>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <Badge variant="outline" className="font-normal">
                      {provider.business_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    
                    {provider.status === 'verified' && (
                      <Badge variant="secondary" className="font-normal">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-center text-muted-foreground text-sm mb-4">
                    {provider.description?.length > 150 
                      ? `${provider.description.substring(0, 150)}...` 
                      : provider.description}
                  </p>
                  
                  <div className="w-full space-y-3 pt-4 border-t">
                    {provider.business_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{provider.business_phone}</span>
                      </div>
                    )}
                    
                    {provider.business_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{provider.business_email}</span>
                      </div>
                    )}
                    
                    {provider.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {provider.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    
                    {provider.address?.city && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {[
                            provider.address.city,
                            provider.address.state,
                            provider.address.country
                          ].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {provider.year_established && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Established {provider.year_established}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Service Areas */}
            {provider.service_areas && provider.service_areas.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Service Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.service_areas.map((area: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right Column - Tabs Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="listings">Listings</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">About {provider.business_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{provider.description}</p>
                  </CardContent>
                </Card>
                
                {/* Featured Services Preview */}
                {provider.service_types && provider.service_types.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Featured Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {provider.service_types.slice(0, 5).map((service: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {provider.service_types.length > 5 && (
                        <Button 
                          variant="link" 
                          className="mt-2 p-0 h-auto" 
                          onClick={() => setActiveTab('services')}
                        >
                          View all services
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="services" className="space-y-6">
                {/* Services */}
                {provider.service_types && provider.service_types.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Services Offered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {provider.service_types.map((service: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {/* Products */}
                {provider.products_offered && provider.products_offered.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Products Offered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {provider.products_offered.map((product: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>{product}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="listings" className="space-y-6">
                {listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listings.map((listing) => (
                      <Card key={listing.id} className="overflow-hidden">
                        <div className="aspect-w-16 aspect-h-9">
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title} 
                              className="object-cover w-full h-48"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {listing.description?.substring(0, 100)}
                            {listing.description?.length > 100 ? '...' : ''}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-primary">
                              {listing.price ? `$${listing.price}` : 'Contact for price'}
                            </span>
                            <Link 
                              href={`/listings/${listing.id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              View Details
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No listings available from this provider.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Reviews coming soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}
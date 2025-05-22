"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Star, MapPin, BadgeCheck, Clock, Calendar, Shield, Award, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

const provider = {
  id: '1',
  name: 'Premier Plumbing Solutions',
  category: 'Home Improvement',
  rating: 4.9,
  reviewCount: 187,
  location: 'San Francisco, CA',
  image: 'https://images.pexels.com/photos/8005380/pexels-photo-8005380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  verified: true,
  vettedPro: true,
  hourlyRate: 85,
  availability: ['Weekdays', 'Weekends', 'Emergency'],
  services: ['Plumbing Repair', 'Drain Cleaning', 'Fixture Installation'],
  description: 'Professional plumbing services with 15+ years of experience. Available 24/7 for emergency repairs.',
  about: 'Premier Plumbing Solutions has been serving the San Francisco Bay Area for over 15 years. We pride ourselves on providing reliable, high-quality plumbing services with transparent pricing and exceptional customer service. Our team of licensed plumbers is available 24/7 for emergency repairs.',
  verifications: {
    idVerified: true,
    businessLicense: true,
    insurance: true,
    backgroundCheck: true,
  },
  gallery: [
    'https://images.pexels.com/photos/8005380/pexels-photo-8005380.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/8005383/pexels-photo-8005383.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/8005397/pexels-photo-8005397.jpeg?auto=compress&cs=tinysrgb&w=600',
  ],
};

const ProviderProfile = () => {
  const [selectedService, setSelectedService] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle message submission
    console.log({ selectedService, message });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-card rounded-lg shadow-md overflow-hidden mb-8">
              <div className="relative h-64">
                <Image
                  src={provider.image}
                  alt={provider.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {provider.verified && (
                    <Badge className="bg-primary/90" variant="secondary">
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {provider.vettedPro && (
                    <Badge className="bg-green-600/90" variant="secondary">
                      <Shield className="w-3 h-3 mr-1" />
                      Vetted Pro
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold">{provider.name}</h1>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 font-medium text-lg">{provider.rating}</span>
                    <span className="ml-1 text-muted-foreground">
                      ({provider.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {provider.location}
                </div>

                <p className="text-muted-foreground">{provider.description}</p>
              </div>
            </div>

            {/* About */}
            <Card className="mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-muted-foreground">{provider.about}</p>
              </div>
            </Card>

            {/* Verifications */}
            <Card className="mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Verifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(provider.verifications).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      {value ? (
                        <Shield className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <Shield className="w-5 h-5 text-gray-300 mr-2" />
                      )}
                      <span className={value ? 'text-green-600' : 'text-gray-500'}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Gallery */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Work Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {provider.gallery.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Send Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {provider.services.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Textarea
                      placeholder="Describe your project needs..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Hourly Rate:</span>
                    <span className="font-medium">${provider.hourlyRate}/hour</span>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Availability:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {provider.availability.map((time) => (
                        <Badge key={time} variant="secondary">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
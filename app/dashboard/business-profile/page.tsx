"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useUser } from '@/components/auth/UserProvider';
import { useProfile } from '@/components/auth/ProfileContext';
import { db } from '@/lib/firebaseClient';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Edit, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import ServiceManager from '@/components/providers/service-manager';
import ProductManager from '@/components/providers/product-manager';
import { Provider } from '@/types';

export default function BusinessProfilePage() {
  return (
    <ProtectedRoute>
      <BusinessProfileContent />
    </ProtectedRoute>
  );
}

function BusinessProfileContent() {
  const router = useRouter();
  const { user } = useUser();
  const { profile, refreshProfile } = useProfile();
  const { toast } = useToast();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProviderData = async () => {
      if (!user || !profile?.has_provider) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Find the provider document for this user
        const providersQuery = query(
          collection(db, 'providers'),
          where('user_id', '==', user.uid)
        );
        
        const providerSnapshot = await getDocs(providersQuery);
        
        if (!providerSnapshot.empty) {
          const providerData = {
            id: providerSnapshot.docs[0].id,
            ...providerSnapshot.docs[0].data()
          } as Provider;
          setProvider(providerData);
        }
      } catch (error) {
        console.error('Error fetching provider data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load business profile data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProviderData();
  }, [user, profile, toast]);

  // If user doesn't have a provider account, show message
  if (!loading && !profile?.has_provider) {
    return (
      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Provider Account Required</CardTitle>
            <CardDescription>
              You need to register as a provider to access the business profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Become a provider to list your services, receive inquiries, and grow your business.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/become-a-provider">Become a Provider</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  // If provider account is pending approval, show message
  if (!loading && provider?.status === 'pending') {
    return (
      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Account Pending Approval</CardTitle>
            <CardDescription>
              Your business profile is currently under review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium">Your account is pending review</h3>
                <p className="text-sm text-muted-foreground">
                  We're reviewing your application and will notify you once approved. You'll be able to manage your services and products after approval.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/dashboard/business-profile">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Business Profile</h1>
            <p className="text-muted-foreground">
              Manage your business information, services, and products
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={provider ? `/provider/${provider.id}` : '#'}>
                <User className="mr-2 h-4 w-4" />
                View Public Profile
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profile/edit">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-48"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : provider ? (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {provider.status === 'active' ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">Your account is active</h3>
                          <p className="text-sm text-muted-foreground">
                            Your business profile is visible to potential clients
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">Your account needs attention</h3>
                          <p className="text-sm text-muted-foreground">
                            Your profile is not currently visible to clients. Please contact support for assistance.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Business Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Business Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Business Name</p>
                      <p className="font-medium">{provider.business_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Business Type</p>
                      <p>{provider.business_type}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p>{provider.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year Established</p>
                      <p>{provider.year_established}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <p>{provider.website || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/profile/edit">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Business Information
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Contact Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Business Email</p>
                      <p>{provider.business_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Business Phone</p>
                      <p>{provider.business_phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Business Address</p>
                      <p>
                        {[
                          provider.address?.street,
                          provider.address?.city,
                          provider.address?.state,
                          provider.address?.zip,
                          provider.address?.country
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/profile/edit">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Contact Information
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Payment Methods Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  {provider.payment_methods && provider.payment_methods.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {provider.payment_methods.map((method, index) => (
                        <Badge key={index} variant="secondary">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No payment methods specified</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/profile/edit">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Payment Methods
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Business Hours Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Business Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {provider.business_hours && Object.entries(provider.business_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <p className="capitalize">{day}</p>
                        <p>
                          {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/profile/edit">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Business Hours
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="services" className="space-y-6">
              <ServiceManager providerId={provider.id} />
            </TabsContent>
            
            <TabsContent value="products" className="space-y-6">
              <ProductManager providerId={provider.id} />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your business profile settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Profile Visibility</h3>
                    <p className="text-muted-foreground mb-4">
                      Control whether your business profile is visible to potential clients
                    </p>
                    <Button variant="outline" disabled={provider.status !== 'active'}>
                      {provider.status === 'active' ? 'Hide Profile' : 'Profile is currently hidden'}
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-2">Delete Business Profile</h3>
                    <p className="text-muted-foreground mb-4">
                      Permanently delete your business profile and all associated data
                    </p>
                    <Button variant="destructive">
                      Delete Business Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                There was an error loading your business profile. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
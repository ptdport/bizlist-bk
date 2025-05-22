"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserProvider';
import { useProfile } from '@/components/auth/ProfileContext';
import { useToast } from '@/components/ui/toast-provider';
import { db, storage } from '@/lib/firebaseClient';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfileContent />
    </ProtectedRoute>
  );
}

function EditProfileContent() {
  const router = useRouter();
  const { user } = useUser();
  const { profile, refreshProfile } = useProfile();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [providerData, setProviderData] = useState({
    // Business Info
    business_name: '',
    business_type: '',
    description: '',
    year_established: new Date().getFullYear().toString(),
    website: '',
    logo_url: '',
    cover_photo_url: '',
    payment_methods: [] as string[],
    
    // Business Hours
    business_hours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '15:00', closed: false },
      sunday: { open: '10:00', close: '15:00', closed: true },
    },
    
    // Services
    service_types: [] as string[],
    service_areas: [] as string[],
    products_offered: [] as string[],
    price_range: '',
    
    // Contact
    business_email: '',
    business_phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
    
    // Verification
    business_license: '',
    tax_id: '',
    
    // Business Ownership
    owner_first_name: '',
    owner_last_name: '',
    id_verification: {
      type: 'drivers_license' as 'drivers_license' | 'state_id' | 'passport' | 'passport_card',
      verified: false,
    },
  });

  // Fetch provider data
  useEffect(() => {
    const fetchProviderData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Find the provider document for this user
        const providersQuery = query(
          collection(db, 'providers'),
          where('user_id', '==', user.uid)
        );
        
        const providerSnapshot = await getDocs(providersQuery);
        
        if (!providerSnapshot.empty) {
          const providerDoc = providerSnapshot.docs[0];
          const providerData = {
            id: providerDoc.id,
            ...providerDoc.data()
          };
          
          // Check if provider is approved
          if (providerData.status !== 'active') {
            showToast({
              title: 'Access Denied',
              description: 'You can only edit your profile after it has been approved.'
            });
            router.push('/dashboard/business-profile');
            return;
          }
          
          setProvider(providerData);
          
          // Set form data
          setProviderData({
            business_name: providerData.business_name || '',
            business_type: providerData.business_type || '',
            description: providerData.description || '',
            year_established: providerData.year_established || new Date().getFullYear().toString(),
            website: providerData.website || '',
            logo_url: providerData.logo_url || '',
            cover_photo_url: providerData.cover_photo_url || '',
            payment_methods: providerData.payment_methods || [],
            
            business_hours: providerData.business_hours || {
              monday: { open: '09:00', close: '17:00', closed: false },
              tuesday: { open: '09:00', close: '17:00', closed: false },
              wednesday: { open: '09:00', close: '17:00', closed: false },
              thursday: { open: '09:00', close: '17:00', closed: false },
              friday: { open: '09:00', close: '17:00', closed: false },
              saturday: { open: '10:00', close: '15:00', closed: false },
              sunday: { open: '10:00', close: '15:00', closed: true },
            },
            
            service_types: providerData.service_types || [],
            service_areas: providerData.service_areas || [],
            products_offered: providerData.products_offered || [],
            price_range: providerData.price_range || '',
            
            business_email: providerData.business_email || '',
            business_phone: providerData.business_phone || '',
            address: providerData.address || {
              street: '',
              city: '',
              state: '',
              zip: '',
              country: '',
            },
            
            business_license: providerData.business_license || '',
            tax_id: providerData.tax_id || '',
            
            owner_first_name: providerData.owner_first_name || '',
            owner_last_name: providerData.owner_last_name || '',
            id_verification: providerData.id_verification || {
              type: 'drivers_license' as 'drivers_license' | 'state_id' | 'passport' | 'passport_card',
              verified: false,
            },
          });
          
          // Set image previews
          if (providerData.logo_url) {
            setLogoPreview(providerData.logo_url);
          }
          
          if (providerData.cover_photo_url) {
            setCoverPreview(providerData.cover_photo_url);
          }
        } else {
          showToast({
            title: 'Provider Not Found',
            description: 'We could not find your provider profile.'
          });
          router.push('/dashboard/business-profile');
        }
      } catch (error) {
        console.error('Error fetching provider data:', error);
        showToast({
          title: 'Error',
          description: 'There was an error loading your profile. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProviderData();
  }, [user, router, showToast, refreshProfile]);

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cover photo file selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields (address)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProviderData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setProviderData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'id_verification.type') {
      setProviderData(prev => ({
        ...prev,
        id_verification: {
          ...prev.id_verification,
          type: value as 'drivers_license' | 'state_id' | 'passport' | 'passport_card'
        }
      }));
    } else {
      setProviderData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle payment method checkbox changes
  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    setProviderData(prev => ({
      ...prev,
      payment_methods: checked
        ? [...prev.payment_methods, method]
        : prev.payment_methods.filter(m => m !== method)
    }));
  };
  
  // Handle business hours changes
  const handleBusinessHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setProviderData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day as keyof typeof prev.business_hours],
          [field]: value
        }
      }
    }));
  };

  // Handle multi-select changes (for arrays)
  const handleArrayItemChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, arrayName: 'service_types' | 'service_areas' | 'products_offered') => {
    const newArray = [...providerData[arrayName]];
    newArray[index] = e.target.value;
    setProviderData(prev => ({
      ...prev,
      [arrayName]: newArray
    }));
  };

  // Add new item to array
  const addArrayItem = (arrayName: 'service_types' | 'service_areas' | 'products_offered') => {
    setProviderData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }));
  };

  // Remove item from array
  const removeArrayItem = (index: number, arrayName: 'service_types' | 'service_areas' | 'products_offered') => {
    const newArray = [...providerData[arrayName]];
    newArray.splice(index, 1);
    setProviderData(prev => ({
      ...prev,
      [arrayName]: newArray
    }));
  };

  // Save profile changes
  const handleSave = async () => {
    if (!user || !provider) return;
    
    setIsSaving(true);
    
    try {
      // Upload logo if provided
      let logoUrl = providerData.logo_url;
      if (logoFile) {
        const logoRef = ref(storage, `providers/${user.uid}/logo-${Date.now()}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }
      
      // Upload cover photo if provided
      let coverUrl = providerData.cover_photo_url;
      if (coverFile) {
        const coverRef = ref(storage, `providers/${user.uid}/cover-${Date.now()}`);
        await uploadBytes(coverRef, coverFile);
        coverUrl = await getDownloadURL(coverRef);
      }
      
      // Update provider document
      const providerDocRef = doc(db, 'providers', provider.id);
      await updateDoc(providerDocRef, {
        ...providerData,
        logo_url: logoUrl,
        cover_photo_url: coverUrl,
        updated_at: new Date()
      });
      
      showToast({
        title: 'Profile Updated',
        description: 'Your provider profile has been updated successfully.'
      });
      
      // Refresh profile data
      refreshProfile();
      
      // Redirect to business profile dashboard
      router.push('/dashboard/business-profile');
    } catch (error) {
      console.error('Error updating provider profile:', error);
      showToast({
        title: 'Error',
        description: 'There was an error updating your profile. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-48"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Provider Profile</h1>
            <p className="text-muted-foreground">
              Update your business information and services
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/business-profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update your basic business details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  value={providerData.business_name}
                  onChange={handleInputChange}
                  placeholder="Your business name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="business_type">Business Type</Label>
                <Select
                  value={providerData.business_type}
                  onValueChange={(value) => handleSelectChange('business_type', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual / Freelancer</SelectItem>
                    <SelectItem value="small_business">Small Business</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="non_profit">Non-Profit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                name="description"
                value={providerData.description}
                onChange={handleInputChange}
                placeholder="Describe your business, services, and expertise..."
                className="mt-1 h-32"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="year_established">Year Established</Label>
                <Input
                  id="year_established"
                  name="year_established"
                  type="number"
                  value={providerData.year_established}
                  onChange={handleInputChange}
                  placeholder="e.g., 2020"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  name="website"
                  value={providerData.website}
                  onChange={handleInputChange}
                  placeholder="e.g., www.yourbusiness.com"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Payment Methods Accepted</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {['Credit Card', 'Cash', 'Check', 'PayPal', 'Venmo', 'Bank Transfer', 'Crypto', 'Insurance'].map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`payment-${method}`}
                      checked={providerData.payment_methods.includes(method)}
                      onCheckedChange={(checked) => handlePaymentMethodChange(method, checked as boolean)}
                    />
                    <Label htmlFor={`payment-${method}`} className="font-normal">{method}</Label>
                  </div>
                ))}
              </div>
              {providerData.payment_methods.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {providerData.payment_methods.map((method, index) => (
                    <Badge key={index} variant="secondary">{method}</Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Logo (optional)</Label>
                <div className="mt-1 flex items-center">
                  <div className="w-24 h-24 border rounded flex items-center justify-center overflow-hidden bg-muted">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">No logo</span>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="relative"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 400x400px
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Cover Photo (optional)</Label>
                <div className="mt-1 flex items-center">
                  <div className="w-32 h-24 border rounded flex items-center justify-center overflow-hidden bg-muted">
                    {coverPreview ? (
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">No cover</span>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="relative"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Cover
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 1200x400px
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
            <CardDescription>
              Set your regular business hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <div key={day} className="flex items-start space-x-4">
                <div className="w-24 pt-2">
                  <Label className="capitalize">{day}</Label>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`closed-${day}`}
                      checked={providerData.business_hours[day as keyof typeof providerData.business_hours].closed}
                      onCheckedChange={(checked) => 
                        handleBusinessHoursChange(day, 'closed', checked as boolean)
                      }
                    />
                    <Label htmlFor={`closed-${day}`} className="font-normal">Closed</Label>
                  </div>
                  
                  {!providerData.business_hours[day as keyof typeof providerData.business_hours].closed && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor={`open-${day}`}>Open</Label>
                        <Input
                          id={`open-${day}`}
                          type="time"
                          value={providerData.business_hours[day as keyof typeof providerData.business_hours].open}
                          onChange={(e) => 
                            handleBusinessHoursChange(day, 'open', e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`close-${day}`}>Close</Label>
                        <Input
                          id={`close-${day}`}
                          type="time"
                          value={providerData.business_hours[day as keyof typeof providerData.business_hours].close}
                          onChange={(e) => 
                            handleBusinessHoursChange(day, 'close', e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Services & Areas</CardTitle>
            <CardDescription>
              Update the services you offer and areas you serve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Service Types</Label>
              <div className="space-y-2 mt-1">
                {providerData.service_types.map((service, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={service}
                      onChange={(e) => handleArrayItemChange(e, index, 'service_types')}
                      placeholder="e.g., Plumbing, Electrical, etc."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem(index, 'service_types')}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('service_types')}
                >
                  Add Service Type
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Service Areas</Label>
              <div className="space-y-2 mt-1">
                {providerData.service_areas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={area}
                      onChange={(e) => handleArrayItemChange(e, index, 'service_areas')}
                      placeholder="e.g., New York, Brooklyn, etc."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem(index, 'service_areas')}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('service_areas')}
                >
                  Add Service Area
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="price_range">Price Range (optional)</Label>
              <Select
                value={providerData.price_range}
                onValueChange={(value) => handleSelectChange('price_range', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ - Budget</SelectItem>
                  <SelectItem value="$$">$$ - Mid-range</SelectItem>
                  <SelectItem value="$$$">$$$ - Premium</SelectItem>
                  <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Update your business contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="business_email">Business Email</Label>
                <Input
                  id="business_email"
                  name="business_email"
                  type="email"
                  value={providerData.business_email}
                  onChange={handleInputChange}
                  placeholder="contact@yourbusiness.com"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="business_phone">Business Phone</Label>
                <Input
                  id="business_phone"
                  name="business_phone"
                  value={providerData.business_phone}
                  onChange={handleInputChange}
                  placeholder="e.g., (123) 456-7890"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Business Address</Label>
              <div className="space-y-3 mt-1">
                <Input
                  name="address.street"
                  value={providerData.address.street}
                  onChange={handleInputChange}
                  placeholder="Street Address"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="address.city"
                    value={providerData.address.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                  
                  <Input
                    name="address.state"
                    value={providerData.address.state}
                    onChange={handleInputChange}
                    placeholder="State/Province"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="address.zip"
                    value={providerData.address.zip}
                    onChange={handleInputChange}
                    placeholder="ZIP/Postal Code"
                  />
                  
                  <Input
                    name="address.country"
                    value={providerData.address.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Business Verification</CardTitle>
            <CardDescription>
              Provide verification information for your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="business_license">Business License Number (optional)</Label>
                <Input
                  id="business_license"
                  name="business_license"
                  value={providerData.business_license}
                  onChange={handleInputChange}
                  placeholder="Enter your business license number"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="tax_id">Tax ID (optional)</Label>
                <Input
                  id="tax_id"
                  name="tax_id"
                  value={providerData.tax_id}
                  onChange={handleInputChange}
                  placeholder="Enter your tax ID"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Business Ownership</CardTitle>
            <CardDescription>
              Provide information about the business owner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="owner_first_name">Owner First Name</Label>
                <Input
                  id="owner_first_name"
                  name="owner_first_name"
                  value={providerData.owner_first_name}
                  onChange={handleInputChange}
                  placeholder="Enter owner's first name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="owner_last_name">Owner Last Name</Label>
                <Input
                  id="owner_last_name"
                  name="owner_last_name"
                  value={providerData.owner_last_name}
                  onChange={handleInputChange}
                  placeholder="Enter owner's last name"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="id_verification_type">ID Verification Type</Label>
              <Select
                value={providerData.id_verification.type}
                onValueChange={(value) => handleSelectChange('id_verification.type', value)}
              >
                <SelectTrigger id="id_verification_type" className="mt-1">
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="state_id">State ID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="passport_card">Passport Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/business-profile">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </main>
  );
}
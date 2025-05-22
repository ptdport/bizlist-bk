"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserProvider';
import { useProfile } from '@/components/auth/ProfileContext';
import { useToast } from '@/components/ui/toast-provider';
import { db, storage } from '@/lib/firebaseClient';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createNotification } from '@/lib/notifications';
import { getAdminUserIds } from '@/lib/admin';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuthModal } from '@/components/auth/AuthModalContext';
import { ArrowLeft, ArrowRight, Upload, Check, Info } from 'lucide-react';
import Link from 'next/link';
import { AddressAutocomplete, AddressComponents } from '@/components/ui/address-autocomplete';

// Provider registration steps
type RegistrationStep = 'business-info' | 'business-hours' | 'contact' | 'verification' | 'ownership' | 'review';

export default function RegisterProviderPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { profile, loading: profileLoading } = useProfile();
  const { showToast } = useToast();
  const { openModal } = useAuthModal();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('business-info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<{
    paymentMethods: boolean;
    termsAccepted: boolean;
    businessDescription: boolean;
    businessPhone: boolean;
    ownerFirstName: boolean;
    ownerLastName: boolean;
  }>({
    paymentMethods: false,
    termsAccepted: false,
    businessDescription: false,
    businessPhone: false,
    ownerFirstName: false,
    ownerLastName: false,
  });
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
    accepts_terms: false,
    
    // Business Ownership
    owner_first_name: '',
    owner_last_name: '',
    id_verification: {
      type: 'drivers_license' as 'drivers_license' | 'state_id' | 'passport' | 'passport_card',
      verified: false,
    },
  });

  // Check if user is logged in
  useEffect(() => {
    if (!userLoading && !user) {
      showToast({
        title: 'Authentication Required',
        description: 'Please sign in to register as a provider.'
      });
      openModal('signIn');
    }
  }, [user, userLoading, openModal, showToast]);

  // Pre-fill business email with user email if available
  useEffect(() => {
    if (user && user.email) {
      setProviderData(prev => ({
        ...prev,
        business_email: prev.business_email || user.email || '',
      }));
    }
  }, [user]);

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
    setProviderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setProviderData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Apply business hours to all days
  const applyHoursToAll = (sourceDay: string) => {
    const sourceHours = providerData.business_hours[sourceDay as keyof typeof providerData.business_hours];
    
    setProviderData(prev => {
      const updatedHours = { ...prev.business_hours };
      
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
        if (day !== sourceDay) {
          updatedHours[day as keyof typeof updatedHours] = {
            ...updatedHours[day as keyof typeof updatedHours],
            open: sourceHours.open,
            close: sourceHours.close,
            closed: sourceHours.closed
          };
        }
      });
      
      return {
        ...prev,
        business_hours: updatedHours
      };
    });
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

  // Helper function to count words in a string
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Navigate to next step
  const nextStep = () => {
    // Reset validation errors
    setValidationErrors({
      paymentMethods: false,
      termsAccepted: false,
      businessDescription: false,
      businessPhone: false,
      ownerFirstName: false,
      ownerLastName: false,
    });
    
    // Business Info step validations
    if (currentStep === 'business-info') {
      // Check payment methods
      if (providerData.payment_methods.length === 0) {
        setValidationErrors(prev => ({ ...prev, paymentMethods: true }));
        return;
      }
      
      // Check business description (minimum 50 words)
      if (countWords(providerData.description) < 50) {
        setValidationErrors(prev => ({ ...prev, businessDescription: true }));
        return;
      }
    }
    
    // Contact step validations
    if (currentStep === 'contact') {
      // Check business phone (must be 10 digits)
      const phoneDigits = providerData.business_phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        setValidationErrors(prev => ({ ...prev, businessPhone: true }));
        return;
      }
    }
    
    // Ownership step validations
    if (currentStep === 'ownership') {
      // Check terms acceptance
      if (!providerData.accepts_terms) {
        setValidationErrors(prev => ({ ...prev, termsAccepted: true }));
        return;
      }
      
      // Check first name (minimum 2 characters)
      if (providerData.owner_first_name.trim().length < 2) {
        setValidationErrors(prev => ({ ...prev, ownerFirstName: true }));
        return;
      }
      
      // Check last name (minimum 2 characters)
      if (providerData.owner_last_name.trim().length < 2) {
        setValidationErrors(prev => ({ ...prev, ownerLastName: true }));
        return;
      }
    }
    
    switch (currentStep) {
      case 'business-info':
        setCurrentStep('business-hours');
        break;
      case 'business-hours':
        setCurrentStep('contact');
        break;
      case 'contact':
        setCurrentStep('verification');
        break;
      case 'verification':
        setCurrentStep('ownership');
        break;
      case 'ownership':
        setCurrentStep('review');
        break;
      default:
        break;
    }
    window.scrollTo(0, 0);
  };

  // Navigate to previous step
  const prevStep = () => {
    switch (currentStep) {
      case 'business-hours':
        setCurrentStep('business-info');
        break;
      case 'contact':
        setCurrentStep('business-hours');
        break;
      case 'verification':
        setCurrentStep('contact');
        break;
      case 'ownership':
        setCurrentStep('verification');
        break;
      case 'review':
        setCurrentStep('ownership');
        break;
      default:
        break;
    }
    window.scrollTo(0, 0);
  };

  // Submit provider registration
  const handleSubmit = async () => {
    if (!user) {
      showToast({
        title: 'Authentication Required',
        description: 'Please sign in to register as a provider.'
      });
      openModal('signIn');
      return;
    }

    setIsSubmitting(true);

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

      // Create provider document
      const providerRef = collection(db, 'providers');
      const providerDoc = await addDoc(providerRef, {
        ...providerData,
        logo_url: logoUrl,
        cover_photo_url: coverUrl,
        user_id: user.uid,
        status: 'pending', // Providers start as pending until approved
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Update user profile to indicate they have a provider account
      await setDoc(doc(db, 'profiles', user.uid), {
        has_provider: true,
        provider_status: 'pending',
        updated_at: new Date().toISOString()
      }, { merge: true });

      // Create notification for the user
      await createNotification({
        userId: user.uid,
        title: 'Provider Application Submitted',
        message: 'Your provider application has been submitted and is pending review. We will notify you once it has been approved.',
        type: 'info',
        link: '/dashboard/business-profile'
      });

      // Create notifications for admin users
      const adminUserIds = await getAdminUserIds();
      if (adminUserIds.length > 0) {
        const businessName = providerData.business_name || 'New provider';
        adminUserIds.forEach(async (adminId) => {
          await createNotification({
            userId: adminId,
            title: 'New Provider Application',
            message: `${businessName} has submitted a provider application that requires review.`,
            type: 'info',
            link: `/admin/providers/${providerDoc.id}`
          });
        });
      }

      showToast({
        title: 'Registration Successful',
        description: 'Your provider application has been submitted for review.'
      });

      // Redirect to business profile dashboard
      router.push('/dashboard/business-profile');
    } catch (error) {
      console.error('Error registering provider:', error);
      showToast({
        title: 'Registration Failed',
        description: 'There was an error submitting your application. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate current step
  const validateStep = (): boolean => {
    switch (currentStep) {
      case 'business-info':
        return !!providerData.business_name && !!providerData.business_type && !!providerData.description && providerData.payment_methods.length > 0;
      case 'business-hours':
        // At least one day should be open
        return Object.values(providerData.business_hours).some(day => !day.closed);
      case 'contact':
        return !!providerData.business_email && !!providerData.business_phone && 
               !!providerData.address.city && !!providerData.address.country;
      case 'verification':
        // Business license and tax ID are optional
        return true;
      case 'ownership':
        return !!providerData.owner_first_name && !!providerData.owner_last_name && providerData.accepts_terms;
      case 'review':
        return providerData.accepts_terms;
      default:
        return true;
    }
  };

  // If user is not logged in, show sign-in prompt
  if (!userLoading && !user) {
    return (
      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be signed in to register as a provider.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/')}>
              Go Back
            </Button>
            <Button onClick={() => openModal('signIn')}>
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Register as a Provider</h1>
          <p className="text-muted-foreground">
            Complete the form below to register your business on our platform.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            {['business-info', 'business-hours', 'contact', 'verification', 'ownership', 'review'].map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : (index < ['business-info', 'business-hours', 'contact', 'verification', 'ownership', 'review'].indexOf(currentStep) 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground')
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block">
                  {step === 'business-info' ? 'Business Info' : 
                   step === 'business-hours' ? 'Hours' : 
                   step === 'ownership' ? 'Ownership' :
                   step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 h-1 bg-muted w-full"></div>
            <div 
              className="absolute top-0 left-0 h-1 bg-primary transition-all" 
              style={{ 
                width: `${((['business-info', 'business-hours', 'contact', 'verification', 'ownership', 'review'].indexOf(currentStep) + 1) / 6) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Step content */}
        <Card>
          <CardContent className="pt-6">
            {/* Business Info Step */}
            {currentStep === 'business-info' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Business Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="business_name">Business Name *</Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      value={providerData.business_name}
                      onChange={handleInputChange}
                      placeholder="Your business name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_type">Business Type *</Label>
                    <Select
                      value={providerData.business_type}
                      onValueChange={(value) => handleSelectChange('business_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service_provider">Service Provider</SelectItem>
                        <SelectItem value="retailer">Retailer</SelectItem>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="wholesaler">Wholesaler</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Business Description * (minimum 50 words)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={providerData.description}
                      onChange={(e) => {
                        handleInputChange(e);
                        // Clear validation error if description is long enough
                        if (countWords(e.target.value) >= 50 && validationErrors.businessDescription) {
                          setValidationErrors(prev => ({ ...prev, businessDescription: false }));
                        }
                      }}
                      placeholder="Describe your business, services, and what makes you unique (minimum 50 words)"
                      rows={4}
                      required
                      className={validationErrors.businessDescription ? "border-red-500" : ""}
                    />
                    {validationErrors.businessDescription && (
                      <p className="text-sm text-red-500 mt-2">
                        Please provide a detailed description of at least 50 words.
                        Current word count: {countWords(providerData.description)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      A detailed description helps customers understand your business better. 
                      Current word count: {countWords(providerData.description)}/50
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="year_established">Year Established</Label>
                    <Input
                      id="year_established"
                      name="year_established"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={providerData.year_established}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={providerData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="logo">Business Logo</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden bg-muted">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('logo')?.click()}
                          >
                            Upload Logo
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            Recommended: 400x400px
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cover">Cover Photo</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="w-32 h-24 border rounded-md flex items-center justify-center overflow-hidden bg-muted">
                          {coverPreview ? (
                            <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <Input
                            id="cover"
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('cover')?.click()}
                          >
                            Upload Cover
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            Recommended: 1200x400px
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Payment Methods Accepted *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Please select at least one payment method that you accept.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {['Cash', 'Credit Card', 'Debit Card', 'PayPal', 'Venmo', 'Bank Transfer', 'Check', 'Cryptocurrency', 'Apple Pay', 'Google Pay'].map((method) => (
                        <div key={method} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`payment-${method}`} 
                            checked={providerData.payment_methods.includes(method)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setProviderData(prev => ({
                                  ...prev,
                                  payment_methods: [...prev.payment_methods, method]
                                }));
                                // Clear validation error when at least one method is selected
                                if (validationErrors.paymentMethods) {
                                  setValidationErrors(prev => ({ ...prev, paymentMethods: false }));
                                }
                              } else {
                                setProviderData(prev => ({
                                  ...prev,
                                  payment_methods: prev.payment_methods.filter(m => m !== method)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={`payment-${method}`} className="text-sm font-normal">
                            {method}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {validationErrors.paymentMethods && (
                      <p className="text-sm text-red-500 mt-2">
                        Please select at least one payment method to continue.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Business Hours Step */}
            {currentStep === 'business-hours' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Business Hours</h2>
                <p className="text-sm text-muted-foreground">
                  Set your regular business hours. You can update these later.
                </p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">
                      Set hours for each day or use the "Apply to All" button to copy hours from one day to all others.
                    </p>
                  </div>
                  
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-28">
                        <Label className="capitalize">{day}</Label>
                      </div>
                      
                      <div className="flex-1 flex items-center gap-2">
                        <Checkbox 
                          id={`closed-${day}`}
                          checked={providerData.business_hours[day as keyof typeof providerData.business_hours].closed}
                          onCheckedChange={(checked) => {
                            setProviderData(prev => ({
                              ...prev,
                              business_hours: {
                                ...prev.business_hours,
                                [day]: {
                                  ...prev.business_hours[day as keyof typeof prev.business_hours],
                                  closed: !!checked
                                }
                              }
                            }));
                          }}
                        />
                        <Label htmlFor={`closed-${day}`} className="text-sm font-normal">
                          Closed
                        </Label>
                      </div>
                      
                      {!providerData.business_hours[day as keyof typeof providerData.business_hours].closed && (
                        <div className="flex items-center gap-2">
                          <div>
                            <Label htmlFor={`open-${day}`} className="sr-only">Opening Time</Label>
                            <Input
                              id={`open-${day}`}
                              type="time"
                              value={providerData.business_hours[day as keyof typeof providerData.business_hours].open}
                              onChange={(e) => {
                                setProviderData(prev => ({
                                  ...prev,
                                  business_hours: {
                                    ...prev.business_hours,
                                    [day]: {
                                      ...prev.business_hours[day as keyof typeof prev.business_hours],
                                      open: e.target.value
                                    }
                                  }
                                }));
                              }}
                              className="w-32"
                            />
                          </div>
                          <span>to</span>
                          <div>
                            <Label htmlFor={`close-${day}`} className="sr-only">Closing Time</Label>
                            <Input
                              id={`close-${day}`}
                              type="time"
                              value={providerData.business_hours[day as keyof typeof providerData.business_hours].close}
                              onChange={(e) => {
                                setProviderData(prev => ({
                                  ...prev,
                                  business_hours: {
                                    ...prev.business_hours,
                                    [day]: {
                                      ...prev.business_hours[day as keyof typeof prev.business_hours],
                                      close: e.target.value
                                    }
                                  }
                                }));
                              }}
                              className="w-32"
                            />
                          </div>
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyHoursToAll(day)}
                            className="ml-2"
                          >
                            Apply to All
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Step - Removed and replaced with Business Hours */}
            {false && currentStep === 'services' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Services & Products</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label>Services Offered *</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      List the services you provide
                    </p>
                    
                    {providerData.service_types.map((service, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Input
                          value={service}
                          onChange={(e) => handleArrayItemChange(e, index, 'service_types')}
                          placeholder={`Service ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem(index, 'service_types')}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('service_types')}
                      className="mt-2"
                    >
                      Add Service
                    </Button>
                  </div>
                  
                  <div>
                    <Label>Products Offered (if applicable)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      List any products you sell
                    </p>
                    
                    {providerData.products_offered.map((product, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Input
                          value={product}
                          onChange={(e) => handleArrayItemChange(e, index, 'products_offered')}
                          placeholder={`Product ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem(index, 'products_offered')}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('products_offered')}
                      className="mt-2"
                    >
                      Add Product
                    </Button>
                  </div>
                  
                  <div>
                    <Label>Service Areas *</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      List the areas where you provide services
                    </p>
                    
                    {providerData.service_areas.map((area, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Input
                          value={area}
                          onChange={(e) => handleArrayItemChange(e, index, 'service_areas')}
                          placeholder={`Area ${index + 1} (e.g., City, State or Zip Code)`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem(index, 'service_areas')}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('service_areas')}
                      className="mt-2"
                    >
                      Add Area
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="price_range">Price Range</Label>
                    <Select
                      value={providerData.price_range}
                      onValueChange={(value) => handleSelectChange('price_range', value)}
                    >
                      <SelectTrigger id="price_range">
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
                </div>
              </div>
            )}

            {/* Contact Step */}
            {currentStep === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="business_email">Business Email *</Label>
                    <Input
                      id="business_email"
                      name="business_email"
                      type="email"
                      value={providerData.business_email}
                      onChange={handleInputChange}
                      placeholder="contact@yourbusiness.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_phone">Business Phone * (10 digits required)</Label>
                    <Input
                      id="business_phone"
                      name="business_phone"
                      type="tel"
                      value={providerData.business_phone}
                      onChange={(e) => {
                        handleInputChange(e);
                        // Clear validation error if phone is valid
                        const phoneDigits = e.target.value.replace(/\D/g, '');
                        if (phoneDigits.length === 10 && validationErrors.businessPhone) {
                          setValidationErrors(prev => ({ ...prev, businessPhone: false }));
                        }
                      }}
                      placeholder="(123) 456-7890"
                      required
                      className={validationErrors.businessPhone ? "border-red-500" : ""}
                    />
                    {validationErrors.businessPhone && (
                      <p className="text-sm text-red-500 mt-2">
                        Please enter a valid 10-digit phone number.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter a valid 10-digit phone number. This will be used for business inquiries.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">Business Address</h3>
                    
                    <div>
                      <AddressAutocomplete
                        label="Business Address"
                        placeholder="Start typing your business address..."
                        required
                        value={[
                          providerData.address.street,
                          providerData.address.city,
                          providerData.address.state,
                          providerData.address.zip,
                          providerData.address.country
                        ].filter(Boolean).join(', ')}
                        onChange={(fullAddress, components) => {
                          setProviderData(prev => ({
                            ...prev,
                            address: {
                              street: components.street,
                              city: components.city,
                              state: components.state,
                              zip: components.zip,
                              country: components.country
                            }
                          }));
                        }}
                      />
                    </div>
                    
                    {/* Display the individual address components for review/editing */}
                    {(providerData.address.street || providerData.address.city || 
                      providerData.address.state || providerData.address.zip || 
                      providerData.address.country) && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-medium mb-2">Address Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="address.street">Street Address</Label>
                            <Input
                              id="address.street"
                              name="address.street"
                              value={providerData.address.street}
                              onChange={handleInputChange}
                              placeholder="123 Main St"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="address.city">City *</Label>
                            <Input
                              id="address.city"
                              name="address.city"
                              value={providerData.address.city}
                              onChange={handleInputChange}
                              placeholder="City"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="address.state">State/Province</Label>
                            <Input
                              id="address.state"
                              name="address.state"
                              value={providerData.address.state}
                              onChange={handleInputChange}
                              placeholder="State/Province"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="address.zip">Zip/Postal Code</Label>
                            <Input
                              id="address.zip"
                              name="address.zip"
                              value={providerData.address.zip}
                              onChange={handleInputChange}
                              placeholder="Zip/Postal Code"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="address.country">Country *</Label>
                            <Input
                              id="address.country"
                              name="address.country"
                              value={providerData.address.country}
                              onChange={handleInputChange}
                              placeholder="Country"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Verification Step */}
            {currentStep === 'verification' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Business Verification</h2>
                <p className="text-sm text-muted-foreground">
                  These details help us verify your business. All information is kept secure and confidential.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="business_license">Business License Number (optional)</Label>
                    <Input
                      id="business_license"
                      name="business_license"
                      value={providerData.business_license}
                      onChange={handleInputChange}
                      placeholder="Enter your business license number"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Providing your business license helps establish credibility with customers.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="tax_id">Tax ID (optional)</Label>
                    <Input
                      id="tax_id"
                      name="tax_id"
                      value={providerData.tax_id}
                      onChange={handleInputChange}
                      placeholder="Enter your tax ID"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your tax ID helps verify your business status.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Business Ownership Step */}
            {currentStep === 'ownership' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Business Ownership</h2>
                <p className="text-sm text-muted-foreground">
                  Please provide information about the business owner or primary contact.
                </p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="owner_first_name">First Name * (min. 2 characters)</Label>
                      <Input
                        id="owner_first_name"
                        name="owner_first_name"
                        value={providerData.owner_first_name}
                        onChange={(e) => {
                          handleInputChange(e);
                          // Clear validation error if name is valid
                          if (e.target.value.trim().length >= 2 && validationErrors.ownerFirstName) {
                            setValidationErrors(prev => ({ ...prev, ownerFirstName: false }));
                          }
                        }}
                        placeholder="First name"
                        required
                        className={validationErrors.ownerFirstName ? "border-red-500" : ""}
                      />
                      {validationErrors.ownerFirstName && (
                        <p className="text-sm text-red-500 mt-2">
                          First name must be at least 2 characters.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="owner_last_name">Last Name * (min. 2 characters)</Label>
                      <Input
                        id="owner_last_name"
                        name="owner_last_name"
                        value={providerData.owner_last_name}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="id_verification_type">ID Verification Type</Label>
                    <Select
                      value={providerData.id_verification.type}
                      onValueChange={(value: 'drivers_license' | 'state_id' | 'passport' | 'passport_card') => {
                        setProviderData(prev => ({
                          ...prev,
                          id_verification: {
                            ...prev.id_verification,
                            type: value
                          }
                        }));
                      }}
                    >
                      <SelectTrigger id="id_verification_type">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                        <SelectItem value="state_id">State ID</SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="passport_card">Passport Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID verification will be implemented in a future update. You'll be notified when this feature is available.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4 mt-6">
                    <h3 className="font-medium mb-4">Terms and Conditions</h3>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="accepts_terms"
                        checked={providerData.accepts_terms}
                        onCheckedChange={(checked) => {
                          handleCheckboxChange('accepts_terms', checked as boolean);
                          if (checked && validationErrors.termsAccepted) {
                            setValidationErrors(prev => ({ ...prev, termsAccepted: false }));
                          }
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="accepts_terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I accept the Terms and Conditions *
                        </label>
                        <p className="text-sm text-muted-foreground">
                          By checking this box, I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. This is required to proceed.
                        </p>
                      </div>
                    </div>
                    {validationErrors.termsAccepted && (
                      <p className="text-sm text-red-500 mt-4">
                        You must accept the Terms and Conditions to continue.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Review Your Information</h2>
                
                <div className="space-y-6">
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="font-medium">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Business Name</p>
                        <p>{providerData.business_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Business Type</p>
                        <p>{providerData.business_type}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p>{providerData.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Year Established</p>
                        <p>{providerData.year_established}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <p>{providerData.website || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="font-medium">Payment Methods</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Methods Accepted</p>
                        {providerData.payment_methods.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {providerData.payment_methods.map((method, index) => (
                              <Badge key={index} variant="secondary">{method}</Badge>
                            ))}
                          </div>
                        ) : (
                          <p>No payment methods specified</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="font-medium">Business Hours</h3>
                    <div className="space-y-2">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const dayData = providerData.business_hours[day as keyof typeof providerData.business_hours];
                        return (
                          <div key={day} className="flex justify-between">
                            <p className="capitalize">{day}</p>
                            <p>
                              {dayData.closed ? 'Closed' : `${dayData.open} - ${dayData.close}`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="font-medium">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Business Email</p>
                        <p>{providerData.business_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Business Phone</p>
                        <p>{providerData.business_phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p>
                          {[
                            providerData.address.street,
                            providerData.address.city,
                            providerData.address.state,
                            providerData.address.zip,
                            providerData.address.country
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="font-medium">Business Ownership</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Owner First Name</p>
                        <p>{providerData.owner_first_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Owner Last Name</p>
                        <p>{providerData.owner_last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ID Verification Type</p>
                        <p>{providerData.id_verification.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="font-medium">Business Verification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Business License Number</p>
                        <p>{providerData.business_license || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tax ID</p>
                        <p>{providerData.tax_id || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">What happens next?</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your application will be reviewed by our team. This process typically takes 1-3 business days.
                          You'll receive an email notification once your provider account is approved.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-6">
            {currentStep !== 'business-info' ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/become-a-provider')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            
            {currentStep !== 'review' ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!validateStep() || isSubmitting}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    Submit Application
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
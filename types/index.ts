export interface Provider {
  id: string;
  // Business Information
  business_name: string;
  business_type: string;
  description: string;
  year_established: string;
  website?: string;
  logo_url?: string;
  cover_photo_url?: string;
  payment_methods: string[];
  business_hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  
  // Business Contact Information
  business_email: string;
  business_phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  
  // Business Verification
  business_license?: string;
  tax_id?: string;
  
  // Business Ownership
  owner_first_name: string;
  owner_last_name: string;
  id_verification?: {
    type: 'drivers_license' | 'state_id' | 'passport' | 'passport_card';
    verified: boolean;
    verification_date?: string;
  };
  
  // Status and Metadata
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  user_id: string;
  created_at: any;
  updated_at: any;
  
  // Legacy fields (keeping for compatibility)
  category?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  image?: string;
  verified?: boolean;
  vettedPro?: boolean;
  hourlyRate?: number;
  availability?: string[];
  services?: string[];
  about?: string;
  verifications?: {
    idVerified: boolean;
    businessLicense: boolean;
    insurance: boolean;
    backgroundCheck: boolean;
  };
  gallery?: string[];
  responseTime?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: string[];
  providerCount: number;
}

export interface SearchFilters {
  categories: string[];
  priceRange: [number, number];
  rating: number;
  availability: string[];
  verifiedOnly: boolean;
}

export interface Service {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  tags: string[];
  images: string[];
  created_at: any;
  updated_at: any;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  type: 'retail' | 'wholesale';
  price: number;
  images: string[];
  created_at: any;
  updated_at: any;
  status: 'active' | 'inactive';
}
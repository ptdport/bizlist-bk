"use client";

import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserProvider';
import { useProfile } from '@/components/auth/ProfileContext';
import { useAuthModal } from '@/components/auth/AuthModalContext';
import Link from 'next/link';
import Head from 'next/head';

export default function BecomeProviderPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { profile } = useProfile();
  const { openModal } = useAuthModal();

  // Check if user already has a provider account
  const hasProviderAccount = profile?.has_provider === true;
  
  // Redirect if user already has a provider account
  useEffect(() => {
    if (user && !loading && hasProviderAccount) {
      router.push('/dashboard/business-profile');
    }
  }, [user, loading, hasProviderAccount, router]);

  const handleApplyClick = () => {
    if (!user) {
      // If not logged in, open sign-in modal
      openModal('signIn');
    } else if (hasProviderAccount) {
      // If already a provider (in any status), go to dashboard
      router.push('/dashboard/business-profile');
    } else {
      // Otherwise, go to provider registration
      router.push('/register-provider');
    }
  };

  return (
    <main className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Grow Your Business with BizList</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of service providers who have expanded their client base and increased their revenue through our platform.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Join BizList?</h2>
            <ul className="space-y-4">
              {[
                'Reach thousands of potential customers actively looking for your services',
                'Build credibility with verified reviews and ratings',
                'Manage your business profile and showcase your best work',
                'Set your own schedule and service areas',
                'Receive job requests directly from interested clients',
                'Free and premium listing options to fit your budget'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button 
              size="lg" 
              className="mt-8"
              onClick={handleApplyClick}
            >
              {hasProviderAccount ? 'View My Listings' : 'Apply Now'}
            </Button>
          </div>
          
          <div className="bg-muted rounded-lg p-6 h-[400px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">Provider Dashboard Preview</p>
              <p className="text-sm">(Image placeholder)</p>
            </div>
          </div>
        </div>
        
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: '1. Create Your Profile',
                description: 'Complete your business profile with services, photos, and business details.'
              },
              {
                title: '2. Get Verified',
                description: 'Our team reviews your application to ensure quality standards.'
              },
              {
                title: '3. Start Getting Clients',
                description: 'Receive requests and connect with clients looking for your services.'
              }
            ].map((step, index) => (
              <div key={index} className="bg-card rounded-lg p-6 text-center shadow-sm border border-border/50">
                <h3 className="text-xl font-semibold mb-3 text-primary">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-primary/5 rounded-lg p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our network of trusted service providers today and start connecting with new clients.
            </p>
          </div>
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleApplyClick}
            >
              {hasProviderAccount ? 'View My Listings' : 'Apply as a Provider'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
} 
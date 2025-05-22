"use client";
import React, { Suspense } from 'react';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthModal } from '@/components/auth/AuthModalContext';
import Hero from '@/components/home/hero';
import Categories from '@/components/home/categories';
import FeaturedProviders from '@/components/home/featured-providers';
import CallToAction from '@/components/home/call-to-action';
import PopularServices from '@/components/home/popular-services';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openModal } = useAuthModal();

  useEffect(() => {
    const auth = searchParams.get('auth');
    const redirect = searchParams.get('redirect');

    if (auth === 'signin') {
      openModal('signIn');
      // Store the redirect path in sessionStorage
      if (redirect) {
        sessionStorage.setItem('authRedirect', redirect);
      }
    }
  }, [searchParams, openModal]);

  return (
    <main>
      <Hero />
      <PopularServices />
      <Categories />
      <FeaturedProviders />
      <CallToAction />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
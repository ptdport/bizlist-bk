"use client";

import { useState, useEffect } from 'react';
import { ProviderCard } from './provider-card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebaseClient';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

export function ProviderGrid() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async (loadMore = false) => {
    try {
      setLoading(true);
      
      // Build query
      let providerQuery = query(
        collection(db, 'providers'),
        where('status', '==', 'active'),
        orderBy('created_at', 'desc')
      );
      
      // Add pagination
      if (loadMore && lastVisible) {
        providerQuery = query(
          providerQuery,
          startAfter(lastVisible),
          limit(10)
        );
      } else {
        providerQuery = query(
          providerQuery,
          limit(10)
        );
      }
      
      const snapshot = await getDocs(providerQuery);
      
      // Check if we have more results
      setHasMore(snapshot.docs.length === 10);
      
      // Set the last visible document for pagination
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      } else {
        setLastVisible(null);
      }
      
      // Map the documents to our state
      const providerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Update state based on whether we're loading more or not
      setProviders(prev => loadMore ? [...prev, ...providerData] : providerData);
      
      // Set total count (this is just an estimate)
      if (!loadMore) {
        setTotalCount(providerData.length * 10); // Just a placeholder, you'd need a separate count query
      }
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadProviders(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-1">
          Showing verified service providers ready to help with your projects
        </h2>
        <div className="text-muted-foreground text-sm mb-2">
          {loading && providers.length === 0 
            ? 'Loading providers...' 
            : `${totalCount}+ service providers available`}
        </div>
      </div>

      {/* Providers Grid */}
      {loading && providers.length === 0 ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white border border-border/50 rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 flex flex-col items-center md:items-start">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mb-2"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded mb-2"></div>
                </div>
                <div className="flex-1">
                  <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : providers.length > 0 ? (
        <div className="space-y-6">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-border/50 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium mb-2">No providers found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later.
          </p>
        </div>
      )}

      {/* Show more providers button */}
      {hasMore && providers.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Show more providers'}
          </Button>
        </div>
      )}
    </div>
  );
}
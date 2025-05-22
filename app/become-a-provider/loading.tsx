"use client";

import React from "react";
import { Skeleton } from "../../components/ui/skeleton";

export default function BecomeProviderLoading() {
  return (
    <main className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <Skeleton className="h-8 w-2/3 mb-6" />
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                  <Skeleton className="h-6 flex-1" />
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-32 mt-8" />
          </div>
          
          <div className="bg-muted rounded-lg p-6 h-[400px]">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="mb-20">
          <Skeleton className="h-8 w-1/3 mx-auto mb-10" />
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 text-center shadow-sm border border-border/50">
                <Skeleton className="h-6 w-2/3 mx-auto mb-3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-primary/5 rounded-lg p-8 md:p-12">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    </main>
  );
} 
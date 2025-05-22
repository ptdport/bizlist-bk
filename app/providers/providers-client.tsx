"use client";

import ProviderSearch from '@/components/providers/provider-search';
import ProviderFilters from '@/components/providers/provider-filters';
import { ProviderGrid } from '@/components/providers/provider-grid';

export function ProvidersClient() {
  return (
    <>
     
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        <ProviderFilters />
        <div className="lg:col-span-3">
        <div className="mb-8">
        <ProviderSearch/>
        </div>
          <ProviderGrid />
        </div>
      </div>
    </>
  );
} 
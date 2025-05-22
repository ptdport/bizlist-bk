"use client";

import React from "react";
import { Skeleton } from "../ui/skeleton";

export function HeaderUserMenuLoading() {
  return (
    <div className="flex items-center gap-2">
      {/* Notifications Button Skeleton */}
      <Skeleton className="h-10 w-10 rounded-full" />
      
      {/* Messages Button Skeleton */}
      <Skeleton className="h-10 w-10 rounded-full" />
      
      {/* User Avatar Skeleton */}
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
} 
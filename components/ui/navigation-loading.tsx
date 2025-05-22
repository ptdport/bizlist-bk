"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "../../lib/utils";

export function NavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reset loading state when pathname or search params change
    setIsLoading(true);
    setLoadingProgress(0);

    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Complete loading after a short delay
    const timeout = setTimeout(() => {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 200);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <div 
        className={cn(
          "h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-200 ease-out",
          loadingProgress === 100 ? "opacity-0" : "opacity-100"
        )}
        style={{ 
          width: `${loadingProgress}%`,
          transition: "width 100ms ease-out, opacity 200ms ease-out",
          boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)"
        }}
      />
    </div>
  );
} 
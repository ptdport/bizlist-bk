"use client";

import React from 'react';

interface AuthVerifyingProps {
  message?: string;
  className?: string;
}

export default function AuthVerifying({ 
  message = "Verifying access...",
  className = ""
}: AuthVerifyingProps) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gray-50 ${className}`}>
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/50 rounded-full border-b-transparent animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">B</span>
        </div>
      </div>
      <p className="mt-6 text-lg font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
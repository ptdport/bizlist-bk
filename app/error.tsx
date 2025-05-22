"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-md w-full text-center space-y-8">
        {/* SVG Illustration */}
        <div className="w-full max-w-sm mx-auto mb-8">
          <svg
            viewBox="0 0 800 600"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            {/* Background elements */}
            <circle cx="400" cy="300" r="200" fill="#f3f4f6" opacity="0.5" />
            <circle cx="500" cy="150" r="50" fill="#e5e7eb" opacity="0.7" />
            <circle cx="250" cy="400" r="70" fill="#e5e7eb" opacity="0.7" />
            
            {/* Warning sign */}
            <path
              d="M400,150 L550,400 L250,400 Z"
              fill="#f59e0b"
              opacity="0.9"
            />
            <text
              x="400"
              y="350"
              fontFamily="sans-serif"
              fontSize="120"
              fontWeight="bold"
              textAnchor="middle"
              fill="white"
            >
              !
            </text>
            
            {/* Character */}
            <g transform="translate(400, 450)">
              {/* Face */}
              <circle cx="0" cy="0" r="40" fill="#6366f1" />
              
              {/* Eyes */}
              <circle cx="-15" cy="-10" r="5" fill="white" />
              <circle cx="15" cy="-10" r="5" fill="white" />
              
              {/* Sad mouth */}
              <path
                d="M-15,15 Q0,5 15,15"
                stroke="white"
                strokeWidth="3"
                fill="transparent"
              />
            </g>
            
            {/* Decorative elements */}
            <path
              d="M100,500 L150,450 L200,500 L250,450 L300,500 L350,450 L400,500 L450,450 L500,500 L550,450 L600,500 L650,450 L700,500"
              stroke="#e5e7eb"
              strokeWidth="5"
              fill="none"
            />
          </svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Something Went Wrong</h1>
        
        <p className="text-lg text-muted-foreground mt-4 mb-8">
          We're sorry, but we encountered an unexpected error.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button
            variant="default"
            size="lg"
            className="flex items-center gap-2"
            onClick={() => reset()}
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            className="flex items-center gap-2"
            asChild
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="mt-12 text-muted-foreground">
          <p>
            If the problem persists, please{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
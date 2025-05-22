"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

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
            
            {/* 404 Text */}
            <text
              x="400"
              y="300"
              fontFamily="sans-serif"
              fontSize="180"
              fontWeight="bold"
              textAnchor="middle"
              fill="#6366f1"
              opacity="0.9"
            >
              404
            </text>
            
            {/* Character */}
            <g transform="translate(350, 350)">
              {/* Body */}
              <ellipse cx="0" cy="0" rx="40" ry="60" fill="#6366f1" />
              
              {/* Head */}
              <circle cx="0" cy="-80" r="35" fill="#6366f1" />
              
              {/* Eyes */}
              <circle cx="-12" cy="-85" r="5" fill="white" />
              <circle cx="12" cy="-85" r="5" fill="white" />
              
              {/* Confused expression */}
              <path
                d="M-15,-70 Q0,-60 15,-70"
                stroke="white"
                strokeWidth="3"
                fill="transparent"
              />
              
              {/* Question mark */}
              <text
                x="60"
                y="-60"
                fontFamily="sans-serif"
                fontSize="80"
                fontWeight="bold"
                fill="#6366f1"
                opacity="0.7"
              >
                ?
              </text>
              
              {/* Arms */}
              <path
                d="M-40,-20 L-80,20"
                stroke="#6366f1"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M40,-20 L80,20"
                stroke="#6366f1"
                strokeWidth="10"
                strokeLinecap="round"
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
        
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Page Not Found</h1>
        
        <p className="text-lg text-muted-foreground mt-4 mb-8">
          Oops! The page you're looking for seems to have wandered off.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button
            variant="default"
            size="lg"
            className="flex items-center gap-2"
            asChild
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            className="flex items-center gap-2"
            asChild
          >
            <Link href="/search">
              <Search className="h-4 w-4" />
              Search
            </Link>
          </Button>
        </div>
        
        <div className="mt-12 text-muted-foreground">
          <p>
            If you believe this is an error, please{" "}
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
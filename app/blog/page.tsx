"use client";
import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, User } from '@/lib/icons';
import { Button } from '@/components/ui/button';

// Sample blog post data
const blogPosts = [
  {
    id: '1',
    title: '10 Questions to Ask Before Hiring a Home Contractor',
    excerpt: 'Finding the right contractor for your home improvement project can be challenging. Here are essential questions to ask before making your decision.',
    author: 'Sarah Johnson',
    date: 'May 15, 2023',
    readTime: '7 min read',
    category: 'Home Improvement'
  },
  {
    id: '2',
    title: 'How to Choose the Best Cleaning Service for Your Home',
    excerpt: 'With so many cleaning services available, finding the right fit for your home can be overwhelming. Here\'s a comprehensive guide to help you decide.',
    author: 'Michael Chen',
    date: 'April 22, 2023',
    readTime: '5 min read',
    category: 'Cleaning'
  },
  {
    id: '3',
    title: 'Starting a Small Business: Essential Services You\'ll Need',
    excerpt: 'Launching a small business requires various professional services. Learn which ones are critical for your success and how to find reliable providers.',
    author: 'Jessica Williams',
    date: 'March 10, 2023',
    readTime: '8 min read',
    category: 'Business'
  },
  {
    id: '4',
    title: 'The Ultimate Guide to Event Planning Services',
    excerpt: 'Planning a major event? Discover how professional event planning services can save you time, reduce stress, and create memorable experiences.',
    author: 'David Rodriguez',
    date: 'February 28, 2023',
    readTime: '6 min read',
    category: 'Events'
  }
];

export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">BizList Blog</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tips, guides, and insights to help you find the best service providers and make informed decisions for your projects.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <article key={post.id} className="bg-card rounded-lg overflow-hidden shadow-sm border border-border/50 transition-all hover:shadow-md">
            <div className="relative h-48 w-full bg-muted">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <span className="text-lg font-medium text-muted-foreground">{post.category}</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <span className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1" weight="bold" />
                  {post.author}
                </span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" weight="bold" />
                  {post.date}
                </span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" weight="bold" />
                  {post.readTime}
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-3">
                <Link href={`/blog/${post.id}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </h2>
              <p className="text-muted-foreground mb-4">{post.excerpt}</p>
              <Link href={`/blog/${post.id}`} passHref>
                <Button variant="link" className="pl-0 text-primary">
                  Read More
                </Button>
              </Link>
            </div>
          </article>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <Button variant="outline">Load More Articles</Button>
      </div>
    </main>
  );
} 
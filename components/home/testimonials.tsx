"use client";

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type Testimonial = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  service: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Homeowner',
    avatar: 'https://images.pexels.com/photos/773371/pexels-photo-773371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    content: 'I needed urgent plumbing help and found Premier Plumbing Solutions through BizList. They responded within minutes, came same day, and fixed the issue for a reasonable price. Highly recommend!',
    rating: 5,
    service: 'Plumbing Services',
  },
  {
    id: 2,
    name: 'Mark Thompson',
    role: 'Small Business Owner',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    content: 'Found an amazing web developer through BizList who completely transformed our outdated website. The process was smooth and the results exceeded our expectations. Our online sales have increased by 40%!',
    rating: 5,
    service: 'Web Development',
  },
  {
    id: 3,
    name: 'Emily Chen',
    role: 'Apartment Renter',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    content: 'Used BizList to find a cleaning service for my move-out. Sparkling Clean Services did an amazing job and I got my full deposit back! The booking process was simple and their rates were better than competitors.',
    rating: 4,
    service: 'Cleaning Services',
  },
  {
    id: 4,
    name: 'David Rodriguez',
    role: 'Family Man',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    content: 'We hired Landscape Masters for our yard renovation and couldn\'t be happier. They came on time, stayed on budget, and created the perfect outdoor space for our family to enjoy. The process from quote to completion was seamless.',
    rating: 5,
    service: 'Landscaping',
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real experiences from customers who found their perfect service providers through BizList
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden relative rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="w-full flex-shrink-0 p-6 md:p-10"
                >
                  <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <div className="flex items-center mb-6">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <div className="flex mt-1">
                          {Array(5).fill(null).map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "w-4 h-4", 
                                i < testimonial.rating 
                                  ? "text-yellow-400 fill-yellow-400" 
                                  : "text-gray-300"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <blockquote className="mb-4 italic text-lg">"{testimonial.content}"</blockquote>
                    <p className="text-sm font-medium text-primary">{testimonial.service}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-3 shadow-lg focus:outline-none hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white rounded-full p-3 shadow-lg focus:outline-none hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  index === activeIndex ? "bg-primary" : "bg-gray-300"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
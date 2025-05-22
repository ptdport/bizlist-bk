"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlass, ChatCircle, UserCheck, CheckCircle } from '@/lib/icons';

const steps = [
  {
    id: 1,
    title: 'Find Service Providers',
    description: 'Search and browse through verified service providers in your area by category, ratings, and reviews.',
    icon: MagnifyingGlass,
    color: 'bg-blue-500',
  },
  {
    id: 2,
    title: 'Request Quotes',
    description: 'Describe your project needs and receive personalized quotes from interested service providers.',
    icon: ChatCircle,
    color: 'bg-green-500',
  },
  {
    id: 3,
    title: 'Compare and Choose',
    description: 'Review quotes, profiles, and past work to select the best service provider for your needs.',
    icon: UserCheck,
    color: 'bg-purple-500',
  },
  {
    id: 4,
    title: 'Complete Your Project',
    description: 'Hire with confidence, communicate directly with your provider, and get your project done right.',
    icon: CheckCircle,
    color: 'bg-amber-500',
  },
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How BizList Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it simple to find and hire the right professionals for your project in just a few easy steps
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="w-full lg:w-1/2">
            <div className="relative">
              {/* Line connecting the steps */}
              <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200 hidden md:block"></div>
              
              <div className="space-y-8">
                {steps.map((step) => (
                  <div 
                    key={step.id}
                    className={`relative flex items-start cursor-pointer transition-all duration-300 p-4 rounded-lg ${activeStep === step.id ? 'bg-white shadow-md' : 'hover:bg-white/50'}`}
                    onClick={() => setActiveStep(step.id)}
                  >
                    <div className={`${step.color} z-10 flex items-center justify-center w-12 h-12 rounded-full shrink-0`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="mt-1 text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="aspect-video relative">
              {steps.map((step) => (
                activeStep === step.id && (
                  <div key={step.id} className="p-6 h-full flex flex-col justify-center items-center text-center">
                    <div className={`${step.color} w-20 h-20 rounded-full flex items-center justify-center mb-6`}>
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-lg text-muted-foreground max-w-md">{step.description}</p>
                    
                    <div className="mt-8 flex justify-center space-x-2">
                      {steps.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setActiveStep(s.id)}
                          className={`w-3 h-3 rounded-full transition-all ${activeStep === s.id ? step.color : 'bg-gray-300'}`}
                          aria-label={`Go to step ${s.id}`}
                        />
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
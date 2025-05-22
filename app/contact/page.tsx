import React from 'react';
import { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const metadata: Metadata = {
  title: 'Contact Us | BizList',
  description: 'Get in touch with the BizList team for any questions or support needs',
};

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Contact Us</h1>
      
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6">
            Have a question or need assistance? Fill out the form and our team will get back to you as soon as possible.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <span>support@bizlist.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <span>(555) 123-4567</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span>123 Business Avenue, Suite 200<br />San Francisco, CA 94107</span>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3">Business Hours</h3>
            <p className="text-sm text-muted-foreground">
              Monday - Friday: 9:00 AM - 6:00 PM<br />
              Saturday: 10:00 AM - 4:00 PM<br />
              Sunday: Closed
            </p>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <Input id="email" type="email" placeholder="Your email" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
              <Input id="subject" placeholder="Subject" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
              <Textarea id="message" placeholder="Your message" rows={5} />
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </main>
  );
} 
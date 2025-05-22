import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <span className="text-slate-900 font-bold text-xl">B</span>
              </div>
              <span className="text-xl font-bold">BizList</span>
            </div>
            <p className="text-slate-400 mb-6">
              Connecting you with trusted service providers in your area. Find the perfect professional for any job.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/categories" className="text-slate-400 hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/providers" className="text-slate-400 hover:text-white transition-colors">Find Providers</Link></li>
              <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-slate-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/blog" className="text-slate-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/become-a-provider" className="text-slate-400 hover:text-white transition-colors">Become a Provider</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Categories</h3>
            <ul className="space-y-3">
              <li><Link href="/providers?category=home-improvement" className="text-slate-400 hover:text-white transition-colors">Home Improvement</Link></li>
              <li><Link href="/providers?category=cleaning" className="text-slate-400 hover:text-white transition-colors">Cleaning</Link></li>
              <li><Link href="/providers?category=personal" className="text-slate-400 hover:text-white transition-colors">Personal Services</Link></li>
              <li><Link href="/providers?category=events" className="text-slate-400 hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/providers?category=lessons" className="text-slate-400 hover:text-white transition-colors">Lessons</Link></li>
              <li><Link href="/providers?category=business" className="text-slate-400 hover:text-white transition-colors">Business Services</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-slate-400 shrink-0 mt-1" />
                <p className="text-slate-400">123 Business Avenue, San Francisco, CA 94107</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-slate-400" />
                <p className="text-slate-400">(555) 123-4567</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-slate-400" />
                <p className="text-slate-400">contact@bizlist.com</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="rounded-r-none bg-slate-800 border-slate-700 text-white"
                />
                <Button className="rounded-l-none">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">© {currentYear} BizList. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
            <Link href="/cookies" className="text-slate-400 hover:text-white transition-colors text-sm">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
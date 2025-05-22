import Link from 'next/link';
import { ArrowRight, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CallToAction = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find the Perfect Service Provider?</h2>
              <p className="text-primary-foreground/90 mb-8">
                Join thousands of satisfied customers who've found trusted professionals for their projects through BizList. Start exploring our network of qualified service providers today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link href="/providers">
                    <Search className="w-5 h-5 mr-2" />
                    Find Providers
                  </Link>
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/signup">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Join BizList
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Are you a service provider?</h3>
              <p className="mb-6">
                Join our network of professionals and connect with customers looking for your services. Grow your business with BizList.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Create a professional profile to showcase your work',
                  'Receive job requests directly from interested customers',
                  'Build your reputation with verified reviews',
                  'Set your own pricing and availability',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button 
                size="lg" 
                className="w-full"
                variant="secondary"
                asChild
              >
                <Link href="/become-a-provider">
                  List Your Business
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
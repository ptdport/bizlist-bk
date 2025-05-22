"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Star, MapPin, Clock, Heart, PaperPlaneRight, CheckCircle, CaretDown, X } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Provider } from '@/types';

interface ProviderProfileClientProps {
  provider: Provider;
}

const businessHours = [
  { days: 'Mon - Fri', hours: '8:00 am - 5:00 pm' },
  { days: 'Sat - Sun', hours: '8:00 am - 5:00 pm' },
];

const inHouseServices = [
  {
    title: 'Mobile Development',
    description:
      'We offer custom mobile app development services for ios/android, with proficiency in both cross platform and native app development. Ex. Business app, Fintech, iBeacon, Fitness, News, Social Networking, Ordering, Booking, eCommerce, eLearning, Geo-location, Streaming & Utility mobile apps.',
  },
  { title: 'Mobile Development', description: '...' },
  { title: 'Mobile Development', description: '...' },
];

const paymentMethods =
  'This pro accepts payments via Apple Pay, Credit card, PayPal, Stripe, Venmo, and Zelle.';
const companyInfo = '11-50 workers\nSince 2019';

// Define a type for project items
interface ProjectItem {
  title: string;
  image: string; // main image (for grid)
  images?: string[]; // all images for modal
}

export function ProviderProfileClient({ provider }: ProviderProfileClientProps) {
  const [selectedService, setSelectedService] = useState('');
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState<number | null>(0);
  const [showProjectsOverlay, setShowProjectsOverlay] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [shouldAnimateOverlay, setShouldAnimateOverlay] = useState(false);

  // Products overlay/modal state
  const [showProductsOverlay, setShowProductsOverlay] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProjectItem | null>(null);
  const [shouldAnimateProductsOverlay, setShouldAnimateProductsOverlay] = useState(false);

  // When overlays are opened, set shouldAnimate to true
  useEffect(() => {
    if (showProjectsOverlay) setShouldAnimateOverlay(true);
  }, [showProjectsOverlay]);
  useEffect(() => {
    if (showProductsOverlay) setShouldAnimateProductsOverlay(true);
  }, [showProductsOverlay]);

  // Prevent background scroll when any overlay or modal is open
  useEffect(() => {
    if (showProjectsOverlay || selectedProject || showProductsOverlay || selectedProduct) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showProjectsOverlay, selectedProject, showProductsOverlay, selectedProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle message submission
    console.log({ selectedService, message });
  };

  const projects: ProjectItem[] = [
    {
      title: 'Home Cleaning',
      image: 'https://images.pexels.com/photos/4239036/pexels-photo-4239036.jpeg?auto=compress&w=400&h=400&fit=crop',
      images: [
        'https://images.pexels.com/photos/4239036/pexels-photo-4239036.jpeg?auto=compress&w=600&h=400&fit=crop',
        'https://images.pexels.com/photos/750483/pexels-photo-750483.jpeg?auto=compress&w=600&h=400&fit=crop',
      ],
    },
    {
      title: 'Residential Cleaning Solutions',
      image: 'https://images.pexels.com/photos/4107284/pexels-photo-4107284.jpeg?auto=compress&w=400&h=400&fit=crop',
      images: [
        'https://images.pexels.com/photos/4107284/pexels-photo-4107284.jpeg?auto=compress&w=600&h=400&fit=crop',
        'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&w=600&h=400&fit=crop',
      ],
    },
    { title: 'Commercial Cleaning Services', image: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&w=400&h=400&fit=crop' },
    { title: 'Deep Cleaning and Sanitization', image: 'https://images.pexels.com/photos/6197120/pexels-photo-6197120.jpeg?auto=compress&w=400&h=400&fit=crop' },
    { title: 'Office Cleaning', image: 'https://images.pexels.com/photos/4239036/pexels-photo-4239036.jpeg?auto=compress&w=400&h=400&fit=crop' },
    { title: 'Carpet Cleaning', image: 'https://images.pexels.com/photos/4239036/pexels-photo-4239036.jpeg?auto=compress&w=400&h=400&fit=crop' },
    { title: 'Window Cleaning', image: 'https://images.pexels.com/photos/4239036/pexels-photo-4239036.jpeg?auto=compress&w=400&h=400&fit=crop' },
    { title: 'Post-Construction Cleaning', image: 'https://images.pexels.com/photos/4239036/pexels-photo-4239036.jpeg?auto=compress&w=400&h=400&fit=crop' },
    { title: 'Deep Cleaning', image: 'https://images.pexels.com/photos/4239036/pexels-photo-4239036.jpeg?auto=compress&w=400&h=400&fit=crop' },
    { title: 'Eco-Friendly Cleaning', image: 'https://images.pexels.com/photos/4239036/pexels-photo-4239036.jpeg?auto=compress&w=400&h=400&fit=crop' },
    { title: 'Move-In/Move-Out Cleaning', image: 'https://images.pexels.com/photos/4239036/pexels-photo-4239036.jpeg?auto=compress&w=400&h=400&fit=crop' },
  ];

  const products = [
    { title: 'Cleaning fluids', image: 'https://images.pexels.com/photos/5217894/pexels-photo-5217894.jpeg?auto=compress&w=400&h=400&fit=crop' },
    { title: 'Cleaning sponges', image: 'https://images.pexels.com/photos/4239095/pexels-photo-4239095.jpeg?auto=compress&w=400&h=400&fit=crop' },
    { title: 'Home Cleaning', image: 'https://images.pexels.com/photos/4107284/pexels-photo-4107284.jpeg?auto=compress&w=400&h=400&fit=crop' },
    { title: 'Home Cleaning', image: 'https://images.pexels.com/photos/4239036/pexels-photo-4239036.jpeg?auto=compress&w=400&h=400&fit=crop' },
  ];

  // Overlay component
  function ProjectsOverlay({ projects, onClose, setSelectedProject, shouldAnimate, setShouldAnimate }: {
    projects: ProjectItem[];
    onClose: () => void;
    setSelectedProject: (p: ProjectItem | null) => void;
    shouldAnimate: boolean;
    setShouldAnimate: (v: boolean) => void;
  }) {
    const handleAnimationEnd = () => setShouldAnimate(false);
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop with fade-in */}
        <div
          className="fixed inset-0 bg-black/30 transition-opacity duration-300 ease-in-out opacity-100"
          style={{ transitionProperty: 'opacity' }}
          onClick={onClose}
        />
        {/* Slide-in panel with transition (animate only on mount) */}
        <div
          className={`relative ml-auto w-full max-w-xl h-full bg-white shadow-xl transition-transform duration-300 ease-in-out transform translate-x-0 flex flex-col ${shouldAnimate ? 'animate-slidein' : ''}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Projects</h2>
            <button onClick={onClose} aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="overflow-y-auto p-6 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {projects.map((project, i) => (
                <Card key={i} className="overflow-hidden cursor-pointer" onClick={() => setSelectedProject(project)}>
                  <div className="relative aspect-square w-full h-40">
                    <Image src={project.image} alt={project.title} fill className="object-cover" />
                  </div>
                  <div className="p-3 text-base">{project.title}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes slidein {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slidein {
            animation: slidein 0.3s cubic-bezier(0.4,0,0.2,1);
          }
        `}</style>
      </div>
    );
  }

  // Project modal
  function ProjectModal({ project, onClose }: { project: ProjectItem; onClose: () => void }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Modal backdrop */}
        <div className="fixed inset-0 bg-black/40 transition-opacity duration-300" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 animate-fadein">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <button onClick={onClose} aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-8 max-h-[60vh] overflow-y-auto">
            {(project.images || [project.image]).map((img, idx) => (
              <div key={idx} className="w-full flex justify-center">
                <img src={img} alt={project.title} className="rounded max-h-80 object-contain" />
              </div>
            ))}
          </div>
        </div>
        <style jsx global>{`
          @keyframes fadein {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadein {
            animation: fadein 0.2s cubic-bezier(0.4,0,0.2,1);
          }
        `}</style>
      </div>
    );
  }

  function ProductsOverlay({ products, onClose, setSelectedProduct, shouldAnimate, setShouldAnimate }: {
    products: ProjectItem[];
    onClose: () => void;
    setSelectedProduct: (p: ProjectItem | null) => void;
    shouldAnimate: boolean;
    setShouldAnimate: (v: boolean) => void;
  }) {
    const handleAnimationEnd = () => setShouldAnimate(false);
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-black/30 transition-opacity duration-300 ease-in-out opacity-100"
          style={{ transitionProperty: 'opacity' }}
          onClick={onClose}
        />
        <div
          className={`relative ml-auto w-full max-w-xl h-full bg-white shadow-xl transition-transform duration-300 ease-in-out transform translate-x-0 flex flex-col ${shouldAnimate ? 'animate-slidein' : ''}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Products</h2>
            <button onClick={onClose} aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="overflow-y-auto p-6 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((product, i) => (
                <Card key={i} className="overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <div className="relative aspect-square w-full h-40">
                    <Image src={product.image} alt={product.title} fill className="object-cover" />
                  </div>
                  <div className="p-3 text-base">{product.title}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes slidein {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slidein {
            animation: slidein 0.3s cubic-bezier(0.4,0,0.2,1);
          }
        `}</style>
      </div>
    );
  }

  function ProductModal({ product, onClose }: { product: ProjectItem; onClose: () => void }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40 transition-opacity duration-300" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 animate-fadein">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{product.title}</h2>
            <button onClick={onClose} aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-8 max-h-[60vh] overflow-y-auto">
            {(product.images || [product.image]).map((img, idx) => (
              <div key={idx} className="w-full flex justify-center">
                <img src={img} alt={product.title} className="rounded max-h-80 object-contain" />
              </div>
            ))}
          </div>
        </div>
        <style jsx global>{`
          @keyframes fadein {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadein {
            animation: fadein 0.2s cubic-bezier(0.4,0,0.2,1);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Profile Card */}
        <Card className="p-6 flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2">
              <Image src={provider.image} alt={provider.name} fill className="object-cover" sizes="96px" />
            </div>
            {provider.vettedPro && (
              <Badge className="bg-yellow-400 text-black font-semibold px-3 py-1 rounded">Vetted Pro</Badge>
            )}
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{provider.name}</span>
                <span className="flex items-center text-sm font-medium ml-2">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" weight="fill" />
                  {provider.rating}
                  <span className="text-muted-foreground ml-1">({provider.reviewCount} reviews)</span>
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" aria-label="Favorite">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Share">
                  <PaperPlaneRight className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <div className="text-muted-foreground mt-1 mb-2 text-sm">
              Female-led marketing agency focused on growing sales and driving success on Amazon
            </div>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm mt-1">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" weight="bold" />
                <span className="font-medium">Serves Phoenix, AZ</span>
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" weight="bold" />
                <span>Reply in about <span className="font-medium">25min</span></span>
              </span>
            </div>
          </div>
        </Card>

        {/* Business Hours */}
        <Card className="p-6">
          <div className="font-semibold mb-4">Business hours</div>
          <div className="space-y-1">
            {businessHours.map((row, i) => (
              <div key={i} className="flex justify-between">
                <span>{row.days}</span>
                <span className="font-bold">{row.hours}</span>
              </div>
            ))}
          </div>
          <Button variant="link" className="mt-2 px-0">More</Button>
        </Card>

        {/* Overview */}
        <Card className="p-6">
          <div className="font-semibold mb-4">Overview</div>
          <div className="text-muted-foreground">
            With over a decade of experience, our professional cleaning services are dedicated to providing top-notch results. We prioritize the health of your environment by using only eco-friendly products that are safe for your family and pets. Trust us to leave your space sparkling clean and fresh! Our team is trained to tackle even the toughest messes, ensuring every corner of your home or office is spotless.
          </div>
          <Button variant="link" className="mt-2 px-0">Read more</Button>
        </Card>

        {/* In-House Services */}
        <Card className="p-6">
          <div className="font-semibold mb-4">In-House Services</div>
          <div className="divide-y">
            {inHouseServices.map((service, i) => (
              <div key={i}>
                <button
                  className="w-full flex items-center justify-between py-3 text-left font-medium"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  {service.title}
                  <CaretDown className={`w-5 h-5 ml-2 transition-transform ${expanded === i ? 'rotate-180' : ''}`} />
                </button>
                {expanded === i && (
                  <div className="text-muted-foreground pb-3 pl-1 text-sm">{service.description}</div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6">
          <div className="font-semibold mb-4">Payment methods</div>
          <div className="text-muted-foreground text-sm">{paymentMethods}</div>
        </Card>

        {/* Company Information */}
        <Card className="p-6">
          <div className="font-semibold mb-4">Company information</div>
          <div className="text-muted-foreground text-sm whitespace-pre-line">{companyInfo}</div>
        </Card>

        {/* Projects */}
        <div>
          <div className="font-semibold mb-4">Projects</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {projects.slice(0, 4).map((project, i) => (
              <Card key={i} className="overflow-hidden cursor-pointer" onClick={() => setSelectedProject(project)}>
                <div className="relative aspect-square w-full h-32">
                  <Image src={project.image} alt={project.title} fill className="object-cover" />
                </div>
                <div className="p-2 text-sm">{project.title}</div>
              </Card>
            ))}
          </div>
          <Button variant="outline" onClick={() => setShowProjectsOverlay(true)}>View more projects</Button>
        </div>

        {/* Products */}
        <div className="mt-8">
          <div className="font-semibold mb-4">Products</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {products.slice(0, 4).map((product, i) => (
              <Card key={i} className="overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                <div className="relative aspect-square w-full h-32">
                  <Image src={product.image} alt={product.title} fill className="object-cover" />
                </div>
                <div className="p-2 text-sm">{product.title}</div>
              </Card>
            ))}
          </div>
          <Button variant="outline" onClick={() => setShowProductsOverlay(true)}>View more products</Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Verification Card */}
        <Card className="p-6">
          <div className="font-semibold mb-4">Verification</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" weight="bold" />
              Identity
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" weight="bold" />
              Business registration
            </div>
          </div>
        </Card>

        {/* Contact Provider Card */}
        <Card className="p-6">
          <div className="font-semibold mb-4">Contact Provider</div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Service Needed</label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {provider.services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="Describe your project or requirements..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" className="w-full" color="green">
              Send message
            </Button>
          </form>

          <div className="mt-6">
            <div className="font-semibold mb-2">Availability:</div>
            <div className="flex flex-wrap gap-2">
              {provider.availability.map((time) => (
                <Badge key={time} variant="secondary">
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {showProjectsOverlay && (
        <ProjectsOverlay
          projects={projects}
          onClose={() => setShowProjectsOverlay(false)}
          setSelectedProject={setSelectedProject}
          shouldAnimate={shouldAnimateOverlay}
          setShouldAnimate={setShouldAnimateOverlay}
        />
      )}
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
      {showProductsOverlay && (
        <ProductsOverlay
          products={products}
          onClose={() => setShowProductsOverlay(false)}
          setSelectedProduct={setSelectedProduct}
          shouldAnimate={shouldAnimateProductsOverlay}
          setShouldAnimate={setShouldAnimateProductsOverlay}
        />
      )}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
} 
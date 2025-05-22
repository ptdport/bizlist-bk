import Image from 'next/image';
import Link from 'next/link';

const services = [
  {
    title: 'Products',
    description: 'A small description about the service or product',
    image: '/popular-services/products.png',
    bg: 'bg-products',
  },
  {
    title: 'Services',
    description: 'A small description about the service or product',
    image: '/popular-services/services.png',
    bg: 'bg-services',
  },
  {
    title: 'Online',
    description: 'A small description about the service or product',
    image: '/popular-services/online-services.png',
    bg: 'bg-online-services',
  },
  {
    title: 'Influencers',
    description: 'A small description about the service or product',
    image: '/popular-services/influencer.png',
    bg: 'bg-influencers',
  },
];

export default function PopularServices() {
  return (
    <section className="w-full py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">Popular Services</h2>
        <p className="text-xl text-foreground font-medium mb-10">Connect with skilled professionals for your most common home projects</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {services.map((service) => (
            <div key={service.title} className="rounded-xl border border-border bg-white shadow-sm p-6 flex flex-col items-start transition hover:shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-foreground">{service.title}</h3>
              <p className="text-muted-foreground mb-4 text-sm">{service.description}</p>
              <div className={`w-full flex-1 flex items-center justify-center ${service.bg} rounded-lg mt-auto mb-2 min-h-[220px]`}>
                <Image src={service.image} alt={service.title} width={180} height={180} className="object-contain" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Link href="#" className="text-primary font-semibold flex items-center gap-2 text-lg hover:underline">
            Learn more about what we offer
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
} 
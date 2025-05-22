import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Category = {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
};

const categories: Category[] = [
  {
    id: 'home-improvement',
    name: 'Home Improvement',
    icon: 'https://images.pexels.com/photos/3990359/pexels-photo-3990359.jpeg?auto=compress&cs=tinysrgb&w=600',
    count: 1240,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: 'https://images.pexels.com/photos/4107112/pexels-photo-4107112.jpeg?auto=compress&cs=tinysrgb&w=600',
    count: 853,
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  {
    id: 'personal',
    name: 'Personal Services',
    icon: 'https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=600',
    count: 732,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  {
    id: 'events',
    name: 'Events',
    icon: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=600',
    count: 428,
    color: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  },
  {
    id: 'lessons',
    name: 'Lessons',
    icon: 'https://images.pexels.com/photos/8926556/pexels-photo-8926556.jpeg?auto=compress&cs=tinysrgb&w=600',
    count: 512,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    id: 'business',
    name: 'Business Services',
    icon: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=600',
    count: 672,
    color: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=600',
    count: 389,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    id: 'tech',
    name: 'Tech Services',
    icon: 'https://images.pexels.com/photos/6192595/pexels-photo-6192595.jpeg?auto=compress&cs=tinysrgb&w=600',
    count: 517,
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
];

const Categories = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the perfect service provider for your specific needs from our extensive range of categories
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              href={`/providers?category=${category.id}`} 
              key={category.id}
              className="group relative overflow-hidden rounded-xl transition-all hover:shadow-lg"
            >
              <div className="aspect-square relative">
                <Image 
                  src={category.icon} 
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <span className="text-sm text-white/80">{category.count} providers</span>
                </div>
              </div>
              <div className={cn(
                'absolute top-4 right-4 px-2 py-1 text-xs rounded-full border',
                category.color
              )}>
                {category.count}+ providers
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            href="/categories"
            className="inline-flex items-center font-medium text-primary hover:underline"
          >
            View all categories
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
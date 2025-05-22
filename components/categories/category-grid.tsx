import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categories = [
  {
    id: 'home-improvement',
    name: 'Home Improvement',
    description: 'Find professionals for repairs, renovations, and home maintenance services',
    icon: 'https://images.pexels.com/photos/3990359/pexels-photo-3990359.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    subcategories: ['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting', 'Roofing'],
    providerCount: 1240,
  },
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    description: 'Professional cleaning services for homes, offices, and specialized cleaning needs',
    icon: 'https://images.pexels.com/photos/4107112/pexels-photo-4107112.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    subcategories: ['House Cleaning', 'Office Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Deep Cleaning'],
    providerCount: 853,
  },
  {
    id: 'personal',
    name: 'Personal Services',
    description: 'Services for personal care, wellness, and lifestyle needs',
    icon: 'https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    subcategories: ['Personal Training', 'Massage Therapy', 'Hair & Beauty', 'Life Coaching', 'Personal Shopping'],
    providerCount: 732,
  },
  {
    id: 'events',
    name: 'Event Services',
    description: 'Professional services for planning and executing memorable events',
    icon: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    subcategories: ['Event Planning', 'Catering', 'Photography', 'Entertainment', 'Decor'],
    providerCount: 428,
  },
  {
    id: 'lessons',
    name: 'Lessons & Training',
    description: 'Expert instructors for various skills and educational needs',
    icon: 'https://images.pexels.com/photos/8926556/pexels-photo-8926556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    subcategories: ['Music Lessons', 'Language Training', 'Academic Tutoring', 'Sports Coaching', 'Art Classes'],
    providerCount: 512,
  },
  {
    id: 'business',
    name: 'Business Services',
    description: 'Professional services to help your business grow and succeed',
    icon: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    subcategories: ['Consulting', 'Marketing', 'Accounting', 'Legal Services', 'IT Support'],
    providerCount: 672,
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Services focused on health, fitness, and overall wellbeing',
    icon: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    subcategories: ['Fitness Training', 'Nutrition', 'Mental Health', 'Physical Therapy', 'Alternative Medicine'],
    providerCount: 389,
  },
  {
    id: 'tech',
    name: 'Tech Services',
    description: 'Technical solutions and support for all your digital needs',
    icon: 'https://images.pexels.com/photos/6192595/pexels-photo-6192595.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    subcategories: ['Web Development', 'IT Support', 'Digital Marketing', 'App Development', 'Cybersecurity'],
    providerCount: 517,
  },
];

const CategoryGrid = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/providers?category=${category.id}`}
              className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow block"
            >
              <div className="relative h-48">
                <Image
                  src={category.icon}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white mb-1">{category.name}</h2>
                  <p className="text-white/80 text-sm">{category.providerCount}+ providers</p>
                </div>
              </div>

              <div className="p-6">
                <p className="text-muted-foreground mb-4">{category.description}</p>

                <div className="mb-6">
                  <ul className="space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <li key={subcategory}>
                        <span className="text-base text-muted-foreground block text-left">
                          {subcategory}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;


{/*
<ul className="space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <li key={subcategory}>
                        <Link
                          href={`/providers?category=${category.id}&subcategory=${encodeURIComponent(subcategory)}`}
                          className="text-base text-muted-foreground hover:text-primary transition-colors block text-left"
                        >
                          {subcategory}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  */}




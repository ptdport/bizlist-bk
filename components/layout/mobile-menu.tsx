"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, ChevronDown, Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { useProfile } from '@/components/auth/ProfileContext';
import { useAuthModal } from '@/components/auth/AuthModalContext';
import { useNotifications } from '@/components/notifications/NotificationsContext';

interface MobileMenuProps {
  navLinks: { href: string; label: string }[];
  onClose: () => void;
}

const MobileMenu = ({ navLinks, onClose }: MobileMenuProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userRole, signOut } = useUser();
  const { profile } = useProfile();
  const { openModal } = useAuthModal();
  const { unreadNotificationsCount, unreadMessagesCount } = useNotifications();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const mainLinks = navLinks.filter(link => !['/categories', '/providers', '/about', '/contact'].includes(link.href));
  const exploreLinks = navLinks.filter(link => ['/categories', '/providers'].includes(link.href));
  const aboutLinks = navLinks.filter(link => ['/about', '/contact'].includes(link.href));

  return (
    <div className="fixed inset-0 z-50 bg-white pt-16 px-4 flex flex-col animate-in slide-in-from-right">
      <div className="relative mt-4 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search services..." 
          className="pl-10 w-full bg-secondary/50 border-none"
        />
      </div>
      <nav className="flex flex-col space-y-4">
        {mainLinks.map((link) => {
          // Skip "Become a Provider" link if user already has a provider account
          if (link.href === '/become-a-provider' && user && profile?.has_provider) {
            return null;
          }
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={onClose}
              className={cn(
                'py-2 px-4 hover:bg-secondary rounded-md transition-colors font-medium',
                pathname === link.href ? 'text-primary bg-secondary' : 'text-foreground/80'
              )}
            >
              {link.label}
            </Link>
          );
        })}
        
        <div className="space-y-2">
          <button
            onClick={() => setIsExploreOpen(!isExploreOpen)}
            className={cn(
              'w-full py-2 px-4 hover:bg-secondary rounded-md transition-colors font-medium flex items-center justify-between',
              (pathname === '/categories' || pathname === '/providers') ? 'text-primary bg-secondary' : 'text-foreground/80'
            )}
          >
            Explore
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              isExploreOpen ? 'rotate-180' : ''
            )} />
          </button>
          
          {isExploreOpen && (
            <div className="pl-4 space-y-2">
              {exploreLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'block py-2 px-4 hover:bg-secondary rounded-md transition-colors font-medium',
                    pathname === link.href ? 'text-primary bg-secondary' : 'text-foreground/80'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setIsAboutOpen(!isAboutOpen)}
            className={cn(
              'w-full py-2 px-4 hover:bg-secondary rounded-md transition-colors font-medium flex items-center justify-between',
              (pathname === '/about' || pathname === '/contact') ? 'text-primary bg-secondary' : 'text-foreground/80'
            )}
          >
            About
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              isAboutOpen ? 'rotate-180' : ''
            )} />
          </button>
          
          {isAboutOpen && (
            <div className="pl-4 space-y-2">
              {aboutLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'block py-2 px-4 hover:bg-secondary rounded-md transition-colors font-medium',
                    pathname === link.href ? 'text-primary bg-secondary' : 'text-foreground/80'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
      <div className="mt-auto mb-8 flex flex-col space-y-3 pt-6">
        {user ? (
          <>
            {/* Notification and Message buttons */}
            <div className="flex gap-2 mb-2">
              <Button 
                variant="outline" 
                className="flex-1 relative" 
                size="lg"
                onClick={() => {
                  router.push('/notifications');
                  onClose();
                }}
              >
                <Bell className="h-5 w-5 mr-2" />
                Notifications
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 relative" 
                size="lg"
                onClick={() => {
                  router.push('/messages');
                  onClose();
                }}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Messages
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => {
                router.push('/profile');
                onClose();
              }}
            >
              View Profile
            </Button>
            
            {(userRole === 'admin' || userRole === 'moderator') && (
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => {
                  router.push('/admin');
                  onClose();
                }}
              >
                Admin Dashboard
              </Button>
            )}
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={async () => {
                await signOut();
                // Redirection is now handled in UserProvider
                onClose();
              }}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => {
                openModal('signIn');
                onClose();
              }}
            >
              Sign In
            </Button>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => {
                openModal('signUp');
                onClose();
              }}
            >
              Sign Up
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, User, ChevronDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LocationAutocomplete, { LocationSuggestion } from '@/components/ui/location-autocomplete';
import { useSearch } from '@/components/search/SearchContext';
import { cn } from '@/lib/utils';
import MobileMenu from './mobile-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthModal } from '@/components/auth/AuthModalContext';
import { useUser } from '@/components/auth/UserProvider';
import { useProfile } from '@/components/auth/ProfileContext';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { MessagesDropdown } from '@/components/notifications/MessagesDropdown';
import { HeaderUserMenuLoading } from "./header-loading";
// ModeSwitcher removed as per requirements

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Use the shared search context instead of local state
  const { 
    searchTerm, 
    setSearchTerm, 
    category, 
    setCategory, 
    location, 
    setLocation, 
    selectedPlace, 
    setSelectedPlace,
    performSearch
  } = useSearch();
  
  const handlePlaceSelect = (place: LocationSuggestion) => {
    setSelectedPlace(place);
  };
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = useAuthModal();
  const { user, userRole, signOut, loading } = useUser();
  const { profile } = useProfile();
  
  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setIsScrolled(heroBottom < 0);
      } else {
        setIsScrolled(window.scrollY > 20);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  interface NavLink {
    href: string;
    label: string;
  }

  const navLinks: NavLink[] = [
    { href: '/become-a-provider', label: 'Become a Provider' }
  ];

  const exploreLinks = [
    { href: '/categories', label: 'Categories' },
    { href: '/providers', label: 'Find Providers' },
  ];

  const aboutLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ];

  const showSearch = pathname !== '/' || isScrolled;

  // Helper to get initials from user profile
  function getInitials() {
    if (profile?.first_name && profile?.last_name) return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    if (profile?.first_name) return profile.first_name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  }

  const handleSignOut = async () => {
    await signOut();
    // Redirection is now handled in UserProvider
  };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm bg-gray-200' : 'bg-gray-200'
    )}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">B</span>
          </div>
          <span className="text-xl font-bold text-primary">BizList</span>
        </Link>

        {/* Search - Desktop */}
        {showSearch && (
          <div className="hidden md:flex items-center flex-1 max-w-l mx-8">
            <form 
              className="flex items-center bg-white rounded-full shadow-sm border border-border/50 hover:border-primary/20"
              onSubmit={(e) => {
                e.preventDefault();
                performSearch();
              }}>
              <div className="relative flex-1 w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="What service do you need?" 
                  className="pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-full truncate max-w-[400px]"
                  maxLength={50}
                />
              </div>
              <div className="h-6 w-px bg-border/50" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[140px] border-0 focus:ring-0 focus:ring-offset-0 rounded-none text-left">
                  <SelectValue placeholder="Category" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="home">Home Improvement</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="personal">Personal Services</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="lessons">Lessons</SelectItem>
                  <SelectItem value="business">Business Services</SelectItem>
                </SelectContent>
              </Select>
              <div className="h-6 w-px bg-border/50" />
              <div className="relative">
                <LocationAutocomplete
                  value={location}
                  onChange={setLocation}
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="City or Zip"
                  inputClassName="w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 truncate"
                  suggestionsClassName="w-[250px] right-0"
                  maxLength={12}
                />
              </div>
              <Button 
                type="submit" 
                size="sm" 
                className="ml-2 rounded-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="link" 
                className={cn(
                  'hover:text-primary transition-colors text-sm font-medium flex items-center gap-1',
                  (pathname === '/categories' || pathname === '/providers') ? 'text-primary' : 'text-foreground/80'
                )}
              >
                Explore
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {exploreLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link 
                    href={link.href}
                    className={cn(
                      'cursor-pointer',
                      pathname === link.href ? 'text-primary' : ''
                    )}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="link" 
                className={cn(
                  'hover:text-primary transition-colors text-sm font-medium flex items-center',
                  (pathname === '/about' || pathname === '/contact') ? 'text-primary' : 'text-foreground/80'
                )}
              >
                About
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {aboutLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link 
                    href={link.href}
                    className={cn(
                      'cursor-pointer',
                      pathname === link.href ? 'text-primary' : ''
                    )}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

        
          {/* Show "Become a Provider" to non-logged in users and logged in users who don't have a provider account */}
          {(!user || (user && !profile?.has_provider)) && (
            <Button
              variant="link"
              className="hover:text-primary transition-colors text-sm font-medium"
              asChild
            >
              <Link href="/become-a-provider">
                Become a Provider
              </Link>
            </Button>
          )}
          
          {/* User menu or auth buttons */}
          {loading ? (
            <HeaderUserMenuLoading />
          ) : user ? (
            <div className="flex items-center gap-2">
              {/* Notifications Button */}
              <NotificationsDropdown />
              
              {/* Messages Button */}
              <MessagesDropdown />
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 focus:outline-none ml-1">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border bg-gray-200 object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = ''; }}
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full border bg-gray-200 flex items-center justify-center font-bold text-slate-700 text-base">
                        {getInitials()}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <button className="w-full text-left px-2 py-1" onClick={() => router.push('/profile')}>View Profile</button>
                  </DropdownMenuItem>
                  
                  {/* User Dashboard - for personal account */}
                  <DropdownMenuItem asChild>
                    <button className="w-full text-left px-2 py-1" onClick={() => router.push('/user-dashboard')}>User Dashboard</button>
                  </DropdownMenuItem>
                  
                  {/* Business Dashboard - only if user has a provider account */}
                  {profile?.has_provider && (
                    <DropdownMenuItem asChild>
                      <button className="w-full text-left px-2 py-1" onClick={() => router.push('/dashboard/business-profile')}>Business Profile</button>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <button className="w-full text-left px-2 py-1" onClick={() => router.push('/messages')}>Messages</button>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <button className="w-full text-left px-2 py-1" onClick={() => router.push('/notifications')}>Notifications</button>
                  </DropdownMenuItem>
                  
                  {/* Admin Dashboard - only for admin/moderator users */}
                  {(userRole === 'admin' || userRole === 'moderator') && (
                    <DropdownMenuItem asChild>
                      <button className="w-full text-left px-2 py-1" onClick={() => router.push('/admin')}>Admin Dashboard</button>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <button className="w-full text-left px-2 py-1" onClick={handleSignOut}>Log Out</button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="link" size="sm" className="text-sm" onClick={() => openModal('signIn')}>Sign In</Button>
              <Button size="sm" className="text-sm" onClick={() => openModal('signUp')}>Sign Up</Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && <MobileMenu navLinks={[...navLinks, ...exploreLinks, ...aboutLinks]} onClose={() => setIsMobileMenuOpen(false)} />}
    </header>
  );
};

export default Header;
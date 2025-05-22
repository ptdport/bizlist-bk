"use client";

import { useRouter } from 'next/navigation';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User, Building2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserMode } from './UserModeContext';

export function ModeSwitcher() {
  const router = useRouter();
  const { mode, setMode, providerData, isProviderActive, loading } = useUserMode();

  // Handle mode switch
  const handleModeSwitch = (newMode: 'personal' | 'provider') => {
    setMode(newMode);
    
    if (newMode === 'provider') {
      router.push('/dashboard/business-profile');
    } else {
      router.push('/profile');
    }
  };

  // If user doesn't have an active provider account, don't show the switcher
  if (loading || !isProviderActive) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "flex items-center gap-2 rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10",
            mode === 'provider' && "bg-primary/20 hover:bg-primary/30"
          )}
        >
          {mode === 'personal' ? (
            <>
              <User className="h-4 w-4" />
              <span>Personal</span>
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4" />
              <span>Provider</span>
            </>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Switch mode</p>
              <p className="text-xs text-muted-foreground">
                Toggle between personal and provider views
              </p>
            </div>
            <Switch 
              checked={mode === 'provider'}
              onCheckedChange={(checked) => handleModeSwitch(checked ? 'provider' : 'personal')}
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            mode === 'personal' && "bg-accent"
          )}
          onClick={() => handleModeSwitch('personal')}
        >
          <User className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-sm">Personal Profile</span>
            <span className="text-xs text-muted-foreground">Manage your personal account</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            mode === 'provider' && "bg-accent"
          )}
          onClick={() => handleModeSwitch('provider')}
        >
          <Building2 className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-sm">{providerData?.business_name || 'Provider Profile'}</span>
            <span className="text-xs text-muted-foreground">Manage your business</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
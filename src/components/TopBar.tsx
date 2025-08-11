import React from 'react';
import { Search, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface TopBarProps {
  onViewChange?: (view: 'home' | 'music' | 'meditation' | 'library' | 'explore' | 'admin') => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onViewChange }) => {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuthAction = async () => {
    console.log('Auth action clicked, authenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('Attempting to sign out...');
      try {
        const { error } = await signOut();
        console.log('Sign out result:', { error });
        
        if (!error) {
          // Redirect to home page after successful sign out
          if (onViewChange) {
            onViewChange('home');
          }
          
          toast({
            title: "Signed out",
            description: "You've been successfully signed out.",
          });
          console.log('Sign out successful');
        } else {
          console.error('Sign out error:', error);
          toast({
            title: "Sign out failed",
            description: "There was an error signing out. Please try again.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Sign out exception:', err);
        toast({
          title: "Sign out failed", 
          description: "There was an error signing out. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      console.log('Navigating to auth page...');
      navigate('/auth');
    }
  };

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 gap-4">
      <SidebarTrigger className="-ml-1" />
      
      <div className="flex-1 flex items-center justify-center max-w-md mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search healing music, meditations..."
            className="pl-10 bg-muted/30 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleAuthAction}
          variant={isAuthenticated ? "ghost" : "default"}
          size="sm"
          className="flex items-center gap-2"
        >
          {isAuthenticated ? (
            <>
              <User className="w-4 h-4" />
              <span className="hidden sm:block">
                {user?.email?.split('@')[0] || 'Profile'}
              </span>
              <LogOut className="w-3 h-3" />
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:block">Sign In</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
};
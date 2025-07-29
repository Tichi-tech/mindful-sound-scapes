
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Wand2, Music, Sparkles, Compass, LogIn, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface NavigationProps {
  currentView: 'home' | 'generate' | 'library' | 'explore' | 'admin';
  onViewChange: (view: 'home' | 'generate' | 'library' | 'explore' | 'admin') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { isAuthenticated, user, signOut } = useAuth();
  const { isAdmin } = useAdminStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      const { error } = await signOut();
      if (!error) {
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        });
        onViewChange('home');
      }
    } else {
      navigate('/auth');
    }
  };

  const handleNavClick = (viewId: string) => {
    if ((viewId === 'generate' || viewId === 'library' || viewId === 'admin') && !isAuthenticated) {
      navigate('/auth');
      return;
    }
    onViewChange(viewId as any);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, public: true },
    { id: 'generate', label: 'Generate', icon: Wand2, public: false },
    { id: 'library', label: 'My Library', icon: Music, public: false },
    { id: 'explore', label: 'Explore', icon: Compass, public: true },
    { id: 'admin', label: 'Admin', icon: Shield, public: false, adminOnly: true },
  ];

  // Filter navigation items based on authentication status and admin role
  const visibleNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return isAuthenticated && isAdmin;
    }
    return item.public || isAuthenticated;
  });

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/1c8c11f2-0d94-4413-8722-c94c6180fd33.png" 
              alt="Indara AI" 
              className="h-24 w-auto"
            />
          </div>
          
          <div className="flex items-center space-x-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:block">{item.label}</span>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-secondary/20 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
            
            {/* Auth Button */}
            <div className="ml-4 pl-4 border-l border-border">
              <Button
                onClick={handleAuthAction}
                variant={isAuthenticated ? "ghost" : "default"}
                size="sm"
                className="flex items-center space-x-2 h-10"
              >
                {isAuthenticated ? (
                  <>
                    <User className="w-4 h-4" />
                    <span className="hidden sm:block">
                      {user?.email?.split('@')[0] || 'Profile'}
                    </span>
                    <LogOut className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:block">Sign In</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

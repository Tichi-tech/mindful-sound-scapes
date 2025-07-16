
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Wand2, Music, Sparkles, Compass } from 'lucide-react';

interface NavigationProps {
  currentView: 'home' | 'generate' | 'library' | 'explore';
  onViewChange: (view: 'home' | 'generate' | 'library' | 'explore') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'generate', label: 'Generate', icon: Wand2 },
    { id: 'library', label: 'My Music', icon: Music },
    { id: 'explore', label: 'Explore', icon: Compass },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/3357473d-ea2d-4c95-9653-adc79c46974b.png" 
              alt="Indara AI" 
              className="h-8 w-auto"
            />
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onViewChange(item.id as any)}
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
          </div>
        </div>
      </div>
    </nav>
  );
};

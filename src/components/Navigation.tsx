
import React from 'react';
import { motion } from 'framer-motion';
import { Home, MessageCircle, Music, Sparkles } from 'lucide-react';

interface NavigationProps {
  currentView: 'home' | 'chat' | 'library';
  onViewChange: (view: 'home' | 'chat' | 'library') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'AI Assistant', icon: MessageCircle },
    { id: 'library', label: 'Sound Library', icon: Music },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tichi
            </span>
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
                      ? 'text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
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
                      className="absolute inset-0 bg-blue-50 rounded-lg -z-10"
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

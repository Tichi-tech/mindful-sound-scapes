import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap } from 'lucide-react';

interface MinimalHeroProps {
  onStartGenerating: () => void;
  onTryWithoutLogin: () => void;
}

export const MinimalHero: React.FC<MinimalHeroProps> = ({ 
  onStartGenerating, 
  onTryWithoutLogin 
}) => {
  return (
    <motion.div 
      className="text-center py-12 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-2xl mx-auto">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Create Calm. Anytime.
        </motion.h1>
        
        <motion.p 
          className="text-lg text-muted-foreground mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Transform any moment into a peaceful experience with AI-powered healing music and guided meditations tailored just for you.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button 
            onClick={onStartGenerating}
            size="lg" 
            className="flex items-center gap-2 px-8 py-3 text-base font-medium"
          >
            <Sparkles className="w-5 h-5" />
            Start Creating
          </Button>
          
          <Button 
            onClick={onTryWithoutLogin}
            variant="outline" 
            size="lg"
            className="flex items-center gap-2 px-8 py-3 text-base"
          >
            <Zap className="w-5 h-5" />
            Try Without Login
          </Button>
        </motion.div>
        
        <motion.div 
          className="mt-8 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Join <span className="font-semibold text-primary">10,000+</span> users creating personalized soundscapes
        </motion.div>
      </div>
    </motion.div>
  );
};
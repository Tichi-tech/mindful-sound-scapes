
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Music, Wand2 } from 'lucide-react';

interface HeroProps {
  onStartChat: () => void;
  onBrowseCreations: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartChat, onBrowseCreations }) => {
  return (
    <div className="text-center py-12 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-4"
      >
        <h1 className="text-5xl font-bold text-foreground leading-tight">
          AI-Powered
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {' '}Healing Music
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create custom healing music with AI. Describe your vision and let our AI composer 
          generate the perfect soundscape for meditation, relaxation, and wellness.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <Button 
          onClick={onStartChat}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Music
        </Button>
        
        <Button 
          onClick={onBrowseCreations}
          variant="outline"
          size="lg"
          className="px-8 py-3 rounded-full text-lg font-medium"
        >
          <Music className="w-5 h-5 mr-2" />
          Browse Creations
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16"
      >
        <div className="bg-card/60 backdrop-blur-sm p-6 rounded-2xl border border-border">
          <Wand2 className="w-8 h-8 text-primary mb-4 mx-auto" />
          <h3 className="font-semibold text-card-foreground mb-2">AI Composition</h3>
          <p className="text-muted-foreground text-sm">Custom healing music generated from your descriptions</p>
        </div>
        
        <div className="bg-card/60 backdrop-blur-sm p-6 rounded-2xl border border-border">
          <Sparkles className="w-8 h-8 text-accent mb-4 mx-auto" />
          <h3 className="font-semibold text-card-foreground mb-2">Healing Focused</h3>
          <p className="text-muted-foreground text-sm">Specialized in therapeutic and wellness music</p>
        </div>
        
        <div className="bg-card/60 backdrop-blur-sm p-6 rounded-2xl border border-border">
          <Music className="w-8 h-8 text-secondary mb-4 mx-auto" />
          <h3 className="font-semibold text-card-foreground mb-2">Professional Quality</h3>
          <p className="text-muted-foreground text-sm">Studio-quality healing music and soundscapes</p>
        </div>
      </motion.div>
    </div>
  );
};

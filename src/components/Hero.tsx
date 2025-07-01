
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Music } from 'lucide-react';

interface HeroProps {
  onStartChat: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartChat }) => {
  return (
    <div className="text-center py-12 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-4"
      >
        <h1 className="text-5xl font-bold text-gray-800 leading-tight">
          AI-Powered
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {' '}Meditation
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Let AI create the perfect meditation soundscape tailored to your needs. 
          No more searching - just tell us how you're feeling.
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
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Brain className="w-5 h-5 mr-2" />
          Start AI Session
        </Button>
        
        <Button 
          variant="outline"
          size="lg"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full text-lg font-medium"
        >
          <Music className="w-5 h-5 mr-2" />
          Browse Library
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16"
      >
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100">
          <Sparkles className="w-8 h-8 text-blue-500 mb-4 mx-auto" />
          <h3 className="font-semibold text-gray-800 mb-2">AI-Generated</h3>
          <p className="text-gray-600 text-sm">Personalized soundscapes created just for you</p>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100">
          <Brain className="w-8 h-8 text-indigo-500 mb-4 mx-auto" />
          <h3 className="font-semibold text-gray-800 mb-2">Smart Recommendations</h3>
          <p className="text-gray-600 text-sm">AI understands your mood and preferences</p>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100">
          <Music className="w-8 h-8 text-purple-500 mb-4 mx-auto" />
          <h3 className="font-semibold text-gray-800 mb-2">High Quality Audio</h3>
          <p className="text-gray-600 text-sm">Crystal clear meditation sounds and music</p>
        </div>
      </motion.div>
    </div>
  );
};

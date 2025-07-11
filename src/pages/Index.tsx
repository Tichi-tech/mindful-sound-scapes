
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { MusicGenerator } from '@/components/MusicGenerator';
import { AudioPlayer } from '@/components/AudioPlayer';
import { MeditationLibrary } from '@/components/MeditationLibrary';
import { Hero } from '@/components/Hero';

const Index = () => {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'generate' | 'library'>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {currentView === 'home' && (
            <div className="space-y-8">
              <Hero onStartChat={() => setCurrentView('generate')} />
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <MeditationLibrary 
                    onSoundSelect={setSelectedSound}
                    selectedSound={selectedSound}
                  />
                </div>
                <div className="space-y-6">
                  <AudioPlayer selectedSound={selectedSound} />
                </div>
              </div>
            </div>
          )}
          
          {currentView === 'generate' && (
            <MusicGenerator />
          )}
          
          {currentView === 'library' && (
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                My Generated Music
              </h1>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <MeditationLibrary 
                    onSoundSelect={setSelectedSound}
                    selectedSound={selectedSound}
                    expanded={true}
                  />
                </div>
                <div>
                  <AudioPlayer selectedSound={selectedSound} />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;

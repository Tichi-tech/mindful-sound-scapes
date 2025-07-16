
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { GeneratorSelection } from '@/components/GeneratorSelection';
import { AudioPlayer } from '@/components/AudioPlayer';
import { MeditationLibrary } from '@/components/MeditationLibrary';
import { Hero } from '@/components/Hero';
import { CommunityShowcase } from '@/components/CommunityShowcase';
import { Explore } from '@/components/Explore';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Index = () => {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'generate' | 'library' | 'explore'>('home');
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/10">
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
              <CommunityShowcase onTrackSelect={(track) => setSelectedSound(track.audio_url)} />
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
            <ProtectedRoute>
              <GeneratorSelection />
            </ProtectedRoute>
          )}
          
          {currentView === 'library' && (
            <ProtectedRoute>
              <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
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
                
                {/* Community Section for authenticated users */}
                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12"
                  >
                    <div className="border-t border-border pt-8">
                      <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                        Community Highlights
                      </h2>
                      <CommunityShowcase onTrackSelect={(track) => setSelectedSound(track.audio_url)} />
                    </div>
                  </motion.div>
                )}
              </div>
            </ProtectedRoute>
          )}
          
          {currentView === 'explore' && (
            <Explore />
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;

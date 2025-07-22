
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { GeneratorSelection } from '@/components/GeneratorSelection';
import { AudioPlayer } from '@/components/AudioPlayer';
import { MeditationLibrary } from '@/components/MeditationLibrary';
import { MyLibrary } from '@/components/MyLibrary';
import { Hero } from '@/components/Hero';
import { CommunityShowcase } from '@/components/CommunityShowcase';
import { Explore } from '@/components/Explore';
import { AdminPanel } from '@/components/AdminPanel';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Index = () => {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'generate' | 'library' | 'explore' | 'admin'>('home');
  const { isAuthenticated } = useAuth();
  const { isAdmin } = useAdminStatus();

  // Redirect to home if trying to access protected views without authentication
  React.useEffect(() => {
    if (!isAuthenticated && (currentView === 'generate' || currentView === 'library' || currentView === 'admin')) {
      setCurrentView('home');
    }
    // Redirect to home if trying to access admin without admin rights
    if (currentView === 'admin' && isAuthenticated && !isAdmin) {
      setCurrentView('home');
    }
  }, [isAuthenticated, isAdmin, currentView]);

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
              <Hero 
                onStartChat={() => setCurrentView('generate')} 
                onBrowseCreations={() => setCurrentView('explore')}
              />
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
              <MyLibrary />
            </ProtectedRoute>
          )}
          
          {currentView === 'explore' && (
            <Explore />
          )}

          {currentView === 'admin' && (
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;

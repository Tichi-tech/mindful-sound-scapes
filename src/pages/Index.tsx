
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { GeneratorSelection } from '@/components/GeneratorSelection';
import { AudioPlayer } from '@/components/AudioPlayer';
import { MyLibrary } from '@/components/MyLibrary';
import { MinimalHero } from '@/components/MinimalHero';
import { CommunityGrid } from '@/components/CommunityGrid';
import { Explore } from '@/components/Explore';
import { AdminPanel } from '@/components/AdminPanel';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'generate' | 'library' | 'explore' | 'admin'>('home');
  const { isAuthenticated } = useAuth();
  const { isAdmin } = useAdminStatus();
  const navigate = useNavigate();

  // Handle navigation with authentication checks
  const handleViewChange = (view: 'home' | 'generate' | 'library' | 'explore' | 'admin') => {
    if ((view === 'generate' || view === 'library' || view === 'admin') && !isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (view === 'admin' && isAuthenticated && !isAdmin) {
      setCurrentView('home');
      return;
    }
    setCurrentView(view);
  };

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
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-background via-secondary/5 to-accent/5">
        <AppSidebar currentView={currentView} onViewChange={handleViewChange} />
        
        <SidebarInset className="flex-1">
          <TopBar />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-6 py-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {currentView === 'home' && (
                  <div className="space-y-8">
                    <MinimalHero 
                      onStartGenerating={() => handleViewChange('generate')} 
                      onTryWithoutLogin={() => {/* Handle guest mode */}}
                    />
                    <CommunityGrid onTrackSelect={(track) => setSelectedSound(track.audio_url || track.title)} />
                    <div className="fixed bottom-4 right-4 z-50">
                      <AudioPlayer selectedSound={selectedSound} />
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
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;

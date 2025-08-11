import React, { useState } from 'react';
import { GeneratorSidebar } from './meditation-studio/GeneratorSidebar';
import { SessionLibrary } from './meditation-studio/SessionLibrary';

export const MeditationStudio: React.FC = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [refreshSessions, setRefreshSessions] = useState(0);

  const handleSessionCreated = () => {
    setRefreshSessions(prev => prev + 1);
  };

  const handlePlaySession = (sessionId: string) => {
    setCurrentlyPlaying(currentlyPlaying === sessionId ? null : sessionId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Left Sidebar - Generator */}
        <div className="w-80 bg-card border-r border-border flex-shrink-0">
          <GeneratorSidebar onSessionCreated={handleSessionCreated} />
        </div>
        
        {/* Right Panel - Session Library */}
        <div className="flex-1 overflow-hidden">
          <SessionLibrary 
            currentlyPlaying={currentlyPlaying}
            onPlaySession={handlePlaySession}
            refreshTrigger={refreshSessions}
          />
        </div>
      </div>
    </div>
  );
};
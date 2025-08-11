import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionCard } from './SessionCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Session {
  id: string;
  title: string;
  prompt: string;
  duration: string;
  technique: string;
  script?: string;
  audio_url?: string;
  created_at: string;
}

interface SessionLibraryProps {
  currentlyPlaying: string | null;
  onPlaySession: (sessionId: string) => void;
  refreshTrigger: number;
}

export const SessionLibrary: React.FC<SessionLibraryProps> = ({
  currentlyPlaying,
  onPlaySession,
  refreshTrigger
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        toast.error('Failed to load sessions');
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [refreshTrigger]);

  const getFilteredSessions = () => {
    switch (activeTab) {
      case 'music':
        return sessions.filter(session => session.audio_url);
      case 'sessions':
        return sessions.filter(session => session.script);
      case 'favorites':
        return []; // TODO: Implement favorites functionality
      default:
        return sessions;
    }
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'all':
        return 'All';
      case 'music':
        return 'Music';
      case 'sessions':
        return 'Sessions';
      case 'favorites':
        return 'Favorites';
      default:
        return tab;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-800 p-1">
              <TabsTrigger 
                value="all" 
                className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="music" 
                className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
              >
                Music
              </TabsTrigger>
              <TabsTrigger 
                value="sessions" 
                className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
              >
                Sessions
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
              >
                Favorites
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="text-sm text-gray-400">
            Upgrade plan
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab}>
          <TabsContent value={activeTab} className="mt-0">
            {getFilteredSessions().length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-lg mb-2">No {getTabTitle(activeTab).toLowerCase()} found</p>
                <p className="text-sm">Create your first meditation session to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getFilteredSessions().map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isPlaying={currentlyPlaying === session.id}
                    onPlay={() => onPlaySession(session.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
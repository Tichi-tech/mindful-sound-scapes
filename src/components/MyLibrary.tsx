import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Download, Clock, Music, Brain, Heart, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface GeneratedTrack {
  id: string;
  title: string;
  prompt: string;
  duration: string;
  style: string;
  audio_url?: string;
  status: string;
  created_at: string;
}

interface GeneratedSession {
  id: string;
  title: string;
  prompt: string;
  duration: string;
  technique: string;
  script?: string;
  audio_url?: string;
  status: string;
  created_at: string;
}

export const MyLibrary: React.FC = () => {
  const [tracks, setTracks] = useState<GeneratedTrack[]>([]);
  const [sessions, setSessions] = useState<GeneratedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const musicStyles = [
    { value: 'ambient', label: 'Ambient Healing' },
    { value: 'nature', label: 'Nature Sounds' },
    { value: 'binaural', label: 'Binaural Beats' },
    { value: 'tibetan', label: 'Tibetan Bowls' },
    { value: 'piano', label: 'Healing Piano' },
    { value: 'crystal', label: 'Crystal Sounds' },
    { value: 'meditation', label: 'Deep Meditation' },
    { value: 'chakra', label: 'Chakra Healing' }
  ];

  const meditationTechniques = [
    { value: 'mindfulness', label: 'Mindfulness Meditation' },
    { value: 'breathing', label: 'Breathing Exercises' },
    { value: 'body-scan', label: 'Body Scan' },
    { value: 'loving-kindness', label: 'Loving-Kindness' },
    { value: 'visualization', label: 'Visualization' },
    { value: 'progressive-relaxation', label: 'Progressive Relaxation' },
    { value: 'chakra', label: 'Chakra Meditation' },
    { value: 'mantra', label: 'Mantra Meditation' }
  ];

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      
      // Fetch generated tracks
      const { data: tracksData, error: tracksError } = await supabase
        .from('generated_tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tracksError) {
        console.error('Error fetching tracks:', tracksError);
        toast.error('Failed to load music tracks');
      } else {
        setTracks(tracksData || []);
      }

      // Fetch generated sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('generated_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        toast.error('Failed to load meditation sessions');
      } else {
        setSessions(sessionsData || []);
      }
    } catch (error) {
      console.error('Error fetching library data:', error);
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (url: string) => {
    try {
      const audio = new Audio(url);
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        toast.error('Unable to play audio. Please try downloading the file.');
      });
    } catch (error) {
      console.error('Error creating audio element:', error);
      toast.error('Unable to play audio. Please try downloading the file.');
    }
  };

  const downloadAudio = (url: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.wav`;
      link.click();
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast.error('Unable to download audio file.');
    }
  };

  const downloadScript = (script: string, title: string) => {
    const element = document.createElement('a');
    const file = new Blob([script], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}_meditation_script.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Meditation script downloaded!');
  };

  const deleteTrack = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_tracks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTracks(prev => prev.filter(track => track.id !== id));
      toast.success('Track deleted successfully');
    } catch (error) {
      console.error('Error deleting track:', error);
      toast.error('Failed to delete track');
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== id));
      toast.success('Session deleted successfully');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.style.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.technique.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">My Library</h1>
        <p className="text-muted-foreground">Your collection of generated music and meditation sessions</p>
        
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="music" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Music ({filteredTracks.length})
          </TabsTrigger>
          <TabsTrigger value="meditation" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Meditation ({filteredSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="space-y-4">
          {filteredTracks.length === 0 ? (
            <Card className="p-12 text-center">
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No music tracks yet</h3>
              <p className="text-muted-foreground">Start generating healing music to see them here!</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTracks.map((track) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-card-foreground">{track.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {musicStyles.find(s => s.value === track.style)?.label || track.style}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {track.duration} min
                        </Badge>
                        <Badge 
                          variant={track.status === 'completed' ? 'default' : track.status === 'failed' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {track.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">{track.prompt}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(track.created_at).toLocaleDateString()} at {new Date(track.created_at).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {track.status === 'generating' ? (
                        <div className="flex items-center gap-2 text-primary">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">Generating...</span>
                        </div>
                      ) : track.status === 'completed' && track.audio_url ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => playAudio(track.audio_url!)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-success"
                            onClick={() => downloadAudio(track.audio_url!, track.title)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      ) : null}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteTrack(track.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="meditation" className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card className="p-12 text-center">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No meditation sessions yet</h3>
              <p className="text-muted-foreground">Create guided meditation sessions to see them here!</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 bg-card border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-card-foreground">{session.title}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{session.prompt}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="border-success/20 text-success">
                            <Brain className="w-3 h-3 mr-1" />
                            {meditationTechniques.find(t => t.value === session.technique)?.label || session.technique}
                          </Badge>
                          <Badge variant="outline" className="border-primary/20 text-primary">
                            <Clock className="w-3 h-3 mr-1" />
                            {session.duration} min
                          </Badge>
                          <Badge 
                            variant={session.status === 'completed' ? 'default' : session.status === 'failed' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {session.status === 'generating' ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-muted-foreground">Generating your meditation session...</span>
                      </div>
                    ) : session.status === 'completed' && session.script ? (
                      <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground line-clamp-3">{session.script}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info('Text-to-speech playback coming soon!')}
                            className="flex-1 border-success/20 text-success hover:bg-success/10"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Play Session
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadScript(session.script!, session.title)}
                            className="flex-1 border-primary/20 text-primary hover:bg-primary/10"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Script
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteSession(session.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deleteSession(session.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
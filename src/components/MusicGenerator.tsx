import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, Lightbulb, Sparkles, Clock, Settings, Music, Play, Pause, Heart, Download, Square, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatInterface } from './chat/ChatInterface';
import { ShareButtons } from './ui/share-buttons';

interface GeneratedTrack {
  id: string;
  title: string;
  prompt: string;
  duration: string;
  style: string;
  url?: string;
  audioUrl?: string;
  isGenerating: boolean;
  timestamp: Date;
}

export const MusicGenerator: React.FC = () => {
  const [sessionName, setSessionName] = useState('Healing Music Session 1.0');
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('ambient');
  const [duration, setDuration] = useState('3');
  const [quality, setQuality] = useState('high');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('music');
  const [libraryTab, setLibraryTab] = useState('all');
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const quickTags = [
    'Deep Sleep', 'Morning Focus', 'Stress Relief', 'Anxiety', 
    'Productivity', 'Creativity', 'Calm', 'Energy'
  ];

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracks:', error);
        return;
      }

      // Convert to our GeneratedTrack format
      const tracks = (data || []).map(track => ({
        id: track.id,
        title: track.title || 'Untitled Track',
        prompt: track.prompt || '',
        duration: track.duration || '3',
        style: track.style || 'ambient',
        audioUrl: track.audio_url,
        isGenerating: track.status === 'generating',
        timestamp: new Date(track.created_at)
      }));

      setGeneratedTracks(tracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [refreshTrigger]);

  const pollForCompletion = async (trackId: string) => {
    const checkStatus = async () => {
      try {
        const { data: track, error } = await supabase
          .from('generated_tracks')
          .select('*')
          .eq('id', trackId)
          .single();

        if (error) {
          console.error('Error checking track status:', error);
          return;
        }

        if (track.status === 'completed' && track.audio_url) {
          setRefreshTrigger(prev => prev + 1);
          toast.success('Music generation completed!');
        } else if (track.status === 'failed') {
          setRefreshTrigger(prev => prev + 1);
          toast.error('Music generation failed. Please try again.');
        } else {
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        console.error('Error polling for completion:', error);
        setTimeout(checkStatus, 5000);
      }
    };

    setTimeout(checkStatus, 10000);
  };

  const styles = [
    { value: 'ambient', label: 'Ambient Healing' },
    { value: 'nature', label: 'Nature Sounds' },
    { value: 'binaural', label: 'Binaural Beats' },
    { value: 'tibetan', label: 'Tibetan Bowls' },
    { value: 'piano', label: 'Healing Piano' },
    { value: 'crystal', label: 'Crystal Sounds' },
    { value: 'meditation', label: 'Deep Meditation' },
    { value: 'chakra', label: 'Chakra Healing' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what kind of healing music you want to create');
      return;
    }

    setIsGenerating(true);

    try {
      const trackTitle = title || `Healing Music ${generatedTracks.length + 1}`;
      
      const response = await fetch('https://mtypyrsdbsoxrgzsxwsk.supabase.co/functions/v1/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXB5cnNkYnNveHJnenN4d3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTY5NzQsImV4cCI6MjA2NzU3Mjk3NH0.rIRFbCR4fFDftKrSu0EykIHrl91cKHN3hP8BRE-XOdU`
        },
        body: JSON.stringify({
          prompt,
          title: trackTitle,
          style,
          duration
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate music: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Music generation failed');
      }

      toast.success('Music generation started! This may take 30-60 seconds for the first generation.');
      pollForCompletion(result.trackId);
      setRefreshTrigger(prev => prev + 1);
      setPrompt('');
      setTitle('');

    } catch (error) {
      console.error('Error generating music:', error);
      toast.error('Failed to generate music: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (url: string, trackId: string) => {
    try {
      if (currentlyPlaying === trackId && audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
        setCurrentlyPlaying(null);
        setAudioInstance(null);
        return;
      }

      if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }

      const audio = new Audio(url);
      audio.addEventListener('error', (e) => {
        console.error('Audio element error:', e);
        toast.error('Unable to play audio');
        setCurrentlyPlaying(null);
        setAudioInstance(null);
      });

      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
        setAudioInstance(null);
      });

      audio.play().then(() => {
        setCurrentlyPlaying(trackId);
        setAudioInstance(audio);
      }).catch((error) => {
        console.error('Error playing audio:', error);
        toast.error('Unable to play audio');
        setCurrentlyPlaying(null);
        setAudioInstance(null);
      });

    } catch (error) {
      console.error('Error creating audio element:', error);
      toast.error('Unable to play audio');
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

  const handleChatEnrichment = (enrichedPrompt: string) => {
    setPrompt(enrichedPrompt);
    setShowChat(false);
    toast.success('Prompt enriched by AI!');
  };

  const addQuickTag = (tag: string) => {
    if (!prompt.includes(tag)) {
      setPrompt(prev => prev ? `${prev}, ${tag.toLowerCase()}` : tag.toLowerCase());
    }
  };

  const handlePlayTrack = (trackId: string) => {
    setCurrentlyPlaying(currentlyPlaying === trackId ? null : trackId);
  };

  const getFilteredTracks = () => {
    switch (libraryTab) {
      case 'music':
        return generatedTracks.filter(track => track.audioUrl);
      case 'favorites':
        return [];
      default:
        return generatedTracks;
    }
  };

  const getBackgroundImage = (style: string) => {
    switch (style.toLowerCase()) {
      case 'ambient':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'nature':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'binaural':
        return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      case 'tibetan':
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      case 'piano':
        return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
      case 'crystal':
        return 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
      case 'meditation':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'chakra':
        return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  if (showChat) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <Button 
          variant="ghost" 
          onClick={() => setShowChat(false)}
          className="mb-4"
        >
          ← Back to Generator
        </Button>
        <h2 className="text-xl font-semibold mb-4">AI Prompt Enhancement</h2>
        <div className="bg-card rounded-lg p-4 border">
          <ChatInterface onSoundRecommendation={handleChatEnrichment} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Left Sidebar - Generator */}
        <div className="w-80 bg-card border-r border-border flex-shrink-0 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-semibold mb-2">Healing Music Generator</h1>
            
            {/* Session Selector */}
            <div className="relative">
              <Select value={sessionName} onValueChange={setSessionName}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                  <ChevronDown className="w-4 h-4" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Healing Music Session 1.0">Healing Music Session 1.0</SelectItem>
                  <SelectItem value="Custom Session">Custom Session</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger 
                  value="music" 
                  className="flex-1"
                >
                  Text to Healing Music
                </TabsTrigger>
                <TabsTrigger 
                  value="sound" 
                  className="flex-1"
                >
                  Sound Reference
                </TabsTrigger>
              </TabsList>

              <TabsContent value="music" className="space-y-6 mt-6">
                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium mb-2">Prompt</label>
                  <Textarea
                    placeholder="Describe your healing music vision: mood, instruments, energy level, purpose..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none"
                    rows={5}
                  />
                </div>

                {/* Inspire Me Button */}
                <Button 
                  variant="outline"
                  onClick={() => setShowChat(true)}
                  className="w-full"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Inspire Me
                </Button>

                {/* Quick Tags */}
                <div className="flex flex-wrap gap-2">
                  {quickTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => addQuickTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Title (Optional)</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Morning Meditation, Deep Sleep Journey..."
                    />
                  </div>

                  {/* Duration and Style */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Duration
                      </label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 min</SelectItem>
                          <SelectItem value="5">5 min</SelectItem>
                          <SelectItem value="10">10 min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        <Music className="w-4 h-4 inline mr-1" />
                        Style
                      </label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Settings className="w-4 h-4 inline mr-1" />
                      High Fidelity
                    </label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Quality</SelectItem>
                        <SelectItem value="medium">Medium Quality</SelectItem>
                        <SelectItem value="low">Low Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sound" className="mt-6">
                <div className="text-center text-muted-foreground py-8">
                  <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sound reference functionality coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Create Button */}
          <div className="p-6 border-t border-border">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Creating Music...
                </>
              ) : (
                'Create Music'
              )}
            </Button>
          </div>
        </div>
        
        {/* Right Panel - Music Library */}
        <div className="flex-1 overflow-hidden bg-background flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <Tabs value={libraryTab} onValueChange={setLibraryTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="music">Music</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : getFilteredTracks().length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-lg mb-2">No {libraryTab === 'all' ? 'tracks' : libraryTab} found</p>
                <p className="text-sm">Create your first healing music to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getFilteredTracks().map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    isPlaying={currentlyPlaying === track.id}
                    onPlay={() => handlePlayTrack(track.id)}
                    onActualPlay={() => track.audioUrl && playAudio(track.audioUrl, track.id)}
                    onDownload={() => track.audioUrl && downloadAudio(track.audioUrl, track.title)}
                    backgroundImage={getBackgroundImage(track.style)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Track Card Component
interface TrackCardProps {
  track: GeneratedTrack;
  isPlaying: boolean;
  onPlay: () => void;
  onActualPlay: () => void;
  onDownload: () => void;
  backgroundImage: string;
}

const TrackCard: React.FC<TrackCardProps> = ({ 
  track, 
  isPlaying, 
  onPlay, 
  onActualPlay, 
  onDownload, 
  backgroundImage 
}) => {
  return (
    <motion.div
      className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div 
        className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center"
        style={{ background: backgroundImage }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <Button
          variant="secondary"
          size="lg"
          className="relative z-10 rounded-full w-16 h-16 p-0 bg-white/90 hover:bg-white shadow-lg"
          onClick={onActualPlay}
          disabled={track.isGenerating || !track.audioUrl}
        >
          {track.isGenerating ? (
            <Sparkles className="w-6 h-6 animate-spin text-primary" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6 text-primary" />
          ) : (
            <Play className="w-6 h-6 text-primary fill-current" />
          )}
        </Button>
        
        {track.isGenerating && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
            Generating...
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-sm line-clamp-1">{track.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{track.prompt}</p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {track.style}
            </Badge>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {track.duration}m
            </span>
          </div>
          <span>{track.timestamp.toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onActualPlay}
              disabled={track.isGenerating || !track.audioUrl}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onDownload}
              disabled={track.isGenerating || !track.audioUrl}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
          <ShareButtons 
            title={track.title}
            description={`Generated healing music: ${track.prompt.slice(0, 100)}...`}
            className="ml-2"
          />
        </div>
      </div>
    </motion.div>
  );
};
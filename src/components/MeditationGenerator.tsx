import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, Lightbulb, Sparkles, Clock, Settings, Music, Play, Pause, Heart, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatInterface } from './chat/ChatInterface';
import { AudioWaveform } from './meditation-studio/AudioWaveform';

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

export const MeditationGenerator: React.FC = () => {
  const [sessionName, setSessionName] = useState('CalmAI Session 1.0');
  const [prompt, setPrompt] = useState('');
  const [technique, setTechnique] = useState('mindfulness');
  const [duration, setDuration] = useState('10');
  const [quality, setQuality] = useState('high');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('meditation');
  const [libraryTab, setLibraryTab] = useState('all');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const techniques = [
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'breathing', label: 'Breathing' },
    { value: 'body-scan', label: 'Body Scan' },
    { value: 'loving-kindness', label: 'Loving-Kindness' },
    { value: 'visualization', label: 'Visualization' },
    { value: 'sleep', label: 'Deep Sleep' },
    { value: 'focus', label: 'Morning Focus' }
  ];

  const quickTags = [
    'Deep Sleep', 'Morning Focus', 'Stress Relief', 'Anxiety', 
    'Productivity', 'Creativity', 'Calm', 'Energy'
  ];

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [refreshTrigger]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your meditation goals');
      return;
    }

    setIsGenerating(true);
    
    try {
      const generatedScript = `Welcome to your ${technique} meditation session. Find a comfortable position and close your eyes. Let's begin by taking three deep breaths together...

This is a personalized meditation script for your "${prompt}" session. 

Take a moment to settle into your practice. Notice your breath flowing naturally in and out. With each exhale, allow yourself to relax more deeply.

${technique === 'mindfulness' ? 'Focus your attention on the present moment. Notice any thoughts that arise without judgment, then gently return your focus to your breath.' : ''}
${technique === 'breathing' ? 'Now we will practice deep breathing. Inhale slowly for a count of four, hold for four, then exhale for four. Continue this rhythm.' : ''}
${technique === 'body-scan' ? 'Starting from the top of your head, slowly scan down through your body. Notice any areas of tension and breathe into them.' : ''}
${technique === 'loving-kindness' ? 'Bring to mind someone you love. Send them thoughts of loving-kindness and well-being. Now extend these feelings to yourself.' : ''}
${technique === 'visualization' ? 'Imagine yourself in a peaceful place. See the colors, hear the sounds, feel the warmth or coolness around you.' : ''}
${technique === 'sleep' ? 'Allow your body to sink deeper into relaxation with each breath. Feel yourself floating into peaceful sleep.' : ''}
${technique === 'focus' ? 'Energize your mind and body for the day ahead. Feel clarity and focus flowing through you.' : ''}

Continue with this practice for the remainder of your ${duration}-minute session. When you're ready, slowly open your eyes and return to your day with a sense of peace and clarity.`;

      let audioUrl = null;
      try {
        const musicPrompt = `peaceful meditation music for ${technique} meditation, ${prompt}, ambient, calming, healing, therapeutic`;
        const fixedDuration = 30;
        
        const { data: musicData, error: musicError } = await supabase.functions.invoke('generate-meditation-music', {
          body: {
            prompt: musicPrompt,
            duration: fixedDuration
          }
        });

        if (musicData?.success && musicData?.audioUrl) {
          audioUrl = musicData.audioUrl;
          toast.success('Meditation music generated!');
        }
      } catch (musicError) {
        console.error('Error generating music:', musicError);
      }

      const { data: session, error: insertError } = await supabase
        .from('generated_sessions')
        .insert({
          title: sessionName,
          prompt,
          technique,
          duration,
          status: 'completed',
          script: generatedScript,
          audio_url: audioUrl
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        toast.error(`Failed to save session: ${insertError.message}`);
        return;
      }

      toast.success('Meditation session created successfully!');
      setPrompt('');
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('Session generation error:', error);
      toast.error('Failed to generate meditation session. Please try again.');
    } finally {
      setIsGenerating(false);
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

  const handlePlaySession = (sessionId: string) => {
    setCurrentlyPlaying(currentlyPlaying === sessionId ? null : sessionId);
  };

  const getFilteredSessions = () => {
    switch (libraryTab) {
      case 'music':
        return sessions.filter(session => session.audio_url);
      case 'sessions':
        return sessions.filter(session => session.script);
      case 'favorites':
        return [];
      default:
        return sessions;
    }
  };

  const getBackgroundImage = (technique: string) => {
    switch (technique.toLowerCase()) {
      case 'mindfulness':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'breathing':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'body-scan':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'loving-kindness':
        return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      case 'visualization':
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      case 'sleep':
        return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
      case 'focus':
        return 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  if (showChat) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <Button 
          variant="ghost" 
          onClick={() => setShowChat(false)}
          className="text-gray-300 hover:text-white hover:bg-gray-700 mb-4"
        >
          ← Back to Generator
        </Button>
        <h2 className="text-xl font-semibold text-white mb-4">AI Prompt Enhancement</h2>
        <div className="bg-gray-800 rounded-lg p-4">
          <ChatInterface onSoundRecommendation={handleChatEnrichment} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        {/* Left Sidebar - Generator */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex-shrink-0 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-xl font-semibold text-white mb-2">Meditation Session Generator</h1>
            
            {/* Session Selector */}
            <div className="relative">
              <Select value={sessionName} onValueChange={setSessionName}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                  <ChevronDown className="w-4 h-4" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CalmAI Session 1.0">CalmAI Session 1.0</SelectItem>
                  <SelectItem value="Custom Session">Custom Session</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-gray-700 p-1">
                <TabsTrigger 
                  value="meditation" 
                  className="flex-1 text-white data-[state=active]:bg-gray-600 data-[state=active]:text-white"
                >
                  Text to Meditation
                </TabsTrigger>
                <TabsTrigger 
                  value="sound" 
                  className="flex-1 text-gray-400 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
                >
                  Sound Reference
                </TabsTrigger>
              </TabsList>

              <TabsContent value="meditation" className="space-y-6 mt-6">
                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
                  <Textarea
                    placeholder="Please describe precise meditation goal of redefinition, mood, duration, background sounds, guidance style."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                    rows={5}
                  />
                </div>

                {/* Inspire Me Button */}
                <Button 
                  variant="outline"
                  onClick={() => setShowChat(true)}
                  className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
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
                      className="cursor-pointer border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => addQuickTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  {/* Duration */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Duration
                      </label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 min</SelectItem>
                          <SelectItem value="10">10 min</SelectItem>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="20">20 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Outputs */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Music className="w-4 h-4 inline mr-1" />
                        Outputs
                      </label>
                      <Select value="audio-script" onValueChange={() => {}}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="audio-script">Audio + Script</SelectItem>
                          <SelectItem value="audio-only">Audio Only</SelectItem>
                          <SelectItem value="script-only">Script Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Settings className="w-4 h-4 inline mr-1" />
                      High Fidelity
                    </label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
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
                <div className="text-center text-gray-400 py-8">
                  <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sound reference functionality coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Create Button */}
          <div className="p-6 border-t border-gray-700">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Creating Session...
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          </div>
        </div>
        
        {/* Right Panel - Session Library */}
        <div className="flex-1 overflow-hidden bg-gray-900 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <Tabs value={libraryTab} onValueChange={setLibraryTab}>
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
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : getFilteredSessions().length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-lg mb-2">No {libraryTab === 'all' ? 'sessions' : libraryTab} found</p>
                <p className="text-sm">Create your first meditation session to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getFilteredSessions().map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isPlaying={currentlyPlaying === session.id}
                    onPlay={() => handlePlaySession(session.id)}
                    backgroundImage={getBackgroundImage(session.technique)}
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

// Session Card Component
interface SessionCardProps {
  session: Session;
  isPlaying: boolean;
  onPlay: () => void;
  backgroundImage: string;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, isPlaying, onPlay, backgroundImage }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePlayPause = () => {
    if (!session.audio_url) {
      toast.info('No audio available for this session');
      return;
    }
    onPlay();
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleDownload = () => {
    if (session.script) {
      const element = document.createElement('a');
      const file = new Blob([session.script], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${session.title.replace(/\s+/g, '_')}_meditation_script.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Script downloaded!');
    } else {
      toast.info('No script available for download');
    }
  };

  return (
    <div 
      className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:bg-gray-750 transition-all duration-300 hover:scale-105 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square">
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{ background: backgroundImage }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="secondary"
            size="lg"
            className={`
              rounded-full w-16 h-16 p-0 bg-white/90 hover:bg-white text-gray-800
              transition-all duration-300 hover:scale-110
              ${isHovered ? 'opacity-100' : 'opacity-80'}
            `}
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`
            absolute top-2 right-2 rounded-full w-8 h-8 p-0 
            bg-black/50 hover:bg-black/70 text-white
            transition-all duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={handleFavorite}
        >
          <Heart 
            className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} 
          />
        </Button>

        {/* Waveform */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <AudioWaveform 
            isPlaying={isPlaying} 
            hasAudio={!!session.audio_url}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">
          {session.title}
        </h3>
        <p className="text-gray-400 text-xs">
          {session.duration} min
        </p>
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500 capitalize">
            {session.technique.replace('-', ' ')}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={handleDownload}
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
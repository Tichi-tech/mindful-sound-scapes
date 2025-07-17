import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wand2, Music, Clock, Sparkles, Play, Download, Heart, MessageCircle, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatInterface } from './chat/ChatInterface';

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
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('ambient');
  const [duration, setDuration] = useState('2-3');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
  const [showChat, setShowChat] = useState(false);

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

  const durations = [
    { value: '1-2', label: '1-2 minutes' },
    { value: '2-3', label: '2-3 minutes' },
    { value: '3-5', label: '3-5 minutes' },
    { value: '5-10', label: '5-10 minutes' },
    { value: '10-15', label: '10-15 minutes' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what kind of healing music you want to create');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create a demo track with local storage fallback
      const trackId = `demo-${Date.now()}`;
      const trackTitle = title || `Healing Music ${generatedTracks.length + 1}`;
      
      // Use demo audio based on style
      const demoAudioMap = {
        'ambient': '/audio/ambient-piano.mp3',
        'nature': '/audio/forest-rain.mp3',
        'binaural': '/audio/binaural-focus.mp3',
        'tibetan': '/audio/tibetan-bowls.mp3',
        'piano': '/audio/ambient-piano.mp3',
        'crystal': '/audio/white-noise.mp3',
        'meditation': '/audio/ocean-waves.mp3',
        'chakra': '/audio/tibetan-bowls.mp3'
      };
      
      const audioUrl = demoAudioMap[style as keyof typeof demoAudioMap] || '/audio/ambient-piano.mp3';
      
      // Try to save to database, but fallback to local state if it fails
      let savedToDatabase = false;
      try {
        const { data: track, error: insertError } = await supabase
          .from('generated_tracks')
          .insert({
            id: trackId,
            title: trackTitle,
            prompt,
            style,
            duration,
            status: 'completed',
            audio_url: audioUrl
          })
          .select()
          .single();

        if (!insertError) {
          savedToDatabase = true;
          console.log('Track saved to database:', track.id);
        }
      } catch (dbError) {
        console.warn('Database save failed, using local mode:', dbError);
      }

      const newTrack: GeneratedTrack = {
        id: trackId,
        title: trackTitle,
        prompt,
        duration,
        style,
        isGenerating: false,
        timestamp: new Date(),
        audioUrl // Add local audio URL
      };

      setGeneratedTracks(prev => [newTrack, ...prev]);
      
      if (savedToDatabase) {
        toast.success('Music track created and saved!');
      } else {
        toast.success('Music track created! (Demo mode - not saved to database)');
      }
      
      // Clear form
      setPrompt('');
      setTitle('');
    } catch (error) {
      console.error('Error generating music:', error);
      toast.error('Failed to generate music: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (url: string) => {
    try {
      console.log('Attempting to play audio from URL:', url);
      const audio = new Audio(url);
      audio.addEventListener('loadstart', () => console.log('Audio loading started'));
      audio.addEventListener('canplay', () => console.log('Audio can start playing'));
      audio.addEventListener('error', (e) => console.error('Audio element error:', e));
      
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

  const pollTrackStatus = async (trackId: string) => {
    const maxAttempts = 60; // Poll for up to 5 minutes
    let attempts = 0;

    const poll = async () => {
      try {
        const { data: track, error } = await supabase
          .from('generated_tracks')
          .select('*')
          .eq('id', trackId)
          .maybeSingle();

        if (error) {
          console.error('Error polling track status:', error);
          return;
        }

        if (!track) {
          console.error('Track not found:', trackId);
          return;
        }

        console.log('Track status update:', { id: trackId, status: track.status, audio_url: track.audio_url });

        setGeneratedTracks(prev => 
          prev.map(t => 
            t.id === trackId 
              ? { 
                  ...t, 
                  isGenerating: track.status === 'generating' || track.status === 'loading_model',
                  url: track.audio_url 
                }
              : t
          )
        );

        if (track.status === 'completed') {
          toast.success('Your healing music is ready!');
          return;
        } else if (track.status === 'failed') {
          toast.error('Music generation failed. Please try again.');
          return;
        } else if (track.status === 'loading_model') {
          toast.info('Model is loading, please wait...');
        }

        // Continue polling if still generating
        attempts++;
        if (attempts < maxAttempts && (track.status === 'generating' || track.status === 'loading_model')) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    poll();
  };

  const handleChatEnrichment = (enrichedPrompt: string) => {
    setPrompt(enrichedPrompt);
    setShowChat(false);
    toast.success('Prompt enriched by Indara AI! You can now generate your music.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* AI Chat Interface */}
      {showChat ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-800">AI Prompt Enhancement</h2>
            <Button 
              variant="outline" 
              onClick={() => setShowChat(false)}
              className="border-gray-300"
            >
              Back to Generator
            </Button>
          </div>
          <ChatInterface onSoundRecommendation={handleChatEnrichment} />
        </motion.div>
      ) : (
        <>
          {/* Generator Interface */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">Generate Healing Music</h2>
                <p className="text-gray-600">Describe your vision and let AI create the perfect healing soundscape</p>
                <div className="flex justify-center gap-3 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowChat(true)}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Get AI Help with Prompt
                  </Button>
                </div>
              </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Track Title (Optional)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Morning Meditation, Deep Sleep Journey..."
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Music Style
                </label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Healing Music
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Gentle rain sounds with soft piano melodies for deep relaxation and stress relief. Include subtle nature sounds like birds chirping in the distance..."
                  className="h-32 border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-medium"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Music...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Healing Music
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Generated Tracks */}
      {generatedTracks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800">Your Generated Music</h3>
          <div className="grid gap-4">
            {generatedTracks.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-gray-800">{track.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {styles.find(s => s.value === track.style)?.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {track.duration} min
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{track.prompt}</p>
                    <p className="text-xs text-gray-400">
                      Generated {track.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {track.isGenerating ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Generating...</span>
                      </div>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-blue-600"
                          onClick={() => (track.url || track.audioUrl) && playAudio(track.url || track.audioUrl!)}
                          disabled={!track.url && !track.audioUrl}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-green-600"
                          onClick={() => (track.url || track.audioUrl) && downloadAudio(track.url || track.audioUrl!, track.title)}
                          disabled={!track.url && !track.audioUrl}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Start Ideas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "Peaceful ocean waves with soft piano",
            "Forest rain with Tibetan singing bowls",
            "Gentle wind chimes for deep meditation", 
            "Calming nature sounds for sleep",
            "Binaural beats for focus and clarity",
            "Crystal bowl healing frequencies",
            "Zen garden ambience with water",
            "Chakra balancing sound journey"
          ].map((idea, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setPrompt(idea)}
              className="text-left h-auto p-3 text-gray-600 hover:text-blue-600 hover:border-blue-300"
            >
              <Music className="w-3 h-3 mr-2 flex-shrink-0" />
              <span className="text-xs leading-tight">{idea}</span>
            </Button>
          ))}
        </div>
          </Card>
        </>
      )}
    </div>
  );
};
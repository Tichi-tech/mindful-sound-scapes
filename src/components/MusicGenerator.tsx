import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wand2, Music, Clock, Sparkles, Play, Download, Heart, MessageCircle, Bot, Square } from 'lucide-react';
import { toast } from 'sonner';
import { ChatInterface } from './chat/ChatInterface';
import { ShareButtons } from './ui/share-buttons';
import { supabase } from '@/integrations/supabase/client';

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
  const [duration, setDuration] = useState('3');
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

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
          // Update the track in our local state
          setGeneratedTracks(prev => 
            prev.map(t => 
              t.id === trackId 
                ? { ...t, isGenerating: false, audioUrl: track.audio_url }
                : t
            )
          );
          toast.success('Music generation completed!');
        } else if (track.status === 'failed') {
          // Update track to show failed status
          setGeneratedTracks(prev => 
            prev.map(t => 
              t.id === trackId 
                ? { ...t, isGenerating: false }
                : t
            )
          );
          toast.error('Music generation failed. Please try again.');
        } else {
          // Still generating, check again in 5 seconds
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        console.error('Error polling for completion:', error);
        setTimeout(checkStatus, 5000);
      }
    };

    // Start polling after 10 seconds (give the function time to start)
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

  const durations = [
    { value: '3', label: '3 minutes' },
    { value: '5', label: '5 minutes' },
    { value: '10', label: '10 minutes' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what kind of healing music you want to create');
      return;
    }

    setIsGenerating(true);

    try {
      const trackTitle = title || `Healing Music ${generatedTracks.length + 1}`;
      
      // Call the actual MusicGen Supabase function
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

      // Create track with generating status
      const generatingTrack: GeneratedTrack = {
        id: result.trackId,
        title: trackTitle,
        prompt,
        duration,
        style,
        isGenerating: true,
        timestamp: new Date(),
        audioUrl: undefined
      };
      
      setGeneratedTracks(prev => [generatingTrack, ...prev]);
      toast.success('Music generation started! This may take 30-60 seconds for the first generation.');
      
      // Poll for completion
      pollForCompletion(result.trackId);
      
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

  const playAudio = (url: string, trackId: string) => {
    try {
      // If this track is currently playing, stop it
      if (currentlyPlaying === trackId && audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
        setCurrentlyPlaying(null);
        setAudioInstance(null);
        toast.success('Audio stopped');
        return;
      }

      // If another track is playing, stop it first
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }

      console.log('Starting to play audio from URL:', url);
      const audio = new Audio(url);

      // Set up event listeners
      audio.addEventListener('loadstart', () => console.log('Audio loading started'));
      audio.addEventListener('canplay', () => console.log('Audio can start playing'));
      audio.addEventListener('error', (e) => {
        console.error('Audio element error:', e);
        toast.error('Unable to play audio. Please try downloading the file.');
        setCurrentlyPlaying(null);
        setAudioInstance(null);
      });

      // When audio ends, reset state
      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
        setAudioInstance(null);
      });

      // Start playing
      audio.play().then(() => {
        setCurrentlyPlaying(trackId);
        setAudioInstance(audio);
        toast.success('Playing audio...');
      }).catch((error) => {
        console.error('Error playing audio:', error);
        toast.error('Unable to play audio. Please try downloading the file.');
        setCurrentlyPlaying(null);
        setAudioInstance(null);
      });

    } catch (error) {
      console.error('Error creating audio element:', error);
      toast.error('Unable to play audio. Please try downloading the file.');
      setCurrentlyPlaying(null);
      setAudioInstance(null);
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
            {generatedTracks.map((track) => {
              const isCurrentlyPlaying = currentlyPlaying === track.id;
              console.log(`Track ${track.id} - Currently playing: ${isCurrentlyPlaying}`);
              
              return (
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
                            className={`${currentlyPlaying === track.id ? 'text-red-600 hover:text-red-700 border border-red-200' : 'text-gray-600 hover:text-blue-600 border border-gray-200'}`}
                            onClick={() => (track.url || track.audioUrl) && playAudio(track.url || track.audioUrl!, track.id)}
                            disabled={!track.url && !track.audioUrl}
                            title={currentlyPlaying === track.id ? "Stop playing" : "Play audio"}
                          >
                            {currentlyPlaying === track.id ? (
                              <Square className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
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
                          <ShareButtons 
                            title={track.title}
                            description={`Generated healing music: ${track.prompt.slice(0, 100)}...`}
                            className="ml-2"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
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

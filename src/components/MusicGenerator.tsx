import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wand2, Music, Clock, Sparkles, Play, Download, Heart, MessageCircle, Bot } from 'lucide-react';
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
      const trackTitle = title || `Healing Music ${generatedTracks.length + 1}`;
      
      // Use demo audio based on style - these files exist in public folder
      const demoAudioMap = {
        'ambient': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        'nature': 'https://www.soundjay.com/misc/sounds/rain-02.wav',
        'binaural': 'https://www.soundjay.com/misc/sounds/wind-chimes-02.wav',
        'tibetan': 'https://www.soundjay.com/misc/sounds/meditation-bell.wav',
        'piano': 'https://www.soundjay.com/misc/sounds/zen-garden.wav',
        'crystal': 'https://www.soundjay.com/misc/sounds/white-noise.wav',
        'meditation': 'https://www.soundjay.com/misc/sounds/ocean-wave.wav',
        'chakra': 'https://www.soundjay.com/misc/sounds/singing-bowl.wav'
      };
      
      const audioUrl = demoAudioMap[style as keyof typeof demoAudioMap] || '/audio/ambient-piano.mp3';
      
      // Create local track (no database storage)
      const localTrack: GeneratedTrack = {
        id: `local-${Date.now()}`,
        title: trackTitle,
        prompt,
        duration,
        style,
        isGenerating: false,
        timestamp: new Date(),
        audioUrl
      };
      
      setGeneratedTracks(prev => [localTrack, ...prev]);
      toast.success('Healing music created successfully!');
      
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
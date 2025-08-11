import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, Lightbulb, Sparkles, Clock, Settings, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatInterface } from '../chat/ChatInterface';

interface GeneratorSidebarProps {
  onSessionCreated: () => void;
}

export const GeneratorSidebar: React.FC<GeneratorSidebarProps> = ({ onSessionCreated }) => {
  const [sessionName, setSessionName] = useState('CalmAI Session 1.0');
  const [prompt, setPrompt] = useState('');
  const [technique, setTechnique] = useState('mindfulness');
  const [duration, setDuration] = useState('10');
  const [quality, setQuality] = useState('high');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('meditation');

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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your meditation goals');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Starting meditation session generation...');
      
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

      // Generate meditation music
      console.log('Generating meditation music...');
      toast.info('Generating personalized meditation music...');
      
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

        if (musicError) {
          console.error('Music generation error:', musicError);
          toast.warning('Music generation failed, session created without audio');
        } else if (musicData?.success && musicData?.audioUrl) {
          audioUrl = musicData.audioUrl;
          console.log('Music generated successfully:', audioUrl);
          toast.success('Meditation music generated!');
        } else {
          console.error('Music generation failed:', musicData);
          toast.warning('Music generation failed, session created without audio');
        }
      } catch (musicError) {
        console.error('Error generating music:', musicError);
        toast.warning('Could not generate music, session created without audio');
      }

      // Save to database
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

      console.log('Session saved successfully:', session);
      toast.success('Meditation session created successfully!');
      
      // Clear form and notify parent
      setPrompt('');
      onSessionCreated();
      
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

  if (showChat) {
    return (
      <div className="h-full p-6 overflow-y-auto">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowChat(false)}
            className="text-gray-300 hover:text-white hover:bg-gray-700 mb-4"
          >
            ← Back to Generator
          </Button>
          <h2 className="text-xl font-semibold text-white mb-2">AI Prompt Enhancement</h2>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <ChatInterface onSoundRecommendation={handleChatEnrichment} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
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
  );
};
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wand2, Brain, Clock, Sparkles, Play, Download, Heart, MessageCircle, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatInterface } from './chat/ChatInterface';

interface GeneratedSession {
  id: string;
  title: string;
  prompt: string;
  duration: string;
  technique: string;
  script?: string;
  audioUrl?: string;
  isGenerating: boolean;
  timestamp: Date;
}

export const MeditationGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [technique, setTechnique] = useState('mindfulness');
  const [duration, setDuration] = useState('10-15');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSessions, setGeneratedSessions] = useState<GeneratedSession[]>([]);
  const [showChat, setShowChat] = useState(false);

  const techniques = [
    { value: 'mindfulness', label: 'Mindfulness Meditation' },
    { value: 'breathing', label: 'Breathing Exercises' },
    { value: 'body-scan', label: 'Body Scan' },
    { value: 'loving-kindness', label: 'Loving-Kindness' },
    { value: 'visualization', label: 'Visualization' },
    { value: 'progressive-relaxation', label: 'Progressive Relaxation' },
    { value: 'chakra', label: 'Chakra Meditation' },
    { value: 'mantra', label: 'Mantra Meditation' }
  ];

  const durations = [
    { value: '5-10', label: '5-10 minutes' },
    { value: '10-15', label: '10-15 minutes' },
    { value: '15-20', label: '15-20 minutes' },
    { value: '20-30', label: '20-30 minutes' },
    { value: '30-45', label: '30-45 minutes' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what kind of meditation session you want to create');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Starting meditation session generation...');
      
      // Insert session record into database
      const sessionData = {
        title: title || `Meditation Session ${generatedSessions.length + 1}`,
        prompt,
        technique,
        duration,
        status: 'generating'
      };
      
      console.log('Inserting session data:', sessionData);
      
      const { data: session, error: insertError } = await supabase
        .from('generated_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        toast.error('Failed to create session in database: ' + insertError.message);
        throw new Error('Failed to create session record');
      }
      
      console.log('Session created successfully:', session);

      const newSession: GeneratedSession = {
        id: session.id,
        title: session.title,
        prompt: session.prompt,
        duration: session.duration,
        technique: session.technique,
        isGenerating: true,
        timestamp: new Date(session.created_at)
      };

      setGeneratedSessions(prev => [newSession, ...prev]);
      
      toast.success('Meditation session generation started! This may take a few moments...');
      
      // Simulate generation process and update database
      setTimeout(async () => {
        const generatedScript = `Welcome to your ${technique} meditation session. Find a comfortable position and close your eyes. Let's begin by taking three deep breaths together...

This is a sample meditation script generated for your "${prompt}" session. The actual implementation would use AI to create personalized guided meditation content.

Take a moment to settle into your practice...`;

        // Update database with generated script
        const { error: updateError } = await supabase
          .from('generated_sessions')
          .update({ 
            script: generatedScript,
            status: 'completed'
          })
          .eq('id', session.id);

        if (updateError) {
          console.error('Database update error:', updateError);
        }

        setGeneratedSessions(prev => 
          prev.map(s => 
            s.id === session.id 
              ? { 
                  ...s, 
                  isGenerating: false,
                  script: generatedScript
                }
              : s
          )
        );
        toast.success('Your meditation session is ready!');
      }, 3000);
      
      // Clear form
      setPrompt('');
      setTitle('');
      
    } catch (error) {
      console.error('Session generation error:', error);
      toast.error('Failed to generate meditation session. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playSession = (script: string) => {
    // For now, just show the script. In a real implementation, this would use text-to-speech
    toast.info('Text-to-speech playback coming soon!');
  };

  const downloadSession = (session: GeneratedSession) => {
    const element = document.createElement('a');
    const file = new Blob([session.script || ''], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${session.title.replace(/\s+/g, '_')}_meditation_script.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Meditation script downloaded!');
  };

  const handleChatEnrichment = (enrichedPrompt: string) => {
    setPrompt(enrichedPrompt);
    setShowChat(false);
    toast.success('Prompt enriched by Indara AI! You can now generate your meditation session.');
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
                <h2 className="text-3xl font-bold text-gray-800">Generate Meditation Session</h2>
                <p className="text-gray-600">Describe your meditation goals and let AI create a personalized guided session</p>
                <div className="flex justify-center gap-3 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowChat(true)}
                    className="border-green-300 text-green-600 hover:bg-green-50"
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
                      Session Title (Optional)
                    </label>
                    <Input
                      placeholder="e.g., Morning Mindfulness Session"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border-gray-300 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meditation Technique
                    </label>
                    <Select value={technique} onValueChange={setTechnique}>
                      <SelectTrigger className="border-gray-300 focus:ring-green-500 focus:border-green-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {techniques.map((tech) => (
                          <SelectItem key={tech.value} value={tech.value}>
                            {tech.label}
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
                      <SelectTrigger className="border-gray-300 focus:ring-green-500 focus:border-green-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((dur) => (
                          <SelectItem key={dur.value} value={dur.value}>
                            {dur.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe Your Meditation Goals
                    </label>
                    <Textarea
                      placeholder="e.g., I want to reduce stress and anxiety, focus on breathing, and find inner peace..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] border-gray-300 focus:ring-green-500 focus:border-green-500"
                      rows={5}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-3"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating Session...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Meditation Session
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Start Ideas */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Quick Start Ideas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "Help me reduce stress and anxiety",
                "Guide me through breathing exercises",
                "Body scan for deep relaxation",
                "Loving-kindness meditation for compassion",
                "Visualization for positive energy",
                "Chakra balancing session"
              ].map((idea, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(idea)}
                  className="text-left justify-start bg-white/80 border-green-200 hover:bg-green-100 text-green-700"
                >
                  {idea}
                </Button>
              ))}
            </div>
          </Card>

          {/* Generated Sessions */}
          {generatedSessions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">Your Generated Sessions</h3>
              <div className="grid gap-6">
                {generatedSessions.map((session) => (
                  <Card key={session.id} className="p-6 bg-white/90 backdrop-blur-sm border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-800">{session.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{session.prompt}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="border-green-200 text-green-600">
                            <Brain className="w-3 h-3 mr-1" />
                            {techniques.find(t => t.value === session.technique)?.label}
                          </Badge>
                          <Badge variant="outline" className="border-blue-200 text-blue-600">
                            <Clock className="w-3 h-3 mr-1" />
                            {session.duration} min
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {session.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {session.isGenerating ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-600">Generating your meditation session...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {session.script && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700 line-clamp-3">{session.script}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => playSession(session.script!)}
                            className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Play Session
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadSession(session)}
                            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Script
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Brain, ArrowLeft } from 'lucide-react';
import { MusicGenerator } from './MusicGenerator';
import { MeditationGenerator } from './MeditationGenerator';

type GeneratorType = 'music' | 'meditation' | null;

export const GeneratorSelection: React.FC = () => {
  const [selectedGenerator, setSelectedGenerator] = useState<GeneratorType>(null);

  if (selectedGenerator === 'music') {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => setSelectedGenerator(null)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Generator Selection
        </Button>
        <MusicGenerator />
      </div>
    );
  }

  if (selectedGenerator === 'meditation') {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => setSelectedGenerator(null)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Generator Selection
        </Button>
        <MeditationGenerator />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Choose Your Generator
        </h1>
        <p className="text-xl text-muted-foreground">
          Select what you'd like to create today
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'var(--gradient-meditation)' }}>
                <Music className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Generate Healing Music
              </CardTitle>
              <CardDescription className="text-lg">
                Create personalized healing music tracks
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Generate ambient, nature sounds, binaural beats, and more to support your wellness journey.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multiple healing music styles</li>
                <li>• Customizable duration</li>
                <li>• AI-powered generation</li>
                <li>• High-quality audio output</li>
              </ul>
              <Button
                onClick={() => setSelectedGenerator('music')}
                className="w-full mt-6 text-white"
                style={{ background: 'var(--gradient-meditation)' }}
              >
                Start Generating Music
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'var(--gradient-meditation)' }}>
                <Brain className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Generate Meditation Session
              </CardTitle>
              <CardDescription className="text-lg">
                Create guided meditation experiences
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Generate personalized guided meditation sessions tailored to your specific needs and goals.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Guided meditation scripts</li>
                <li>• Various meditation techniques</li>
                <li>• Customizable session length</li>
                <li>• Voice-guided experience</li>
              </ul>
              <Button
                onClick={() => setSelectedGenerator('meditation')}
                className="w-full mt-6 text-white"
                style={{ background: 'var(--gradient-meditation)' }}
              >
                Start Generating Sessions
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
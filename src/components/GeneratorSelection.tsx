import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Brain, ArrowLeft } from 'lucide-react';
import { MusicGenerator } from './MusicGenerator';

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
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Generate Meditation Session
              </CardTitle>
              <CardDescription className="text-lg">
                Create personalized guided meditation sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">
                Meditation session generator coming soon!
              </p>
              <p className="text-sm text-gray-500">
                This feature will allow you to create custom guided meditation sessions
                tailored to your specific needs and preferences.
              </p>
            </CardContent>
          </Card>
        </div>
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Choose Your Generator
        </h1>
        <p className="text-xl text-gray-600">
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
              <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Music className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Generate Healing Music
              </CardTitle>
              <CardDescription className="text-lg">
                Create personalized healing music tracks
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Generate ambient, nature sounds, binaural beats, and more to support your wellness journey.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Multiple healing music styles</li>
                <li>• Customizable duration</li>
                <li>• AI-powered generation</li>
                <li>• High-quality audio output</li>
              </ul>
              <Button
                onClick={() => setSelectedGenerator('music')}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
              <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Generate Meditation Session
              </CardTitle>
              <CardDescription className="text-lg">
                Create guided meditation experiences
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Generate personalized guided meditation sessions tailored to your specific needs and goals.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Guided meditation scripts</li>
                <li>• Various meditation techniques</li>
                <li>• Customizable session length</li>
                <li>• Voice-guided experience</li>
              </ul>
              <Button
                onClick={() => setSelectedGenerator('meditation')}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                disabled
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
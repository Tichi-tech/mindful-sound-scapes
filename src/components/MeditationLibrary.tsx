
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Square } from 'lucide-react';

interface Sound {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  color: string;
}

interface MeditationLibraryProps {
  onSoundSelect: (soundId: string) => void;
  selectedSound: string | null;
  expanded?: boolean;
}

export const MeditationLibrary: React.FC<MeditationLibraryProps> = ({ 
  onSoundSelect, 
  selectedSound, 
  expanded = false 
}) => {
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  const handleSoundClick = (soundId: string) => {
    if (playingSound === soundId) {
      // Stop current sound
      setPlayingSound(null);
      onSoundSelect('');
    } else {
      // Play new sound
      setPlayingSound(soundId);
      onSoundSelect(soundId);
    }
  };
  const sounds: Sound[] = [
    {
      id: 'ocean-waves',
      name: 'Ocean Waves',
      description: 'Gentle waves lapping against the shore',
      category: 'Nature',
      duration: '30 min',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'forest-rain',
      name: 'Forest Rain',
      description: 'Soft rainfall in a peaceful forest',
      category: 'Nature',
      duration: '45 min',
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 'tibetan-bowls',
      name: 'Tibetan Singing Bowls',
      description: 'Traditional meditation bowl sounds',
      category: 'Spiritual',
      duration: '20 min',
      color: 'from-purple-400 to-violet-500'
    },
    {
      id: 'binaural-focus',
      name: 'Binaural Focus',
      description: '40Hz binaural beats for concentration',
      category: 'Binaural',
      duration: '60 min',
      color: 'from-orange-400 to-red-500'
    },
    {
      id: 'white-noise',
      name: 'White Noise',
      description: 'Pure white noise for sleep',
      category: 'Ambient',
      duration: '8 hours',
      color: 'from-gray-400 to-slate-500'
    },
    {
      id: 'piano-ambient',
      name: 'Ambient Piano',
      description: 'Soft piano melodies with reverb',
      category: 'Music',
      duration: '35 min',
      color: 'from-pink-400 to-rose-500'
    }
  ];

  const displaySounds = expanded ? sounds : sounds.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">
          {expanded ? 'Complete Sound Library' : 'Popular Sounds'}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Volume2 className="w-4 h-4" />
          <span>{sounds.length} sounds available</span>
        </div>
      </div>

      <div className={`grid gap-4 ${expanded ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {displaySounds.map((sound, index) => (
          <motion.div
            key={sound.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card 
              className={`p-4 cursor-pointer transition-all duration-300 border-2 ${
                playingSound === sound.id 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white/60'
              } backdrop-blur-sm`}
              onClick={() => handleSoundClick(sound.id)}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${sound.color} flex items-center justify-center`}>
                  {playingSound === sound.id ? (
                    <Square className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800">{sound.name}</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {sound.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{sound.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{sound.duration}</span>
                    {playingSound === sound.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center space-x-1 text-blue-600"
                      >
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-xs font-medium">Playing</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {!expanded && sounds.length > 4 && (
        <div className="text-center">
          <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-50">
            View All {sounds.length} Sounds
          </Button>
        </div>
      )}
    </div>
  );
};

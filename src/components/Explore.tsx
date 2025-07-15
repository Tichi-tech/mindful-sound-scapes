import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, Heart, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export const Explore: React.FC = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const genres = [
    'meditation', 'ambient', 'healing', 'nature sounds', 'binaural beats',
    'chakra healing', 'sleep sounds', 'forest sounds', 'ocean waves',
    'tibetan bowls', 'rain sounds', 'white noise', 'pink noise',
    'crystal bowls', 'didgeridoo', 'singing bowls', 'wind chimes',
    'breathing exercises', 'mindfulness', 'yoga sounds', 'spa music',
    'zen garden', 'waterfall', 'thunder', 'campfire', 'birds chirping',
    'whale songs', 'monk chanting', 'ethereal pads', 'drone sounds',
    'healing frequencies', '528hz', '432hz', 'solfeggio', 'shamanic drums'
  ];

  const featuredTracks = [
    {
      id: '1',
      title: 'Deep Ocean Meditation',
      artist: 'Healing Waves',
      genre: 'ambient',
      duration: '12:34',
      plays: '2.1K',
      likes: 156
    },
    {
      id: '2',
      title: 'Forest Rain Therapy',
      artist: 'Nature Sounds',
      genre: 'nature sounds',
      duration: '8:45',
      plays: '1.8K',
      likes: 203
    },
    {
      id: '3',
      title: 'Tibetan Healing Bowls',
      artist: 'Sacred Sounds',
      genre: 'healing',
      duration: '15:20',
      plays: '3.2K',
      likes: 287
    },
    {
      id: '4',
      title: 'Chakra Alignment',
      artist: 'Energy Healing',
      genre: 'meditation',
      duration: '22:15',
      plays: '5.4K',
      likes: 432
    }
  ];

  const handlePlay = (trackId: string) => {
    setCurrentlyPlaying(currentlyPlaying === trackId ? null : trackId);
  };

  const getRandomPosition = (index: number) => {
    const positions = [
      { top: '10%', left: '15%' },
      { top: '20%', right: '10%' },
      { top: '35%', left: '8%' },
      { top: '45%', right: '20%' },
      { top: '60%', left: '25%' },
      { top: '70%', right: '15%' },
      { top: '80%', left: '10%' },
      { top: '15%', left: '45%' },
      { top: '30%', right: '35%' },
      { top: '50%', left: '60%' },
      { top: '65%', right: '40%' },
      { top: '75%', left: '55%' },
    ];
    return positions[index % positions.length];
  };

  const getRandomColor = (index: number) => {
    const colors = [
      'text-blue-400', 'text-purple-400', 'text-green-400', 'text-yellow-400',
      'text-pink-400', 'text-indigo-400', 'text-teal-400', 'text-orange-400',
      'text-red-400', 'text-cyan-400', 'text-violet-400', 'text-emerald-400'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Floating Genre Tags */}
      <div className="absolute inset-0 pointer-events-none">
        {genres.map((genre, index) => (
          <motion.div
            key={genre}
            className={`absolute text-sm font-medium ${getRandomColor(index)} opacity-60 hover:opacity-100 transition-opacity cursor-pointer pointer-events-auto`}
            style={getRandomPosition(index)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1, opacity: 1 }}
          >
            {genre}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Explore new sounds of
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              healing with Indara
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Discover trending meditation and healing music created by our community
            </p>
          </motion.div>

          {/* Featured Tracks */}
          <motion.div
            className="grid gap-6 md:grid-cols-2 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {featuredTracks.map((track) => (
              <Card key={track.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {track.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-2">
                        by {track.artist}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{track.genre}</span>
                        <span>{track.duration}</span>
                        <span>{track.plays} plays</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                      onClick={() => handlePlay(track.id)}
                    >
                      {currentlyPlaying === track.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400 hover:bg-transparent"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {track.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-blue-400 hover:bg-transparent"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                    >
                      <Volume2 className="w-4 h-4 mr-1" />
                      Listen
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create Your Own
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
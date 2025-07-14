
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Howl } from 'howler';

interface AudioPlayerProps {
  selectedSound: string | null;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ selectedSound }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const howlRef = useRef<Howl | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real audio files from public folder
  const soundData: Record<string, { name: string; url: string; description: string }> = {
    'ocean-waves': {
      name: 'Ocean Waves',
      url: '/audio/ocean-waves.wav',
      description: 'Gentle waves lapping against the shore'
    },
    'forest-rain': {
      name: 'Forest Rain',
      url: '/audio/forest-rain.wav',
      description: 'Soft rainfall in a peaceful forest'
    },
    'tibetan-bowls': {
      name: 'Tibetan Singing Bowls',
      url: '/audio/tibetan-bowls.wav',
      description: 'Traditional meditation bowl sounds'
    },
    'binaural-focus': {
      name: 'Binaural Focus',
      url: '/audio/binaural-focus.wav',
      description: '40Hz binaural beats for concentration'
    },
    'white-noise': {
      name: 'White Noise',
      url: '/audio/white-noise.wav',
      description: 'Pure white noise for sleep'
    },
    'piano-ambient': {
      name: 'Ambient Piano',
      url: '/audio/ambient-piano.wav',
      description: 'Soft piano melodies with reverb'
    }
  };

  useEffect(() => {
    if (selectedSound && soundData[selectedSound]) {
      // Clean up previous sound
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
      }

      // Load actual audio files
      console.log(`Loading sound: ${soundData[selectedSound].name}`);
      
      setCurrentTime(0);
      setIsPlaying(false);

      howlRef.current = new Howl({
        src: [soundData[selectedSound].url],
        volume: volume[0] / 100,
        loop: true,
        onload: () => {
          setDuration(howlRef.current?.duration() || 0);
        },
        onplay: () => {
          setIsPlaying(true);
          startTimeUpdate();
        },
        onpause: () => {
          setIsPlaying(false);
          stopTimeUpdate();
        },
        onstop: () => {
          setIsPlaying(false);
          setCurrentTime(0);
          stopTimeUpdate();
        },
        onloaderror: (id, error) => {
          console.error('Audio load error:', error);
        },
        onplayerror: (id, error) => {
          console.error('Audio play error:', error);
        }
      });
    }

    return () => {
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
      }
      stopTimeUpdate();
    };
  }, [selectedSound]);

  const startTimeUpdate = () => {
    intervalRef.current = setInterval(() => {
      if (howlRef.current && isPlaying) {
        setCurrentTime(howlRef.current.seek() as number);
      }
    }, 1000);
  };

  const stopTimeUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlay = () => {
    if (!selectedSound) return;

    // Use actual audio playback
    if (howlRef.current) {
      if (isPlaying) {
        howlRef.current.pause();
      } else {
        howlRef.current.play();
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (howlRef.current) {
      howlRef.current.volume(newVolume[0] / 100);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (howlRef.current) {
      howlRef.current.mute(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSound = selectedSound ? soundData[selectedSound] : null;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Audio Player</h3>
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              {isMuted ? 'Muted' : `${volume[0]}%`}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentSound ? (
            <motion.div
              key={selectedSound}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Now Playing Info */}
              <div className="text-center space-y-2">
                <h4 className="font-medium text-gray-800">{currentSound.name}</h4>
                <p className="text-sm text-gray-600">{currentSound.description}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 rounded-full"
                  disabled
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 rounded-full"
                  disabled
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {isMuted || volume[0] === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>

                <div className="flex-1">
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                </div>

                <span className="text-sm text-gray-600 min-w-[3rem] text-right">
                  {volume[0]}%
                </span>
              </div>

              {/* Status */}
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center space-x-2 text-green-600"
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Now Playing</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a sound from the library to start your meditation</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, Download } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';
import { toast } from 'sonner';

interface Session {
  id: string;
  title: string;
  prompt: string;
  duration: string;
  technique: string;
  script?: string;
  audio_url?: string;
  created_at: string;
}

interface SessionCardProps {
  session: Session;
  isPlaying: boolean;
  onPlay: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isPlaying,
  onPlay
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create or update audio element when session changes
  useEffect(() => {
    if (session.audio_url && !audioRef.current) {
      audioRef.current = new Audio(session.audio_url);
      audioRef.current.addEventListener('ended', () => {
        onPlay(); // This will set isPlaying to false
      });
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error for session:', session.title, e);
        toast.error('Failed to load audio');
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('error', () => {});
      }
    };
  }, [session.audio_url, session.title, onPlay]);

  // Handle play/pause state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error('Failed to play audio:', e);
          toast.error('Failed to play audio');
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!session.audio_url) {
      toast.info('No audio available for this session');
      return;
    }
    onPlay();
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleDownload = () => {
    if (session.script) {
      const element = document.createElement('a');
      const file = new Blob([session.script], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${session.title.replace(/\s+/g, '_')}_meditation_script.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Script downloaded!');
    } else {
      toast.info('No script available for download');
    }
  };

  // Generate a background image based on technique
  const getBackgroundImage = () => {
    const technique = session.technique.toLowerCase();
    switch (technique) {
      case 'mindfulness':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'breathing':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'body-scan':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'loving-kindness':
        return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      case 'visualization':
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      case 'sleep':
        return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
      case 'focus':
        return 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  return (
    <Card 
      className="bg-gray-800 border-gray-700 overflow-hidden hover:bg-gray-750 transition-all duration-300 hover:scale-105 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square">
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{ background: getBackgroundImage() }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="secondary"
            size="lg"
            className={`
              rounded-full w-16 h-16 p-0 bg-white/90 hover:bg-white text-gray-800
              transition-all duration-300 hover:scale-110
              ${isHovered ? 'opacity-100' : 'opacity-80'}
            `}
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`
            absolute top-2 right-2 rounded-full w-8 h-8 p-0 
            bg-black/50 hover:bg-black/70 text-white
            transition-all duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={handleFavorite}
        >
          <Heart 
            className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} 
          />
        </Button>

        {/* Waveform */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <AudioWaveform 
            isPlaying={isPlaying} 
            hasAudio={!!session.audio_url}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">
          {session.title}
        </h3>
        <p className="text-gray-400 text-xs">
          {session.duration} min
        </p>
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500 capitalize">
            {session.technique.replace('-', ' ')}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={handleDownload}
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
import React from 'react';
import { Heart, Play, Download, Clock, User, Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommunityTrack {
  id: string;
  title: string;
  type: 'music' | 'meditation' | 'collection';
  duration: string;
  plays: number;
  likes: number;
  creator: string;
  createdAt: string;
  thumbnail: string;
  tags: string[];
  featured?: boolean;
}

const mockTracks: CommunityTrack[] = [
  {
    id: '1',
    title: 'Deep Ocean Meditation',
    type: 'meditation',
    duration: '15:30',
    plays: 1240,
    likes: 87,
    creator: 'Sarah Chen',
    createdAt: '2h ago',
    thumbnail: '/lovable-uploads/61365487-5f27-498b-b7d6-6abfa41bf77c.png',
    tags: ['sleep', 'ocean', 'calm'],
    featured: true,
  },
  {
    id: '2',
    title: 'Forest Rain Healing',
    type: 'music',
    duration: '12:45',
    plays: 856,
    likes: 64,
    creator: 'Alex Rivers',
    createdAt: '4h ago',
    thumbnail: '/lovable-uploads/3357473d-ea2d-4c95-9653-adc79c46974b.png',
    tags: ['nature', 'rain', 'healing'],
  },
  {
    id: '3',
    title: 'Morning Clarity Collection',
    type: 'collection',
    duration: '45:00',
    plays: 2100,
    likes: 156,
    creator: 'Meditation Studio',
    createdAt: '1d ago',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    tags: ['morning', 'focus', 'energy'],
  },
  {
    id: '4',
    title: 'Tibetan Bowls Session',
    type: 'meditation',
    duration: '20:15',
    plays: 695,
    likes: 43,
    creator: 'Zen Master',
    createdAt: '6h ago',
    thumbnail: 'https://images.unsplash.com/photo-1602192509154-0b900ee1f851?w=400&h=300&fit=crop',
    tags: ['tibetan', 'bowls', 'chakra'],
  },
  {
    id: '5',
    title: 'Binaural Focus Beats',
    type: 'music',
    duration: '30:00',
    plays: 1580,
    likes: 92,
    creator: 'BrainWave Pro',
    createdAt: '8h ago',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
    tags: ['binaural', 'focus', 'productivity'],
  },
  {
    id: '6',
    title: 'Sunset Piano Meditation',
    type: 'music',
    duration: '18:20',
    plays: 1120,
    likes: 78,
    creator: 'Piano Zen',
    createdAt: '12h ago',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    tags: ['piano', 'sunset', 'peaceful'],
  },
];

interface CommunityGridProps {
  onTrackSelect?: (track: CommunityTrack) => void;
}

export const CommunityGrid: React.FC<CommunityGridProps> = ({ onTrackSelect }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meditation': return <Headphones className="w-3 h-3" />;
      case 'collection': return <Clock className="w-3 h-3" />;
      default: return <Play className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meditation': return 'bg-accent/10 text-accent';
      case 'collection': return 'bg-secondary/10 text-secondary';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Featured Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured Creations</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTracks.filter(track => track.featured).map((track) => (
            <Card 
              key={track.id} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => onTrackSelect?.(track)}
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={track.thumbnail} 
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary" className="rounded-full w-12 h-12 p-0">
                    <Play className="w-4 h-4 fill-current" />
                  </Button>
                </div>
                <Badge className={`absolute top-2 left-2 ${getTypeColor(track.type)}`}>
                  {getTypeIcon(track.type)}
                  <span className="ml-1 capitalize">{track.type}</span>
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-2 line-clamp-2">{track.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <User className="w-3 h-3" />
                  <span>{track.creator}</span>
                  <span>•</span>
                  <span>{track.createdAt}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {track.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      <span>{track.plays.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{track.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{track.duration}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Creations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Community Creations</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Latest</Button>
            <Button variant="outline" size="sm">Popular</Button>
            <Button variant="outline" size="sm">Trending</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockTracks.slice(1).map((track) => (
            <Card 
              key={track.id} 
              className="group hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onTrackSelect?.(track)}
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={track.thumbnail} 
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary" className="rounded-full w-10 h-10 p-0">
                    <Play className="w-3 h-3 fill-current" />
                  </Button>
                </div>
                <Badge className={`absolute top-2 left-2 text-xs ${getTypeColor(track.type)}`}>
                  {getTypeIcon(track.type)}
                </Badge>
              </div>
              
              <CardContent className="p-3">
                <h3 className="font-medium text-sm mb-1 line-clamp-2">{track.title}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <User className="w-3 h-3" />
                  <span className="truncate">{track.creator}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      <span>{track.plays > 1000 ? `${Math.floor(track.plays/1000)}k` : track.plays}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{track.likes}</span>
                    </div>
                  </div>
                  <span>{track.duration}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
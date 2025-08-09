import React from 'react';
import { Heart, Play, Download, Clock, User, Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCommunityTracks } from '@/hooks/useCommunityTracks';
import type { CommunityTrack } from '@/hooks/useCommunityTracks';

interface CommunityGridProps {
  onTrackSelect?: (track: CommunityTrack) => void;
}

export const CommunityGrid: React.FC<CommunityGridProps> = ({ onTrackSelect }) => {
  const { tracks, loading, error } = useCommunityTracks();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg aspect-video mb-3"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load tracks: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const featuredTracks = tracks.filter(track => track.featured);
  const allTracks = tracks.slice(0, 12); // Show first 12 tracks
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
      {featuredTracks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Featured Creations</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTracks.map((track) => (
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
      )}

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
          {allTracks.map((track) => (
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
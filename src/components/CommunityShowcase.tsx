import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import healingMusic1 from '@/assets/healing-music-1.jpg';
import healingMusic2 from '@/assets/healing-music-2.jpg';
import healingMusic3 from '@/assets/healing-music-3.jpg';
import healingMusic4 from '@/assets/healing-music-4.jpg';
import healingMusic5 from '@/assets/healing-music-5.jpg';
import healingMusic6 from '@/assets/healing-music-6.jpg';

type Track = Tables<'generated_tracks'>;

interface CommunityShowcaseProps {
  onTrackSelect?: (track: Track) => void;
}

export const CommunityShowcase: React.FC<CommunityShowcaseProps> = ({ onTrackSelect }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const healingImages = [
    healingMusic1,
    healingMusic2, 
    healingMusic3,
    healingMusic4,
    healingMusic5,
    healingMusic6
  ];

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        // First try to get featured tracks
        const { data: featuredData, error: featuredError } = await supabase
          .from('generated_tracks')
          .select('*')
          .eq('status', 'completed')
          .eq('is_featured', true)
          .not('audio_url', 'is', null)
          .order('admin_rating', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6);

        if (featuredError) throw featuredError;

        // If we have fewer than 6 featured tracks, fill with recent tracks
        let allTracks = featuredData || [];
        
        if (allTracks.length < 6) {
          let recentQuery = supabase
            .from('generated_tracks')
            .select('*')
            .eq('status', 'completed')
            .not('audio_url', 'is', null);
          
          // Only exclude featured tracks if we have any
          if (allTracks.length > 0) {
            const featuredIds = allTracks.map(t => t.id);
            recentQuery = recentQuery.not('id', 'in', `(${featuredIds.map(id => `'${id}'`).join(',')})`);
          }
          
          const { data: recentData, error: recentError } = await recentQuery
            .order('created_at', { ascending: false })
            .limit(6 - allTracks.length);

          if (recentError) throw recentError;
          allTracks = [...allTracks, ...(recentData || [])];
        }

        setTracks(allTracks.slice(0, 6));
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  const formatDuration = (duration: string) => {
    // Convert duration string to a more readable format
    return duration.includes(':') ? duration : `${duration}s`;
  };

  const getRandomPlayCount = () => {
    // Generate random play count for demo purposes
    return Math.floor(Math.random() * 100000) + 1000;
  };

  const getRandomLikes = () => {
    // Generate random likes for demo purposes
    return Math.floor(Math.random() * 5000) + 100;
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Community Creations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover amazing healing music created by our community
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (tracks.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Community Creations</h2>
          <p className="text-muted-foreground">
            No tracks have been created yet. Be the first to generate some healing music!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">Community Creations</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover amazing healing music created by our community
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 hover-scale">
                <div className="relative aspect-square rounded-t-lg overflow-hidden">
                  <img 
                    src={healingImages[index % healingImages.length]} 
                    alt={`Healing music artwork for ${track.title}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-16 w-16 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-200 group-hover:scale-110"
                      onClick={() => onTrackSelect?.(track)}
                    >
                      <Play className="h-6 w-6 ml-1" />
                    </Button>
                  </div>
                  
                  {/* Style badge and featured badge */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm rounded-full">
                      {track.style}
                    </span>
                    {track.is_featured && (
                      <span className="px-2 py-1 text-xs font-medium bg-secondary/80 backdrop-blur-sm rounded-full text-secondary-foreground">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {track.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {track.prompt}
                  </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{getRandomPlayCount().toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{getRandomLikes().toLocaleString()}</span>
                        </div>
                        {track.admin_rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">★ {track.admin_rating}/5</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" className="hover-scale">
            Explore More Tracks
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
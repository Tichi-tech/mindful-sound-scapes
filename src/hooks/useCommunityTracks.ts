import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseTrack {
  id: string;
  title: string;
  prompt: string;
  style: string;
  duration: string;
  audio_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean | null;
  user_id: string | null;
}

export interface CommunityTrack {
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
  audio_url?: string;
}

export const useCommunityTracks = () => {
  const [tracks, setTracks] = useState<CommunityTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('generated_tracks')
        .select('*')
        .eq('status', 'completed')
        .not('audio_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedTracks: CommunityTrack[] = (data || []).map((track: DatabaseTrack, index) => {
        // Extract mood/tags from prompt
        const tags = track.prompt.toLowerCase().split(' ').filter(word => 
          ['meditation', 'sleep', 'calm', 'focus', 'rain', 'ocean', 'forest', 'piano', 'ambient', 'healing', 'nature', 'relaxation'].includes(word)
        ).slice(0, 3);

        // Determine type based on style and prompt
        let type: 'music' | 'meditation' | 'collection' = 'music';
        if (track.prompt.toLowerCase().includes('meditation')) {
          type = 'meditation';
        }

        // Generate mock engagement data (in a real app, this would come from the database)
        const mockPlays = Math.floor(Math.random() * 2000) + 500;
        const mockLikes = Math.floor(Math.random() * 200) + 20;

        // Use placeholder images
        const thumbnails = [
          '/lovable-uploads/61365487-5f27-498b-b7d6-6abfa41bf77c.png',
          '/lovable-uploads/3357473d-ea2d-4c95-9653-adc79c46974b.png',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1602192509154-0b900ee1f851?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
        ];

        return {
          id: track.id,
          title: track.title,
          type,
          duration: `${track.duration} min` || '2-3 min',
          plays: mockPlays,
          likes: mockLikes,
          creator: 'Indara AI',
          createdAt: formatTimeAgo(track.created_at),
          thumbnail: thumbnails[index % thumbnails.length],
          tags: tags.length > 0 ? tags : [track.style, 'healing'],
          featured: track.is_featured || false,
          audio_url: track.audio_url || undefined
        };
      });

      setTracks(transformedTracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  return { tracks, loading, error, refetch: fetchTracks };
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
};
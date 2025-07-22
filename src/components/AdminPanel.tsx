import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Star, Music, Calendar, User, MessageSquare } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Track = Tables<'generated_tracks'>;

export const AdminPanel: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingTracks();
  }, []);

  const fetchPendingTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .select('*')
        .eq('status', 'completed')
        .not('audio_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast({
        title: "Error",
        description: "Failed to load tracks for review",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (trackId: string, value: number) => {
    setRating(prev => ({ ...prev, [trackId]: value }));
  };

  const handleNotesChange = (trackId: string, value: string) => {
    setNotes(prev => ({ ...prev, [trackId]: value }));
  };

  const handleFeatureToggle = async (trackId: string, currentlyFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('generated_tracks')
        .update({
          is_featured: !currentlyFeatured,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', trackId);

      if (error) throw error;

      setTracks(prev => prev.map(track => 
        track.id === trackId 
          ? { ...track, is_featured: !currentlyFeatured }
          : track
      ));

      toast({
        title: "Success",
        description: `Track ${!currentlyFeatured ? 'featured' : 'unfeatured'} successfully`,
      });
    } catch (error) {
      console.error('Error updating track:', error);
      toast({
        title: "Error",
        description: "Failed to update track",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReview = async (trackId: string) => {
    const trackRating = rating[trackId];
    const trackNotes = notes[trackId] || '';

    if (!trackRating) {
      toast({
        title: "Error",
        description: "Please provide a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('generated_tracks')
        .update({
          admin_rating: trackRating,
          admin_notes: trackNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', trackId);

      if (error) throw error;

      setTracks(prev => prev.map(track => 
        track.id === trackId 
          ? { 
              ...track, 
              admin_rating: trackRating,
              admin_notes: trackNotes,
              reviewed_at: new Date().toISOString(),
              reviewed_by: user?.id
            }
          : track
      ));

      toast({
        title: "Success",
        description: "Review submitted successfully",
      });

      // Clear form
      setRating(prev => ({ ...prev, [trackId]: 0 }));
      setNotes(prev => ({ ...prev, [trackId]: '' }));
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground mb-8">
          Review and evaluate user-generated music tracks
        </p>
      </motion.div>

      <div className="grid gap-6">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <Music className="h-5 w-5" />
                      {track.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(track.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Style: {track.style}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {track.is_featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                    {track.admin_rating && (
                      <Badge variant="outline">
                        Rated {track.admin_rating}/5
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Prompt:</h4>
                  <p className="text-sm text-muted-foreground">{track.prompt}</p>
                </div>

                {track.audio_url && (
                  <div>
                    <h4 className="font-medium mb-2">Audio Preview:</h4>
                    <audio controls className="w-full">
                      <source src={track.audio_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Rating (1-5 stars):</h4>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingClick(track.id, star)}
                          className={`p-1 transition-colors ${
                            (rating[track.id] || track.admin_rating || 0) >= star
                              ? 'text-secondary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <Star className="h-5 w-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Admin Notes:</h4>
                    <Textarea
                      placeholder="Add review notes..."
                      value={notes[track.id] || track.admin_notes || ''}
                      onChange={(e) => handleNotesChange(track.id, e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleFeatureToggle(track.id, track.is_featured || false)}
                    variant={track.is_featured ? "destructive" : "default"}
                    size="sm"
                  >
                    {track.is_featured ? 'Unfeature' : 'Feature Track'}
                  </Button>
                  
                  <Button
                    onClick={() => handleSubmitReview(track.id)}
                    variant="outline"
                    size="sm"
                    disabled={!rating[track.id]}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Submit Review
                  </Button>
                </div>

                {track.reviewed_at && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Last reviewed: {formatDate(track.reviewed_at)}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {tracks.length === 0 && (
        <div className="text-center py-12">
          <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No tracks to review</h3>
          <p className="text-muted-foreground">All tracks have been reviewed or there are no completed tracks.</p>
        </div>
      )}
    </div>
  );
};
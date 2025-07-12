-- Create a table to store generated music tracks
CREATE TABLE IF NOT EXISTS public.generated_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  duration TEXT NOT NULL,
  audio_url TEXT,
  status TEXT DEFAULT 'generating',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_tracks ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (allowing anonymous access for now)
CREATE POLICY "Anyone can view generated tracks" 
ON public.generated_tracks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create tracks" 
ON public.generated_tracks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update tracks" 
ON public.generated_tracks 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generated_tracks_updated_at
    BEFORE UPDATE ON public.generated_tracks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
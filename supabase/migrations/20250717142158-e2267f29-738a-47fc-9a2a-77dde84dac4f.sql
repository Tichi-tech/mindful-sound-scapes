-- Create a table to store generated meditation sessions
CREATE TABLE IF NOT EXISTS public.generated_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  technique TEXT NOT NULL,
  duration TEXT NOT NULL,
  script TEXT,
  audio_url TEXT,
  status TEXT DEFAULT 'generating',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (allowing anonymous access for now)
CREATE POLICY "Anyone can view generated sessions" 
ON public.generated_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create sessions" 
ON public.generated_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update sessions" 
ON public.generated_sessions 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generated_sessions_updated_at
    BEFORE UPDATE ON public.generated_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
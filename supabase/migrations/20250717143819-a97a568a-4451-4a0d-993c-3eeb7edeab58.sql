-- Add DELETE policies for generated_tracks table
CREATE POLICY "Anyone can delete tracks" 
ON public.generated_tracks 
FOR DELETE 
USING (true);

-- Add DELETE policies for generated_sessions table  
CREATE POLICY "Anyone can delete sessions" 
ON public.generated_sessions 
FOR DELETE 
USING (true);
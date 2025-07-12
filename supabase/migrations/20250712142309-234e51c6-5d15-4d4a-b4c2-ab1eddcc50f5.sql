-- Create storage bucket for generated music
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generated-music', 'generated-music', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for generated music
CREATE POLICY "Anyone can view generated music files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'generated-music');

CREATE POLICY "Service role can upload music files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'generated-music');

CREATE POLICY "Service role can update music files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'generated-music');
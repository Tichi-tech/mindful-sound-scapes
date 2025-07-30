import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, duration } = await req.json();

    console.log('Generating meditation music with prompt:', prompt);
    console.log('Duration (seconds):', duration);

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('prompt', prompt);

    console.log('Sending form data with prompt:', prompt);

    // Call your MusicGen-melody endpoint with correct format
    const musicResponse = await fetch('https://2290221b1dc0.ngrok-free.app/generate', {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData
    });

    console.log('MusicGen API response status:', musicResponse.status);
    console.log('MusicGen API response content-type:', musicResponse.headers.get('content-type'));

    if (!musicResponse.ok) {
      const errorText = await musicResponse.text();
      console.error('MusicGen API error response:', errorText);
      throw new Error(`MusicGen API failed: ${musicResponse.status} - ${errorText}`);
    }

    // Get the audio blob
    const audioBlob = await musicResponse.blob();
    const audioArrayBuffer = await audioBlob.arrayBuffer();
    
    console.log('Audio generated, size:', audioArrayBuffer.byteLength, 'bytes');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a unique filename
    const filename = `meditation-${Date.now()}.wav`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-music')
      .upload(filename, audioArrayBuffer, {
        contentType: 'audio/wav',
        duplex: 'half'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-music')
      .getPublicUrl(filename);

    console.log('Audio uploaded successfully, URL:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioUrl: publicUrl,
        filename: filename 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-meditation-music function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
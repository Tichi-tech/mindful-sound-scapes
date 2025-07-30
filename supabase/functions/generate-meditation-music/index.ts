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

    // Limit duration to reasonable length for MusicGen (max 30 seconds for testing)
    const limitedDuration = Math.min(duration, 30);
    console.log('Limited duration for MusicGen:', limitedDuration);

    // Call your MusicGen-melody endpoint with correct parameters
    const musicResponse = await fetch('https://2290221b1dc0.ngrok-free.app/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
      },
      body: JSON.stringify({
        text: prompt,  // Changed from 'prompt' to 'text' - common API parameter name
        max_new_tokens: limitedDuration * 50, // Approximate tokens for duration
        do_sample: true,
        temperature: 0.7
      })
    });

    if (!musicResponse.ok) {
      console.error('MusicGen API error:', musicResponse.status, musicResponse.statusText);
      throw new Error(`MusicGen API failed: ${musicResponse.statusText}`);
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
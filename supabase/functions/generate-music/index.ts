import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const huggingFaceToken = Deno.env.get('HUGGING_FACE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, title, style, duration } = await req.json();

    if (!huggingFaceToken) {
      throw new Error('Hugging Face API key not configured');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert track record into database
    const { data: track, error: insertError } = await supabase
      .from('generated_tracks')
      .insert({
        title: title || `Healing Music ${Date.now()}`,
        prompt,
        style,
        duration,
        status: 'generating'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to create track record');
    }

    console.log('Created track:', track.id);

    // Start background music generation
    EdgeRuntime.waitUntil(generateMusicBackground(track.id, prompt, style, duration));

    return new Response(JSON.stringify({ 
      success: true, 
      trackId: track.id,
      message: 'Music generation started'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-music function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateMusicBackground(trackId: string, prompt: string, style: string, duration: string) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create enhanced prompt for MusicGen
    const enhancedPrompt = `${style} healing music, ${prompt}, duration ${duration} minutes, therapeutic and calming`;
    
    console.log('Generating music with MusicGen model:', enhancedPrompt);

    // Call MusicGen model via Hugging Face Inference API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/musicgen-medium',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            max_length: Math.min(parseFloat(duration.split('-')[0]) * 60, 30) // Limit to 30 seconds for demo
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MusicGen API error:', response.status, errorText);
      
      // If model is loading, update status and retry later
      if (response.status === 503) {
        await supabase
          .from('generated_tracks')
          .update({ status: 'loading_model' })
          .eq('id', trackId);
        
        // Retry after 20 seconds
        setTimeout(() => generateMusicBackground(trackId, prompt, style, duration), 20000);
        return;
      }
      
      throw new Error(`MusicGen API error: ${response.status} ${errorText}`);
    }

    const audioData = new Uint8Array(await response.arrayBuffer());
    console.log('Generated audio data size:', audioData.length);

    // Upload to Supabase Storage with correct content type
    const fileName = `${trackId}.wav`;
    const { error: uploadError } = await supabase.storage
      .from('generated-music')
      .upload(fileName, audioData, {
        contentType: 'audio/wav',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to upload audio file');
    }
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-music')
      .getPublicUrl(fileName);


    // Update track with audio URL and completed status
    const { error: updateError } = await supabase
      .from('generated_tracks')
      .update({ 
        audio_url: publicUrl,
        status: 'completed'
      })
      .eq('id', trackId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update track');
    }

    console.log('Music generation completed for track:', trackId);

  } catch (error) {
    console.error('Background generation error:', error);
    
    // Update track status to failed
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase
      .from('generated_tracks')
      .update({ status: 'failed' })
      .eq('id', trackId);
  }
}
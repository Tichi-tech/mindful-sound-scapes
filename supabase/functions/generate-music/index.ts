import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, title, style, duration } = await req.json();

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

    // Generate ambient/nature sounds using Bark
    generateBarkAudio(track.id, prompt, style, duration, supabase);

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

async function generateBarkAudio(trackId: string, prompt: string, style: string, duration: string, supabase: any) {
  try {
    console.log('=== BARK AUDIO GENERATION START ===');
    console.log('Generating Bark audio for:', { trackId, prompt, style, duration });

    if (!huggingFaceToken) {
      throw new Error('Hugging Face API token not configured');
    }

    // Create ambient/nature sound prompts for Bark
    const soundPrompts = {
      ambient: "♪ [soft ambient humming with gentle reverb] ♪",
      nature: "♪ [gentle rain falling on leaves with distant bird chirps] ♪", 
      binaural: "♪ [deep meditative om sound with harmonic overtones] ♪",
      tibetan: "♪ [resonant singing bowl with long sustain] ♪",
      piano: "♪ [soft piano arpeggios in a peaceful melody] ♪",
      crystal: "♪ [crystalline chimes with ethereal harmonics] ♪",
      meditation: "♪ [deep breathing sounds with soft background tones] ♪",
      chakra: "♪ [sacred mantra humming with healing frequencies] ♪"
    };

    const barkPrompt = soundPrompts[style as keyof typeof soundPrompts] || soundPrompts.ambient;
    
    console.log('Using Bark prompt:', barkPrompt);

    // Call Hugging Face Bark model
    const response = await fetch('https://api-inference.huggingface.co/models/suno/bark-small', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: barkPrompt,
        parameters: {
          max_length: 1024,
          temperature: 0.7,
          do_sample: true
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Hugging Face API error:', response.status, error);
      throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
    }

    const audioBlob = await response.blob();
    const audioData = new Uint8Array(await audioBlob.arrayBuffer());
    
    console.log('Generated Bark audio data size:', audioData.length);

    // Upload to Supabase Storage
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

    console.log('=== BARK UPLOAD SUCCESSFUL ===');

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

    console.log('=== BARK AUDIO GENERATION COMPLETED ===');

  } catch (error) {
    console.error('=== BARK AUDIO GENERATION ERROR ===');
    console.error('Error details:', error);
    
    // Update track status to failed
    await supabase
      .from('generated_tracks')
      .update({ status: 'failed' })
      .eq('id', trackId);
  }
}
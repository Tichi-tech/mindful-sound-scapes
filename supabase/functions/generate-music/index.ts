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

    // Start background AI music generation
    generateMusicWithAI(track.id, prompt, style, duration, supabase);

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


async function generateMusicWithAI(trackId: string, prompt: string, style: string, duration: string, supabase: any) {
  try {
    console.log('=== MUSIC GENERATION START ===');
    console.log('Generating AI music for:', { trackId, style, duration, prompt });
    
    if (!huggingFaceToken) {
      console.error('HUGGING_FACE_ACCESS_TOKEN not found in environment');
      throw new Error('Hugging Face API token not configured');
    }
    
    console.log('Hugging Face token exists:', huggingFaceToken ? 'YES' : 'NO');

    // Create style-specific prompt for MusicGen
    const stylePrompts = {
      ambient: 'ambient healing music, peaceful, atmospheric, ethereal, relaxing',
      nature: 'nature sounds, forest ambience, birds chirping, flowing water, peaceful',
      binaural: 'binaural beats, meditation music, theta waves, consciousness',
      tibetan: 'tibetan singing bowls, meditation, spiritual healing, temple bells',
      piano: 'gentle piano melody, soft, healing, peaceful, classical inspired',
      crystal: 'crystal bowls, sound healing, pure tones, ethereal, meditation',
      meditation: 'deep meditation music, zen, mindfulness, peaceful, calming',
      chakra: 'chakra healing music, spiritual, energy healing, frequency therapy'
    };
    
    const stylePrefix = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.ambient;
    const fullPrompt = `${stylePrefix}, ${prompt}`;
    
    console.log('=== API CALL START ===');
    console.log('Full prompt being sent:', fullPrompt);
    console.log('About to call Hugging Face API...');

    // Use MusicGen Medium which is more stable than Small
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/musicgen-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        options: {
          wait_for_model: true
        }
      }),
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== HUGGING FACE API ERROR ===');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Error response:', errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    // Get the audio blob response
    console.log('=== PROCESSING RESPONSE ===');
    const audioBlob = await response.blob();
    console.log('Audio blob size:', audioBlob.size);
    console.log('Audio blob type:', audioBlob.type);
    
    const audioArrayBuffer = await audioBlob.arrayBuffer();
    const audioData = new Uint8Array(audioArrayBuffer);
    
    console.log('Generated AI music data size:', audioData.length);

    if (audioData.length === 0) {
      console.error('Generated audio is empty!');
      throw new Error('Generated audio is empty');
    }

    console.log('=== UPLOADING TO STORAGE ===');
    const fileName = `${trackId}.wav`;
    const { error: uploadError } = await supabase.storage
      .from('generated-music')
      .upload(fileName, audioData, {
        contentType: 'audio/wav',
        upsert: true
      });

    if (uploadError) {
      console.error('=== STORAGE UPLOAD ERROR ===');
      console.error('Upload error details:', uploadError);
      throw new Error('Failed to upload audio file');
    }
    
    console.log('=== UPLOAD SUCCESSFUL ===');

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
      console.error('=== DATABASE UPDATE ERROR ===');
      console.error('Update error details:', updateError);
      throw new Error('Failed to update track');
    }

    console.log('=== MUSIC GENERATION COMPLETED SUCCESSFULLY ===');
    console.log('Track completed:', trackId);

  } catch (error) {
    console.error('=== MUSIC GENERATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Update track status to failed
    await supabase
      .from('generated_tracks')
      .update({ status: 'failed' })
      .eq('id', trackId);
  }
}
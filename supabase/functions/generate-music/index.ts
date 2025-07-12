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
    
    // Create enhanced prompt for MelodyFlow
    const enhancedPrompt = `Generate ${style} healing music: ${prompt}. Duration: ${duration} minutes. Focus on therapeutic and calming qualities.`;
    
    console.log('Generating music with prompt:', enhancedPrompt);

    // For demo purposes, generate a simple sine wave audio
    // Note: MelodyFlow model may not be available via inference API
    console.log('Generating demo audio for prompt:', enhancedPrompt);
    
    // Create a simple sine wave audio buffer (demo)
    const sampleRate = 44100;
    const durationSeconds = parseFloat(duration.split('-')[0]) * 60; // Use first number in duration
    const numSamples = sampleRate * durationSeconds;
    const audioBuffer = new ArrayBuffer(44 + numSamples * 2); // WAV header + 16-bit samples
    const view = new DataView(audioBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Generate sine wave based on style
    const frequencies = {
      ambient: [220, 330, 440],
      nature: [200, 400, 600],
      binaural: [440, 444],
      tibetan: [256, 384, 512],
      piano: [261.63, 329.63, 392],
      crystal: [440, 880, 1320],
      meditation: [174, 285, 396],
      chakra: [396, 417, 528]
    };
    
    const styleFreqs = frequencies[style as keyof typeof frequencies] || frequencies.ambient;
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Mix multiple frequencies for richer sound
      styleFreqs.forEach((freq, index) => {
        const amplitude = 0.3 / styleFreqs.length * (1 - index * 0.2);
        sample += Math.sin(2 * Math.PI * freq * t) * amplitude;
      });
      
      // Add some gentle amplitude modulation for a more natural sound
      sample *= 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * t);
      
      // Apply fade in/out
      const fadeTime = Math.min(2, durationSeconds / 4);
      if (t < fadeTime) {
        sample *= t / fadeTime;
      } else if (t > durationSeconds - fadeTime) {
        sample *= (durationSeconds - t) / fadeTime;
      }
      
      const sampleValue = Math.max(-32767, Math.min(32767, sample * 32767));
      view.setInt16(44 + i * 2, sampleValue, true);
    }
    
    const audioData = new Uint8Array(audioBuffer);
    
    console.log('Generated audio data size:', audioData.length);

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
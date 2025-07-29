import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

    // Start background audio generation (simplified)
    generateSimpleAudio(track.id, prompt, style, duration, supabase);

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

async function generateSimpleAudio(trackId: string, prompt: string, style: string, duration: string, supabase: any) {
  try {
    console.log('Generating simple audio for:', { trackId, style, duration });
    
    // Parse duration to seconds (max 30 seconds for Edge Function limits)
    const durationSeconds = Math.min(parseFloat(duration.split('-')[0]) * 60, 30);
    
    // Create simple but effective audio based on style
    const sampleRate = 44100;
    const numSamples = sampleRate * durationSeconds;
    const audioBuffer = new ArrayBuffer(44 + numSamples * 2);
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
    
    // Style-specific frequencies and characteristics
    const styleConfig = {
      ambient: { freqs: [220, 330, 440], harmonics: 3, decay: 0.8 },
      nature: { freqs: [200, 400, 600], harmonics: 2, decay: 0.9 },
      binaural: { freqs: [440, 444], harmonics: 1, decay: 1.0 },
      tibetan: { freqs: [256, 384, 512], harmonics: 4, decay: 0.7 },
      piano: { freqs: [261.63, 329.63, 392], harmonics: 6, decay: 0.6 },
      crystal: { freqs: [440, 880, 1320], harmonics: 3, decay: 0.8 },
      meditation: { freqs: [174, 285, 396], harmonics: 2, decay: 0.9 },
      chakra: { freqs: [396, 417, 528], harmonics: 3, decay: 0.8 }
    };
    
    const config = styleConfig[style as keyof typeof styleConfig] || styleConfig.ambient;
    
    // Generate audio samples
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Generate tones based on style
      config.freqs.forEach((freq, index) => {
        const amplitude = 0.3 / config.freqs.length * (1 - index * 0.1);
        
        if (style === 'piano') {
          // Enhanced piano sound
          const noteTime = (t * 0.8) % 4; // 4-second notes
          const attack = Math.min(noteTime / 0.05, 1); // 50ms attack
          const decay = Math.exp(-noteTime * 0.5);
          
          // Piano harmonics
          for (let h = 1; h <= config.harmonics; h++) {
            const harmonicFreq = freq * h * (1 + h * 0.001); // Slight inharmonicity
            const harmonicAmp = amplitude / h;
            sample += Math.sin(2 * Math.PI * harmonicFreq * t) * harmonicAmp * attack * decay;
          }
          
          // Add body resonance
          sample += Math.sin(2 * Math.PI * 100 * t) * 0.1 * Math.exp(-noteTime * 0.3);
          
        } else {
          // Standard harmonic generation for other styles
          for (let h = 1; h <= config.harmonics; h++) {
            const harmonicAmp = amplitude / h;
            sample += Math.sin(2 * Math.PI * freq * h * t) * harmonicAmp;
          }
        }
      });
      
      // Apply style-specific modulation
      if (style === 'nature') {
        sample *= (0.8 + 0.4 * Math.random()); // Natural randomness
      } else if (style === 'ocean') {
        sample *= (1 + 0.3 * Math.sin(2 * Math.PI * 0.1 * t)); // Wave-like modulation
      }
      
      // Apply fade in/out
      const fadeTime = Math.min(2, durationSeconds / 6);
      let envelope = 1;
      if (t < fadeTime) {
        envelope = t / fadeTime;
      } else if (t > durationSeconds - fadeTime) {
        envelope = (durationSeconds - t) / fadeTime;
      }
      
      sample *= envelope * config.decay;
      
      // Convert to 16-bit integer
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

    console.log('Audio generation completed for track:', trackId);

  } catch (error) {
    console.error('Audio generation error:', error);
    
    // Update track status to failed
    await supabase
      .from('generated_tracks')
      .update({ status: 'failed' })
      .eq('id', trackId);
  }
}
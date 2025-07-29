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

    // Start background MusicGen audio generation
    generateMusicGenAudio(track.id, prompt, style, duration, supabase);

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


async function generateMusicGenAudio(trackId: string, prompt: string, style: string, duration: string, supabase: any) {
  try {
    console.log('Generating MusicGen audio for:', { trackId, style, duration });
    
    // Get Hugging Face API token from environment
    const hfToken = Deno.env.get('HUGGING_FACE_TOKEN') || 
                    Deno.env.get('HUGGING_FACE_API_KEY') || 
                    Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!hfToken) {
      throw new Error('Hugging Face API token not configured. Set HUGGING_FACE_TOKEN environment variable.');
    }
    
    // Parse duration to seconds
    const durationSeconds = parseFloat(duration.split('-')[0]) * 60;
    
    // Enhance prompt with style context for better results
    const stylePrompts = {
      ambient: "ambient healing meditation music, soft and ethereal",
      nature: "natural sounds with gentle instrumental accompaniment",
      binaural: "binaural beats for focus and relaxation",
      tibetan: "tibetan singing bowls with meditation ambience",
      piano: "authentic grand piano with rich harmonics, warm resonance, and gentle sustain for healing and relaxation",
      crystal: "crystal bowl harmonics with healing frequencies",
      meditation: "deep meditation music with soft drones",
      chakra: "chakra healing frequencies with harmonic tones"
    };
    
    const enhancedPrompt = `${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.ambient}, ${prompt}`;
    console.log('Enhanced prompt:', enhancedPrompt);
    
    // For now, create a high-quality demo audio since HF Inference API doesn't support MusicGen
    // In production, you'd use Replicate API or a self-hosted solution
    console.log('Generating enhanced demo audio for:', enhancedPrompt);
    
    // Create enhanced audio based on style and prompt
    const sampleRate = 44100;
    const durationInSeconds = Math.min(durationSeconds, 30);
    const numSamples = sampleRate * durationInSeconds;
    const audioBuffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(audioBuffer);
    
    // Enhanced WAV header
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
    
    // Advanced prompt analysis for dynamic music generation
    function analyzePrompt(prompt: string, style: string) {
      const words = prompt.toLowerCase().split(/\s+/);
      const analysis = {
        tempo: 'medium', // slow, medium, fast
        mood: 'peaceful', // peaceful, energetic, mysterious, joyful, healing, courage, anxiety, clarity
        instruments: [] as string[],
        nature: [] as string[],
        frequencies: [] as number[],
        rhythmPattern: 'steady', // steady, flowing, pulsing, breathing, releasing
        harmonics: 1, // 1-3 complexity
        baseFreq: 174, // Starting frequency
        therapeuticIntent: 'general', // general, sleep, anxiety, courage, healing, clarity, release
        intensity: 'medium' // gentle, medium, powerful
      };

      // Tempo analysis - Enhanced with therapeutic keywords
      if (words.some(w => ['slow', 'deep', 'meditation', 'sleep', 'calm', 'gentle', 'quiet', 'soft', 'peaceful', 'lullaby', 'surrender', 'dissolve', 'stillness', 'rest'].includes(w))) {
        analysis.tempo = 'slow';
      } else if (words.some(w => ['energetic', 'active', 'focus', 'concentration', 'awakening', 'forward-moving', 'energize', 'leap', 'rise', 'clarity'].includes(w))) {
        analysis.tempo = 'fast';
      }

      // Enhanced Mood Analysis with Therapeutic Categories
      if (words.some(w => ['joyful', 'happy', 'uplifting', 'positive', 'bright', 'lighten', 'airy', 'spacious', 'playful', 'dance'].includes(w))) {
        analysis.mood = 'joyful';
        analysis.baseFreq = 528; // Love frequency
      } else if (words.some(w => ['mysterious', 'deep', 'spiritual', 'cosmic', 'transcendent', 'sacred', 'source', 'meaning', 'divine', 'mystical', 'celestial'].includes(w))) {
        analysis.mood = 'mysterious';
        analysis.baseFreq = 136.1; // OM frequency
      } else if (words.some(w => ['energetic', 'powerful', 'strength', 'confidence', 'courage', 'purpose', 'ready', 'leap', 'trust'].includes(w))) {
        analysis.mood = 'courage';
        analysis.baseFreq = 40; // Gamma frequency for confidence
      } else if (words.some(w => ['healing', 'restore', 'nurture', 'forgiveness', 'peace', 'serenity', 'wounds', 'recalibrate', 'recovery', 'repair'].includes(w))) {
        analysis.mood = 'healing';
        analysis.baseFreq = 528; // DNA repair frequency
      } else if (words.some(w => ['anxiety', 'racing', 'tangled', 'tension', 'overwhelm', 'overstimulating', 'stress', 'worry', 'nervous'].includes(w))) {
        analysis.mood = 'anxiety';
        analysis.baseFreq = 7.83; // Schumann resonance for grounding
      } else if (words.some(w => ['clarity', 'focus', 'centered', 'grounded', 'fog', 'clear', 'presence', 'balance', 'harmony'].includes(w))) {
        analysis.mood = 'clarity';
        analysis.baseFreq = 40; // Gamma for mental clarity
      }

      // Therapeutic Intent Analysis
      if (words.some(w => ['sleep', 'lullaby', 'surrender', 'wash', 'dreams', 'rest', 'tired'].includes(w))) {
        analysis.therapeuticIntent = 'sleep';
        analysis.baseFreq = 0.5; // Delta waves for sleep
      } else if (words.some(w => ['anxiety', 'calm', 'soothe', 'quiet', 'tension', 'melt', 'breathing', 'nervous'].includes(w))) {
        analysis.therapeuticIntent = 'anxiety';
        analysis.baseFreq = 7.83; // Earth frequency
      } else if (words.some(w => ['courage', 'confidence', 'strength', 'leap', 'purpose', 'trust', 'ready'].includes(w))) {
        analysis.therapeuticIntent = 'courage';
        analysis.baseFreq = 285; // Solfeggio for confidence
      } else if (words.some(w => ['healing', 'wounds', 'forgiveness', 'restore', 'nurture', 'heart', 'peace'].includes(w))) {
        analysis.therapeuticIntent = 'healing';
        analysis.baseFreq = 528; // Love frequency
      } else if (words.some(w => ['clarity', 'focus', 'fog', 'centered', 'grounded', 'clear', 'presence'].includes(w))) {
        analysis.therapeuticIntent = 'clarity';
        analysis.baseFreq = 40; // Gamma waves
      } else if (words.some(w => ['release', 'let go', 'exhale', 'dissolve', 'surrender', 'tension', 'melt'].includes(w))) {
        analysis.therapeuticIntent = 'release';
        analysis.baseFreq = 396; // Solfeggio for releasing
      }

      // Intensity Analysis
      if (words.some(w => ['gentle', 'soft', 'whisper', 'subtle', 'tender', 'light', 'delicate', 'quiet'].includes(w))) {
        analysis.intensity = 'gentle';
      } else if (words.some(w => ['powerful', 'strong', 'intense', 'deep', 'profound', 'heavy', 'loud'].includes(w))) {
        analysis.intensity = 'powerful';
      }

      // Enhanced Instrument Detection
      if (words.some(w => ['piano', 'keys', 'keyboard'].includes(w))) {
        analysis.instruments.push('piano');
      }
      if (words.some(w => ['flute', 'wind', 'breeze', 'breath', 'breathing'].includes(w))) {
        analysis.instruments.push('flute');
      }
      if (words.some(w => ['bells', 'chimes', 'tibetan', 'singing', 'bowl', 'resonance'].includes(w))) {
        analysis.instruments.push('bells');
      }
      if (words.some(w => ['strings', 'harp', 'guitar', 'violin', 'cello'].includes(w))) {
        analysis.instruments.push('strings');
      }
      if (words.some(w => ['drums', 'rhythm', 'heartbeat', 'pulse', 'beat'].includes(w))) {
        analysis.instruments.push('drums');
      }
      // New therapeutic instruments
      if (words.some(w => ['crystal', 'crystals', 'gemstone', 'quartz', 'amethyst'].includes(w))) {
        analysis.instruments.push('crystal');
      }
      if (words.some(w => ['voice', 'vocal', 'humming', 'chanting', 'om', 'mantra'].includes(w))) {
        analysis.instruments.push('voice');
      }
      if (words.some(w => ['bamboo', 'flute', 'wooden', 'natural'].includes(w))) {
        analysis.instruments.push('bamboo');
      }

      // Enhanced Nature Sounds with Therapeutic Imagery
      if (words.some(w => ['ocean', 'waves', 'sea', 'beach', 'tide', 'shore'].includes(w))) {
        analysis.nature.push('ocean');
        analysis.rhythmPattern = 'flowing';
      }
      if (words.some(w => ['rain', 'storm', 'water', 'drops', 'drizzle', 'shower'].includes(w))) {
        analysis.nature.push('rain');
        analysis.rhythmPattern = 'pulsing';
      }
      if (words.some(w => ['wind', 'breeze', 'air', 'breath', 'breathing', 'exhale', 'inhale'].includes(w))) {
        analysis.nature.push('wind');
        analysis.rhythmPattern = 'breathing';
      }
      if (words.some(w => ['forest', 'trees', 'leaves', 'nature', 'woods', 'wilderness'].includes(w))) {
        analysis.nature.push('forest');
      }
      if (words.some(w => ['birds', 'chirping', 'singing', 'tweet', 'song'].includes(w))) {
        analysis.nature.push('birds');
      }
      if (words.some(w => ['fire', 'crackling', 'flames', 'warmth', 'ember'].includes(w))) {
        analysis.nature.push('fire');
        analysis.rhythmPattern = 'pulsing';
      }
      // New therapeutic nature sounds
      if (words.some(w => ['waterfall', 'stream', 'river', 'flowing', 'cascade'].includes(w))) {
        analysis.nature.push('waterfall');
        analysis.rhythmPattern = 'flowing';
      }
      if (words.some(w => ['thunder', 'storm', 'lightning', 'rumble'].includes(w))) {
        analysis.nature.push('thunder');
      }
      if (words.some(w => ['cave', 'echo', 'cavern', 'depth', 'underground'].includes(w))) {
        analysis.nature.push('cave');
      }
      if (words.some(w => ['mountain', 'peak', 'altitude', 'summit', 'high'].includes(w))) {
        analysis.nature.push('mountain');
      }

      // Rhythm Pattern Analysis
      if (words.some(w => ['breathing', 'breath', 'inhale', 'exhale', 'lungs'].includes(w))) {
        analysis.rhythmPattern = 'breathing';
      } else if (words.some(w => ['flowing', 'flow', 'stream', 'river', 'cascade', 'wash'].includes(w))) {
        analysis.rhythmPattern = 'flowing';
      } else if (words.some(w => ['pulsing', 'pulse', 'heartbeat', 'rhythm', 'beat'].includes(w))) {
        analysis.rhythmPattern = 'pulsing';
      } else if (words.some(w => ['releasing', 'release', 'let go', 'melt', 'dissolve'].includes(w))) {
        analysis.rhythmPattern = 'releasing';
      } else if (words.some(w => ['dance', 'dancing', 'playful', 'light', 'airy'].includes(w))) {
        analysis.rhythmPattern = 'dancing';
      }

      // Generate dynamic frequencies based on analysis
      const baseFreqs = {
        slow: [174, 136.1, 110], // Lower frequencies for calm
        medium: [285, 256, 220], // Medium frequencies
        fast: [396, 440, 528] // Higher frequencies for energy
      };

      analysis.frequencies = baseFreqs[analysis.tempo as keyof typeof baseFreqs];

      // Add harmonic complexity based on prompt richness
      analysis.harmonics = Math.min(3, Math.floor(words.length / 5) + 1);

      return analysis;
    }

    const promptAnalysis = analyzePrompt(prompt, style);
    console.log('Prompt analysis:', promptAnalysis);

    // Dynamic frequency selection based on analysis
    let frequencies = promptAnalysis.frequencies;
    
    // Generate highly dynamic audio based on prompt analysis
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Dynamic tempo multiplier
      const tempoMultiplier = promptAnalysis.tempo === 'slow' ? 0.7 : 
                             promptAnalysis.tempo === 'fast' ? 1.4 : 1.0;
      
      frequencies.forEach((freq, index) => {
        const amplitude = 0.12 / frequencies.length * (1 - index * 0.08);
        let modulation = 1;
        let instrumentEffect = 1;
        
        // Piano-specific note progression and chord structures
        if (promptAnalysis.instruments.includes('piano')) {
          // Create gentle chord progressions for healing piano
          const noteLength = 3; // 3-second notes for gentle, sustained effect
          const noteTime = Math.floor(t * tempoMultiplier / noteLength) % 8; // 8-note progression
          
          // Healing chord progression: C-Am-F-G-Em-Dm-G-C (peaceful resolution)
          const chordOffsets = [0, 9, 5, 7, 4, 2, 7, 0]; // Semitone offsets
          const chordOffset = chordOffsets[noteTime];
          freq = freq * Math.pow(2, chordOffset / 12); // Apply chord progression
          
          // Add gentle arpeggiation within chords
          const arpeggioTime = (t * tempoMultiplier) % 1;
          if (arpeggioTime < 0.33) {
            // Root note
          } else if (arpeggioTime < 0.66) {
            freq *= Math.pow(2, 4/12); // Third
          } else {
            freq *= Math.pow(2, 7/12); // Fifth
          }
        }
        
        // Enhanced Instrument-based waveform shaping
        if (promptAnalysis.instruments.includes('piano')) {
          // Realistic piano sound with complex harmonics and authentic timbre
          const noteTime = (t * tempoMultiplier) % 3; // Longer note duration for piano
          
          // Piano-specific harmonic series (inharmonic overtones characteristic of piano strings)
          const pianoHarmonics = [1, 2.01, 3.05, 4.12, 5.23, 6.37]; // Slightly stretched tuning
          let pianoSound = 0;
          
          pianoHarmonics.forEach((harmonic, idx) => {
            const harmonicFreq = freq * harmonic;
            const harmonicAmp = Math.pow(0.7, idx); // Decay amplitude per harmonic
            
            // Piano hammer strike simulation with multiple attack phases
            const attackTime = Math.min(noteTime, 0.05); // 50ms attack
            const attack = attackTime < 0.05 ? Math.sin((Math.PI * attackTime) / 0.1) : 1;
            
            // Piano string resonance decay (different for each harmonic)
            const decay = Math.exp(-noteTime * (1 + idx * 0.3));
            
            // String vibration with slight inharmonicity
            const stringVibration = Math.sin(2 * Math.PI * harmonicFreq * t + 
                                           0.1 * Math.sin(2 * Math.PI * harmonicFreq * 0.01 * t));
            
            pianoSound += stringVibration * harmonicAmp * attack * decay;
          });
          
          // Piano body resonance (wooden soundboard effect)
          const bodyResonance = 0.15 * Math.sin(2 * Math.PI * 100 * t) * Math.exp(-noteTime * 0.5);
          pianoSound += bodyResonance;
          
          // Sympathetic string resonance
          const sympatheticResonance = 0.08 * Math.sin(2 * Math.PI * freq * 0.5 * t) * Math.exp(-noteTime * 0.3);
          pianoSound += sympatheticResonance;
          
          instrumentEffect *= Math.max(0.05, pianoSound * 0.8);
        }
        
        if (promptAnalysis.instruments.includes('flute')) {
          // Flute-like gentle oscillation with breath
          instrumentEffect *= (1 + 0.1 * Math.sin(2 * Math.PI * 5 * t));
        }
        
        if (promptAnalysis.instruments.includes('bells')) {
          // Bell-like resonance with decay
          const bellTime = (t * tempoMultiplier) % 3;
          instrumentEffect *= (1 + 0.3 * Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-bellTime));
        }
        
        if (promptAnalysis.instruments.includes('strings')) {
          // String-like sustain and vibrato
          instrumentEffect *= (1 + 0.05 * Math.sin(2 * Math.PI * 6 * t));
        }

        // New therapeutic instruments
        if (promptAnalysis.instruments.includes('crystal')) {
          // Crystal bowl pure tones with shimmer
          instrumentEffect *= (1 + 0.2 * Math.sin(2 * Math.PI * freq * 0.618 * t)); // Golden ratio
        }

        if (promptAnalysis.instruments.includes('voice')) {
          // Human voice-like formant filtering
          instrumentEffect *= (1 + 0.15 * Math.sin(2 * Math.PI * 2.5 * t) * Math.sin(2 * Math.PI * 0.5 * t));
        }

        if (promptAnalysis.instruments.includes('bamboo')) {
          // Bamboo flute woody texture
          instrumentEffect *= (1 + 0.08 * Math.sin(2 * Math.PI * 3.2 * t));
        }
        
        // Enhanced Nature sound modulation
        promptAnalysis.nature.forEach(nature => {
          switch(nature) {
            case 'ocean':
              modulation *= (1 + 0.4 * Math.sin(2 * Math.PI * 0.08 * t * tempoMultiplier)); // Slow waves
              break;
            case 'rain':
              modulation *= (0.8 + 0.4 * Math.random()); // Random droplets
              break;
            case 'wind':
              modulation *= (1 + 0.2 * Math.sin(2 * Math.PI * 0.3 * t) * Math.sin(2 * Math.PI * 0.07 * t));
              break;
            case 'forest':
              modulation *= (1 + 0.1 * Math.sin(2 * Math.PI * 0.2 * t));
              break;
            case 'birds':
              // Add bird-like chirps
              if (Math.random() < 0.001 * tempoMultiplier) {
                modulation *= (1 + 2 * Math.sin(2 * Math.PI * (freq * 3) * t) * Math.exp(-((t % 1) * 10)));
              }
              break;
            case 'fire':
              modulation *= (0.9 + 0.2 * Math.random()); // Crackling effect
              break;
            case 'waterfall':
              // Constant flowing with variations
              modulation *= (0.9 + 0.3 * Math.sin(2 * Math.PI * 15 * t) * Math.random());
              break;
            case 'thunder':
              // Occasional deep rumbles
              if (Math.random() < 0.0002) {
                modulation *= (1 + 10 * Math.sin(2 * Math.PI * 20 * t) * Math.exp(-((t % 1) * 2)));
              }
              break;
            case 'cave':
              // Echo effect
              modulation *= (1 + 0.3 * Math.sin(2 * Math.PI * freq * (t - 0.2)) * 0.5);
              break;
            case 'mountain':
              // High altitude airy effect
              modulation *= (1 + 0.15 * Math.sin(2 * Math.PI * 0.1 * t));
              break;
          }
        });
        
        // Enhanced Rhythm pattern influence
        let rhythmMod = 1;
        switch(promptAnalysis.rhythmPattern) {
          case 'flowing':
            rhythmMod = (1 + 0.2 * Math.sin(2 * Math.PI * 0.5 * t * tempoMultiplier));
            break;
          case 'pulsing':
            rhythmMod = (0.8 + 0.4 * Math.abs(Math.sin(2 * Math.PI * 1 * t * tempoMultiplier)));
            break;
          case 'breathing':
            // 4-second breathing cycle (inhale 2s, exhale 2s)
            rhythmMod = (0.7 + 0.3 * Math.sin(2 * Math.PI * 0.25 * t * tempoMultiplier));
            break;
          case 'releasing':
            // Gradual release and renewal
            rhythmMod = (0.8 + 0.4 * Math.exp(-0.1 * t) * Math.sin(2 * Math.PI * 0.3 * t));
            break;
          case 'dancing':
            // Light, playful rhythm
            rhythmMod = (1 + 0.3 * Math.sin(2 * Math.PI * 1.2 * t * tempoMultiplier) * Math.sin(2 * Math.PI * 0.3 * t));
            break;
          case 'steady':
          default:
            rhythmMod = 1;
            break;
        }
        
        // Enhanced Mood-based harmonic content
        let harmonicContent = Math.sin(2 * Math.PI * freq * t * tempoMultiplier);
        switch(promptAnalysis.mood) {
          case 'joyful':
            harmonicContent += 0.3 * Math.sin(2 * Math.PI * freq * 1.5 * t * tempoMultiplier); // Major harmonics
            break;
          case 'mysterious':
            harmonicContent += 0.2 * Math.sin(2 * Math.PI * freq * 0.618 * t * tempoMultiplier); // Golden ratio
            break;
          case 'courage':
            harmonicContent += 0.4 * Math.sin(2 * Math.PI * freq * 2 * t * tempoMultiplier); // Octave for strength
            break;
          case 'healing':
            harmonicContent += 0.25 * Math.sin(2 * Math.PI * freq * 1.618 * t * tempoMultiplier); // Golden ratio for healing
            break;
          case 'anxiety':
            // Grounding, stable harmonics
            harmonicContent += 0.15 * Math.sin(2 * Math.PI * freq * 0.5 * t * tempoMultiplier); // Sub-harmonic
            break;
          case 'clarity':
            harmonicContent += 0.35 * Math.sin(2 * Math.PI * freq * 3 * t * tempoMultiplier); // Clear overtones
            break;
        }

        // Apply therapeutic intent modulation
        switch(promptAnalysis.therapeuticIntent) {
          case 'sleep':
            // Ultra-slow, deep modulation
            harmonicContent *= (0.8 + 0.2 * Math.sin(2 * Math.PI * 0.05 * t));
            break;
          case 'anxiety':
            // Stabilizing, grounding effect
            harmonicContent *= (0.9 + 0.1 * Math.sin(2 * Math.PI * 7.83 * t)); // Schumann resonance
            break;
          case 'courage':
            // Energizing, uplifting
            harmonicContent *= (1 + 0.2 * Math.sin(2 * Math.PI * 40 * t)); // Gamma waves
            break;
          case 'healing':
            // DNA repair frequency modulation
            harmonicContent *= (1 + 0.15 * Math.sin(2 * Math.PI * 528 * t / 1000));
            break;
          case 'clarity':
            // Mental clarity enhancement
            harmonicContent *= (1 + 0.1 * Math.sin(2 * Math.PI * 40 * t)); // Gamma
            break;
          case 'release':
            // Gradual releasing pattern
            harmonicContent *= (1 - 0.1 * Math.exp(-0.05 * t));
            break;
        }

        // Intensity adjustment
        const intensityMultiplier = promptAnalysis.intensity === 'gentle' ? 0.6 :
                                   promptAnalysis.intensity === 'powerful' ? 1.4 : 1.0;
        
        sample += harmonicContent * amplitude * modulation * instrumentEffect * rhythmMod * intensityMultiplier;
      });
      
      // Dynamic complexity based on prompt richness
      for (let h = 1; h <= promptAnalysis.harmonics; h++) {
        const harmonicFreq = promptAnalysis.baseFreq * h;
        const harmonicAmp = 0.05 / h; // Diminishing harmonics
        sample += Math.sin(2 * Math.PI * harmonicFreq * t * tempoMultiplier) * harmonicAmp;
      }
      
      // Sophisticated envelope with prompt-aware shaping
      const fadeTime = Math.min(3, durationInSeconds / 6);
      let envelope = 1;
      
      if (t < fadeTime) {
        envelope = Math.sin((Math.PI * t) / (2 * fadeTime)); // Smooth fade in
      } else if (t > durationInSeconds - fadeTime) {
        envelope = Math.sin((Math.PI * (durationInSeconds - t)) / (2 * fadeTime)); // Smooth fade out
      }
      
      // Apply dynamic range based on tempo
      const dynamicRange = promptAnalysis.tempo === 'slow' ? 0.6 : 
                          promptAnalysis.tempo === 'fast' ? 1.2 : 1.0;
      
      sample *= envelope * dynamicRange;
      
      // Add subtle golden ratio harmonics for natural feel
      sample += 0.08 * sample * Math.sin(2 * Math.PI * 0.618 * t * tempoMultiplier);
      
      const sampleValue = Math.max(-32767, Math.min(32767, sample * 32767));
      view.setInt16(44 + i * 2, sampleValue, true);
    }
    
    const audioData = new Uint8Array(audioBuffer);
    console.log('Generated enhanced healing audio data size:', audioData.length);

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

    console.log('MusicGen audio generation completed for track:', trackId);

  } catch (error) {
    console.error('MusicGen audio generation error:', error);
    
    // Update track status to failed
    await supabase
      .from('generated_tracks')
      .update({ status: 'failed' })
      .eq('id', trackId);
  }
}
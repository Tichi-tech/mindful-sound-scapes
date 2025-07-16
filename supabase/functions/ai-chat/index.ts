[
  {
    "text": "Uplifting pad texture with gentle melodic progression for positive energy and motivation",
    "audio_file": "uplifting-pad-texture-113842.mp3",
    "style": "ambient",
    "duration": "3-5",
    "emotion": "uplifting",
    "instruments": ["pads", "synthesizer"],
    "therapeutic_benefit": "positive energy, motivation"
  }
]
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { message, conversationHistory } = await req.json();
    
    console.log('Received message:', message);
    console.log('Conversation history length:', conversationHistory?.length || 0);

    const systemPrompt = `You are Tichi, an AI meditation assistant. You help users with:
- Meditation guidance and techniques
- Stress relief and relaxation advice
- Personalized soundscape recommendations
- Breathing exercises and mindfulness practices
- Creating calming environments

When recommending sounds, you can suggest these available options:
- ocean-waves (ocean sounds for relaxation)
- forest-rain (rain in forest for peace)
- tibetan-bowls (spiritual meditation)
- binaural-focus (concentration and focus)
- white-noise (sleep and blocking distractions)
- piano-ambient (soft musical meditation)

Keep responses helpful, calming, and focused on meditation and wellness. Be concise but warm.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const aiMessage = data.choices[0].message.content;

    // Check if the AI mentioned any specific sound and extract it
    let recommendedSound = null;
    const soundMentions = {
      'ocean': 'ocean-waves',
      'waves': 'ocean-waves',
      'rain': 'forest-rain',
      'forest': 'forest-rain',
      'tibetan': 'tibetan-bowls',
      'singing bowls': 'tibetan-bowls',
      'binaural': 'binaural-focus',
      'focus': 'binaural-focus',
      'white noise': 'white-noise',
      'piano': 'piano-ambient',
      'ambient': 'piano-ambient'
    };

    for (const [keyword, soundId] of Object.entries(soundMentions)) {
      if (aiMessage.toLowerCase().includes(keyword)) {
        recommendedSound = soundId;
        break;
      }
    }

    return new Response(JSON.stringify({ 
      message: aiMessage,
      recommendedSound 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get AI response. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

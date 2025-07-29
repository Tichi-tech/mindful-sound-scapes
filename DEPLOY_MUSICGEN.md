# 🚀 Deploy MusicGen to Your Product

## Quick Setup for Demo

### Step 1: Get Hugging Face Token
1. Visit: https://huggingface.co/settings/tokens
2. Create token with "Read" permissions  
3. Copy the token (starts with `hf_`)

### Step 2: Add Token to Supabase

**Via Dashboard (Easiest):**
1. Go to your Supabase project dashboard
2. **Settings** → **Edge Functions** → **Environment Variables**
3. Add: `HUGGING_FACE_TOKEN` = `your_token_here`

### Step 3: Deploy the Function

```bash
# Link your project (get project ref from Supabase dashboard)
supabase link --project-ref your-project-ref

# Deploy the updated function
supabase functions deploy generate-music
```

### Step 4: Test in Your React App

Your existing React app (`src/components/MusicGenerator.tsx`) will automatically work! Just:

1. Open your app: `npm run dev`
2. Go to the Music Generator section
3. Enter a prompt like: "peaceful ocean waves with soft piano"
4. Click "Generate Healing Music"

## ⚡ What Changed in Your App

- **Backend**: Now uses real MusicGen-medium model instead of sine waves
- **Frontend**: No changes needed - same interface!
- **Quality**: Real AI-generated healing music instead of demo tones

## 🎵 Demo Prompts to Try

```
"gentle rain sounds with soft piano melodies for deep relaxation"
"tibetan singing bowls with meditation bells for chakra healing" 
"forest sounds with birds chirping for nature meditation"
"binaural beats at 40Hz for focus and concentration"
"crystal bowl healing frequencies for stress relief"
```

## ⏱️ Expected Performance

- **First generation**: 30-60 seconds (model loading)
- **Subsequent**: 10-30 seconds
- **Max duration**: 30 seconds per generation
- **Quality**: High-quality WAV files

## 🔧 Troubleshooting

If generation fails:
1. Check Hugging Face token is set correctly
2. Try shorter prompts
3. Check Supabase function logs
4. Model might be loading (503 error) - retry in 30 seconds

Your product is ready for MusicGen demo! 🎶
# 🎵 Enable Real MusicGen (Before Fine-tuning)

## 🚨 Current Status: Demo Only

Your app is currently generating **simple sine wave audio** as a demo. Let's enable real AI music generation first!

## 🎯 Step 1: Get Hugging Face API Key

1. **Sign up at Hugging Face**
   - Go to [huggingface.co](https://huggingface.co)
   - Create a free account

2. **Get your API key**
   - Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
   - Click "New token"
   - Name it "MusicGen API"
   - Select "Read" permissions
   - Copy the token

## 🔧 Step 2: Add API Key to Supabase

```bash
# Add to your Supabase environment variables
supabase secrets set HUGGING_FACE_API_KEY=your_token_here
```

Or add it in the Supabase dashboard:
1. Go to your Supabase project
2. Settings > Environment Variables
3. Add: `HUGGING_FACE_API_KEY = your_token_here`

## 🚀 Step 3: Deploy Updated Function

```bash
# Deploy the updated generate-music function
supabase functions deploy generate-music
```

## 🧪 Step 4: Test Real MusicGen

1. **Go to your app** (http://localhost:8080)
2. **Try generating music** with a prompt like:
   - "Gentle rain sounds with soft piano melodies for deep relaxation"
   - "Tibetan singing bowls with nature sounds for spiritual meditation"

3. **Check the console** for logs:
   - Should see: "Successfully generated music with MusicGen"
   - Instead of: "Generated demo audio as fallback"

## 🎵 Expected Results

### **Before (Demo):**
- Simple sine wave tones
- Basic frequency mixing
- Limited musical complexity

### **After (MusicGen):**
- Real musical instruments
- Complex harmonies and melodies
- Natural sound progression
- Much higher quality

## 🔍 Troubleshooting

### **If MusicGen Still Fails:**

1. **Check API Key:**
   ```bash
   # Test your API key
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://api-inference.huggingface.co/models/facebook/musicgen-small
   ```

2. **Check Function Logs:**
   ```bash
   supabase functions logs generate-music
   ```

3. **Common Issues:**
   - API key not set correctly
   - Model loading (first request takes longer)
   - Rate limits (free tier has limits)

## 📊 Compare Quality

After enabling MusicGen, test these prompts and compare:

```
Test Prompts:
1. "Gentle piano melodies for meditation"
2. "Tibetan singing bowls with nature sounds"
3. "Binaural beats for focus and concentration"
4. "Crystal bowl healing frequencies"
5. "Forest ambience with bird calls"
```

## 🎯 Next Steps After MusicGen Works

Once you have real MusicGen working:

1. **Evaluate the quality** - Is it good enough for your needs?
2. **If yes**: You're done! No fine-tuning needed
3. **If no**: Proceed with fine-tuning on Google Colab

## 💰 Cost Considerations

**Hugging Face Free Tier:**
- 30,000 requests/month
- Rate limited
- Good for testing

**Hugging Face Pro ($9/month):**
- 100,000 requests/month
- Higher rate limits
- Priority support

**For your app**: Start with free tier, upgrade if needed.

## 🚀 Quick Test

Try this in your browser console to test the API directly:

```javascript
fetch('https://api-inference.huggingface.co/models/facebook/musicgen-small', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: "Gentle piano melodies for meditation"
  })
})
.then(response => response.blob())
.then(blob => {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
});
```

This will help you verify MusicGen is working before integrating with your app! 
# Setting up Supabase Environment Variables

## Method 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to: **Settings** → **Edge Functions** → **Environment Variables**
3. Add these variables:

```
HUGGING_FACE_TOKEN=hf_your_token_here
```

## Method 2: Via CLI (if you have project linked)

```bash
# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Set the environment variable
supabase secrets set HUGGING_FACE_TOKEN=hf_your_token_here
```

## Method 3: Via .env file (for local development)

Create a `.env` file in your supabase directory:

```bash
echo "HUGGING_FACE_TOKEN=hf_your_token_here" > supabase/.env
```
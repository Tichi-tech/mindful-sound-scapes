# MusicGen-Medium Integration Setup Guide

This guide will help you integrate the MusicGen-medium model into your mindful sound scapes application.

## Overview

The integration provides two deployment options:
1. **Hugging Face Inference API** (Quick setup, pay-per-use)
2. **Self-hosted Python Server** (Better performance, more control)

## Option 1: Hugging Face Inference API (Recommended for testing)

### Setup Steps

1. **Get Hugging Face Token**
   - Visit [Hugging Face Hub](https://huggingface.co/settings/tokens)
   - Create a new token with "Read" permissions
   - Copy the token

2. **Configure Supabase Environment Variables**
   ```bash
   # Add to your Supabase project settings > Edge Functions > Environment Variables
   HUGGING_FACE_TOKEN=your_hf_token_here
   ```

3. **Deploy Updated Function**
   ```bash
   cd mindful-sound-scapes
   supabase functions deploy generate-music
   ```

### Limitations
- 30-second maximum generation time
- API rate limits
- Cold start delays
- Pay-per-request pricing

## Option 2: Self-Hosted Python Server (Recommended for production)

### Prerequisites
- Python 3.10+
- NVIDIA GPU (recommended) or CPU
- Docker (optional)

### Local Setup

1. **Install Dependencies**
   ```bash
   cd mindful-sound-scapes
   pip install -r requirements_musicgen.txt
   ```

2. **Run the Server**
   ```bash
   python musicgen_server.py
   ```

3. **Configure Supabase**
   ```bash
   # Add environment variable in Supabase
   MUSICGEN_SERVER_URL=http://your-server-ip:8080
   ```

### Docker Deployment

1. **Build and Run**
   ```bash
   docker-compose -f docker-compose.musicgen.yml up -d
   ```

2. **For GPU Support** (if available)
   ```bash
   # Ensure NVIDIA Docker runtime is installed
   docker-compose -f docker-compose.musicgen.yml up -d
   ```

### Cloud Deployment Options

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT/musicgen
gcloud run deploy musicgen --image gcr.io/YOUR_PROJECT/musicgen --memory 4Gi --cpu 2
```

#### AWS ECS/Fargate
```bash
# Build and push to ECR
aws ecr build-and-push --dockerfile docker/Dockerfile.musicgen
# Deploy using ECS task definition
```

#### Railway/Render
- Upload the repository
- Set build command: `pip install -r requirements_musicgen.txt`
- Set start command: `python musicgen_server.py`

## Testing the Integration

### Test Hugging Face API
```bash
curl -X POST https://your-supabase-project.supabase.co/functions/v1/generate-music \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "prompt": "peaceful ocean waves with soft piano",
    "style": "ambient",
    "duration": "1-2",
    "title": "Test Track"
  }'
```

### Test Local Server
```bash
# Health check
curl http://localhost:8080/health

# Generate music
curl -X POST http://localhost:8080/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "gentle rain with healing frequencies",
    "style": "nature",
    "duration": 10.0
  }' \
  --output test_music.wav
```

## Performance Considerations

### Model Loading
- First request takes 1-2 minutes to load model
- Subsequent requests are faster (2-10 seconds)
- Keep server warm with periodic health checks

### Hardware Requirements
- **CPU Only**: 8GB+ RAM, slower generation (30-60s)
- **GPU (Recommended)**: NVIDIA GPU with 4GB+ VRAM (5-15s)

### Scaling
- Use load balancers for multiple instances
- Implement request queuing for high load
- Consider model caching strategies

## Security

### API Security
```bash
# Add API key authentication to Python server
API_KEY=your-secret-key
```

### Network Security
- Use HTTPS/TLS for all communications
- Implement rate limiting
- Use VPCs for cloud deployments

## Monitoring

### Health Checks
- `/health` endpoint for basic monitoring
- Monitor GPU memory usage
- Track generation times and errors

### Logging
```python
# The server includes comprehensive logging
# Monitor logs for errors and performance
```

## Troubleshooting

### Common Issues

1. **Model Loading Timeout**
   - Increase timeout in health checks
   - Ensure sufficient memory/GPU resources

2. **CUDA Out of Memory**
   - Reduce batch size or use CPU mode
   - Clear GPU cache between requests

3. **Slow Generation**
   - Check GPU utilization
   - Verify model is using GPU
   - Consider upgrading hardware

### Debug Mode
```bash
# Run server in debug mode
FLASK_DEBUG=1 python musicgen_server.py
```

## Frontend Integration

The existing React frontend will automatically work with the new backend once deployed. The MusicGenerator component will:

1. Send requests to the updated Supabase function
2. Show generation progress
3. Play and download generated audio
4. Display generation status

## Next Steps

1. Choose deployment option (HF API vs self-hosted)
2. Set up environment variables
3. Deploy the updated function
4. Test music generation
5. Monitor performance and costs

## Cost Considerations

### Hugging Face API
- ~$0.001-0.01 per generation
- No infrastructure costs
- Pay only for usage

### Self-Hosted
- Server costs (GPU instances ~$0.50-2.00/hour)
- Higher performance and control
- Better for high-volume usage

Choose based on your expected usage volume and performance requirements.
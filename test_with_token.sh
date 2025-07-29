#!/bin/bash

# Test script with Hugging Face token
# Usage: ./test_with_token.sh your_hf_token_here

if [ -z "$1" ]; then
    echo "Usage: $0 <your_hugging_face_token>"
    echo ""
    echo "Get your token from: https://huggingface.co/settings/tokens"
    exit 1
fi

TOKEN=$1

echo "🧪 Testing MusicGen with your token..."

# Kill existing server
pkill -f musicgen_test_server.py

# Wait a moment
sleep 2

# Start server with token
cd /Users/mima0000/mindful-sound-scapes
source musicgen_env/bin/activate
HUGGING_FACE_TOKEN=$TOKEN python3 musicgen_test_server.py &

# Wait for server to start
sleep 3

echo ""
echo "✅ Server started with token!"
echo ""

# Test health
echo "Testing health endpoint..."
curl -s http://localhost:8080/health | python3 -m json.tool

echo ""
echo "🎵 Ready to generate music!"
echo ""
echo "Try this command:"
echo "curl -X POST http://localhost:8080/generate \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"prompt\": \"peaceful ocean waves\", \"style\": \"ambient\", \"duration\": 10}' \\"
echo "  --output test_music.wav"
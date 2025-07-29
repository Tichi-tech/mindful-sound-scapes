#!/bin/bash

echo "🎵 MusicGen Local Test Setup"
echo "============================"

# Check if virtual environment exists
if [ ! -d "musicgen_env" ]; then
    echo "❌ Virtual environment not found!"
    echo "   Run these commands first:"
    echo "   python3 -m venv musicgen_env"
    echo "   source musicgen_env/bin/activate"
    echo "   pip install flask requests"
    exit 1
fi

# Check if Hugging Face token is set
if [ -z "$HUGGING_FACE_TOKEN" ]; then
    echo ""
    echo "⚠️  HUGGING_FACE_TOKEN not set!"
    echo ""
    echo "1. Get your token from: https://huggingface.co/settings/tokens"
    echo "2. Set it with: export HUGGING_FACE_TOKEN=your_token_here"
    echo "3. Then run this script again"
    echo ""
    exit 1
fi

# Activate virtual environment
source musicgen_env/bin/activate

echo ""
echo "🚀 Starting MusicGen test server..."
echo "   Server will be available at: http://localhost:8080"
echo "   Press Ctrl+C to stop"
echo ""

# Start the server
python3 musicgen_test_server.py
#!/usr/bin/env python3
"""
Test script for MusicGen server
"""

import requests
import json
import os
import sys

def test_server():
    base_url = "http://localhost:8080"
    
    print("🧪 Testing MusicGen Server\n")
    
    # Test health endpoint
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        health_data = response.json()
        print(f"   Status: {health_data['status']}")
        print(f"   API Configured: {health_data['api_configured']}")
        print(f"   Message: {health_data['message']}\n")
        
        if not health_data['api_configured']:
            print("❌ Hugging Face token not set!")
            print("   Get your token from: https://huggingface.co/settings/tokens")
            print("   Then run: export HUGGING_FACE_TOKEN=your_token_here\n")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Server not running! Start it with:")
        print("   python3 musicgen_test_server.py\n")
        return False
    
    # Test music generation
    print("2. Testing music generation...")
    test_requests = [
        {
            "prompt": "gentle rain with soft piano melodies",
            "style": "ambient",
            "duration": 5
        },
        {
            "prompt": "tibetan singing bowls for meditation",
            "style": "tibetan", 
            "duration": 8
        },
        {
            "prompt": "forest sounds with birds chirping",
            "style": "nature",
            "duration": 6
        }
    ]
    
    for i, req_data in enumerate(test_requests, 1):
        print(f"\n   Test {i}: {req_data['prompt'][:40]}...")
        try:
            response = requests.post(
                f"{base_url}/generate",
                json=req_data,
                timeout=180  # 3 minutes timeout
            )
            
            if response.status_code == 200:
                filename = f"test_music_{i}.wav"
                with open(filename, 'wb') as f:
                    f.write(response.content)
                print(f"   ✅ Generated: {filename} ({len(response.content)} bytes)")
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"error": response.text}
                print(f"   ❌ Error: {error_data.get('error', 'Unknown error')}")
                
        except requests.exceptions.Timeout:
            print("   ⏱️  Timeout - Model might be loading (this is normal for the first request)")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n🎵 Test complete!")
    return True

if __name__ == "__main__":
    success = test_server()
    sys.exit(0 if success else 1)
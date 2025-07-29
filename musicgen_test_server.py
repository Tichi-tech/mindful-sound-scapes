#!/usr/bin/env python3
"""
Simple MusicGen test server using Hugging Face Inference API
This version doesn't require local model installation
"""

import os
import requests
import tempfile
import uuid
from flask import Flask, request, jsonify, send_file
import logging
from werkzeug.exceptions import BadRequest

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class MusicGenTestServer:
    def __init__(self):
        self.api_url = "https://api-inference.huggingface.co/models/facebook/musicgen-medium"
        
    def enhance_prompt(self, prompt: str, style: str) -> str:
        """Enhance prompt with style-specific context"""
        style_contexts = {
            "ambient": "ambient healing meditation music, soft and ethereal",
            "nature": "natural sounds with gentle instrumental accompaniment",
            "binaural": "binaural beats for focus and relaxation",
            "tibetan": "tibetan singing bowls with meditation ambience",
            "piano": "peaceful piano melodies for healing and relaxation",
            "crystal": "crystal bowl harmonics with healing frequencies",
            "meditation": "deep meditation music with soft drones",
            "chakra": "chakra healing frequencies with harmonic tones"
        }
        
        context = style_contexts.get(style, style_contexts["ambient"])
        return f"{context}, {prompt}"
    
    def generate_music(self, prompt: str, style: str = "ambient", duration: float = 10.0) -> bytes:
        """Generate music using Hugging Face Inference API"""
        # Get API token from environment
        api_token = os.environ.get('HUGGING_FACE_TOKEN')
        if not api_token:
            raise ValueError("HUGGING_FACE_TOKEN environment variable not set")
        
        try:
            # Enhance prompt
            enhanced_prompt = self.enhance_prompt(prompt, style)
            logger.info(f"Generating music for prompt: {enhanced_prompt}")
            
            headers = {
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "inputs": enhanced_prompt,
                "parameters": {
                    "duration": min(duration, 30.0),  # Max 30 seconds
                    "do_sample": True,
                    "temperature": 0.7,
                    "top_k": 250,
                    "top_p": 0.95
                }
            }
            
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=120)
            
            if response.status_code == 503:
                logger.warning("Model is loading, this may take a few minutes...")
                raise ValueError("Model is loading, please try again in a few minutes")
            elif response.status_code != 200:
                logger.error(f"API error: {response.status_code} - {response.text}")
                raise ValueError(f"API error: {response.status_code}")
            
            audio_bytes = response.content
            logger.info(f"Generated {len(audio_bytes)} bytes of audio")
            return audio_bytes
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            raise ValueError(f"Request failed: {e}")
        except Exception as e:
            logger.error(f"Music generation failed: {e}")
            raise

# Global server instance
music_server = MusicGenTestServer()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    has_token = bool(os.environ.get('HUGGING_FACE_TOKEN'))
    return jsonify({
        "status": "healthy", 
        "api_configured": has_token,
        "message": "Set HUGGING_FACE_TOKEN env var to use the API" if not has_token else "Ready to generate music"
    })

@app.route('/generate', methods=['POST'])
def generate_music():
    """Generate music endpoint"""
    try:
        data = request.get_json()
        if not data:
            raise BadRequest("No JSON data provided")
        
        prompt = data.get('prompt', '')
        style = data.get('style', 'ambient')
        duration = min(float(data.get('duration', 10.0)), 30.0)  # Max 30 seconds
        
        if not prompt.strip():
            raise BadRequest("Prompt is required")
        
        # Generate music
        audio_bytes = music_server.generate_music(prompt, style, duration)
        
        # Create temporary file to return
        temp_id = str(uuid.uuid4())
        temp_path = f"/tmp/music_{temp_id}.wav"
        
        with open(temp_path, 'wb') as f:
            f.write(audio_bytes)
        
        return send_file(
            temp_path,
            mimetype='audio/wav',
            as_attachment=True,
            download_name=f'generated_music_{temp_id}.wav'
        )
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except BadRequest as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Generation endpoint error: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Check for API token
    if not os.environ.get('HUGGING_FACE_TOKEN'):
        print("\n⚠️  WARNING: HUGGING_FACE_TOKEN environment variable not set!")
        print("   Get your token from: https://huggingface.co/settings/tokens")
        print("   Then run: export HUGGING_FACE_TOKEN=your_token_here")
        print("   Or set it when running: HUGGING_FACE_TOKEN=your_token python3 musicgen_test_server.py\n")
    
    # Start server
    port = int(os.environ.get('PORT', 8080))
    print(f"\n🎵 MusicGen Test Server starting on http://localhost:{port}")
    print("   Test endpoint: POST /generate")
    print("   Health check: GET /health\n")
    
    app.run(host='0.0.0.0', port=port, debug=True)
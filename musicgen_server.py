#!/usr/bin/env python3
"""
MusicGen-Medium server for mindful sound scapes
Provides REST API endpoint for generating music using MusicGen-medium model
"""

import os
import tempfile
import uuid
from typing import Optional, Dict, Any
import torch
from transformers import MusicgenForConditionalGeneration, AutoProcessor
import scipy.io.wavfile
from flask import Flask, request, jsonify, send_file
import logging
from werkzeug.exceptions import BadRequest

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class MusicGenServer:
    def __init__(self):
        self.model = None
        self.processor = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")
        
    def load_model(self):
        """Load MusicGen-medium model"""
        try:
            logger.info("Loading MusicGen-medium model...")
            self.processor = AutoProcessor.from_pretrained("facebook/musicgen-medium")
            self.model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-medium")
            self.model.to(self.device)
            logger.info("Model loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
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
        """Generate music using MusicGen-medium"""
        if self.model is None:
            self.load_model()
        
        try:
            # Enhance prompt
            enhanced_prompt = self.enhance_prompt(prompt, style)
            logger.info(f"Generating music for prompt: {enhanced_prompt}")
            
            # Prepare inputs
            inputs = self.processor(
                text=[enhanced_prompt],
                padding=True,
                return_tensors="pt"
            ).to(self.device)
            
            # Generate audio
            with torch.no_grad():
                audio_values = self.model.generate(
                    **inputs,
                    max_new_tokens=int(duration * 50),  # ~50 tokens per second
                    do_sample=True,
                    temperature=0.7,
                    top_k=250,
                    top_p=0.95
                )
            
            # Convert to numpy and save as WAV
            audio_data = audio_values[0, 0].cpu().numpy()
            
            # Create temporary WAV file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                scipy.io.wavfile.write(tmp_file.name, rate=32000, data=audio_data)
                
                # Read file as bytes
                with open(tmp_file.name, 'rb') as f:
                    wav_bytes = f.read()
                
                # Clean up temp file
                os.unlink(tmp_file.name)
                
            logger.info(f"Generated {len(wav_bytes)} bytes of audio")
            return wav_bytes
            
        except Exception as e:
            logger.error(f"Music generation failed: {e}")
            raise

# Global server instance
music_server = MusicGenServer()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "model_loaded": music_server.model is not None})

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
        wav_bytes = music_server.generate_music(prompt, style, duration)
        
        # Create temporary file to return
        temp_id = str(uuid.uuid4())
        temp_path = f"/tmp/music_{temp_id}.wav"
        
        with open(temp_path, 'wb') as f:
            f.write(wav_bytes)
        
        return send_file(
            temp_path,
            mimetype='audio/wav',
            as_attachment=True,
            download_name=f'generated_music_{temp_id}.wav'
        )
        
    except BadRequest as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Generation endpoint error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/load-model', methods=['POST'])
def load_model():
    """Load model endpoint"""
    try:
        music_server.load_model()
        return jsonify({"status": "Model loaded successfully"})
    except Exception as e:
        logger.error(f"Model loading failed: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Load model on startup
    try:
        music_server.load_model()
    except Exception as e:
        logger.warning(f"Failed to load model on startup: {e}")
        logger.info("Model will be loaded on first request")
    
    # Start server
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
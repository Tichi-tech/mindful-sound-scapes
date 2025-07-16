#!/usr/bin/env python3
"""
🎵 Example Usage of Audio Preprocessing Pipeline

This script demonstrates how to use the AudioPreprocessingPipeline
with sample data for MusicGen fine-tuning.
"""

import json
import os
from pathlib import Path
from audio_preprocessing_pipeline import AudioPreprocessingPipeline

def create_sample_dataset():
    """Create a sample dataset structure for demonstration"""
    
    # Create directories
    dataset_dir = Path("healing_music_dataset")
    audio_dir = dataset_dir / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    
    # Create sample metadata
    sample_metadata = [
        {
            "text": "Gentle rain sounds with soft piano melodies for deep relaxation and stress relief. The music gradually builds in warmth and then gently fades, creating a sense of inner peace and tranquility.",
            "audio_file": "ambient_001.wav",
            "style": "ambient",
            "duration": "3-5",
            "emotion": "relaxation",
            "instruments": ["piano", "rain sounds"],
            "therapeutic_benefit": "stress relief, deep relaxation"
        },
        {
            "text": "Resonant Tibetan singing bowls with deep, spiritual frequencies layered with subtle nature sounds including distant bird calls and gentle wind. Perfect for spiritual meditation and chakra healing.",
            "audio_file": "tibetan_001.wav",
            "style": "tibetan",
            "duration": "5-10",
            "emotion": "meditation",
            "instruments": ["singing bowls", "nature sounds"],
            "therapeutic_benefit": "spiritual meditation, chakra healing"
        },
        {
            "text": "Steady binaural beats at 40Hz for concentration and focus, accompanied by soft synthesizer pads and gentle ambient textures. The rhythm is consistent but not repetitive, maintaining attention without distraction.",
            "audio_file": "binaural_001.wav",
            "style": "binaural",
            "duration": "2-3",
            "emotion": "focus",
            "instruments": ["binaural beats", "synthesizer"],
            "therapeutic_benefit": "concentration, focus enhancement"
        },
        {
            "text": "Soft crystal bowl harmonics with gentle reverb and ethereal overtones. The pure tones create a healing atmosphere perfect for deep meditation and energy cleansing.",
            "audio_file": "crystal_001.wav",
            "style": "crystal",
            "duration": "3-5",
            "emotion": "healing",
            "instruments": ["crystal bowls", "reverb"],
            "therapeutic_benefit": "energy cleansing, deep meditation"
        },
        {
            "text": "Peaceful forest ambience with distant bird songs, gentle wind through leaves, and the soft sound of a flowing stream. Creates a natural sanctuary for mindfulness practice.",
            "audio_file": "nature_001.wav",
            "style": "nature",
            "duration": "5-10",
            "emotion": "peace",
            "instruments": ["bird songs", "wind", "stream"],
            "therapeutic_benefit": "mindfulness, natural connection"
        }
    ]
    
    # Save metadata
    metadata_file = dataset_dir / "metadata.json"
    with open(metadata_file, 'w') as f:
        json.dump(sample_metadata, f, indent=2)
    
    print(f"✅ Created sample dataset structure:")
    print(f"   📁 Dataset directory: {dataset_dir}")
    print(f"   🎵 Audio directory: {audio_dir}")
    print(f"   📄 Metadata file: {metadata_file}")
    print(f"   📊 Sample entries: {len(sample_metadata)}")
    
    return dataset_dir

def create_demo_audio_files():
    """Create demo audio files for testing (sine wave examples)"""
    
    import numpy as np
    import librosa
    
    audio_dir = Path("healing_music_dataset/audio")
    
    # Create different demo sounds
    demo_sounds = {
        "ambient_001.wav": {
            "frequencies": [220, 330, 440],  # Piano-like
            "duration": 180,  # 3 minutes
            "description": "Gentle piano-like tones"
        },
        "tibetan_001.wav": {
            "frequencies": [256, 384, 512],  # Tibetan bowl-like
            "duration": 300,  # 5 minutes
            "description": "Tibetan bowl harmonics"
        },
        "binaural_001.wav": {
            "frequencies": [440, 444],  # Binaural beats
            "duration": 120,  # 2 minutes
            "description": "40Hz binaural beats"
        },
        "crystal_001.wav": {
            "frequencies": [440, 880, 1320],  # Crystal-like
            "duration": 180,  # 3 minutes
            "description": "Crystal bowl harmonics"
        },
        "nature_001.wav": {
            "frequencies": [200, 400, 600],  # Nature-like
            "duration": 300,  # 5 minutes
            "description": "Nature ambience"
        }
    }
    
    sample_rate = 32000  # MusicGen requirement
    
    for filename, config in demo_sounds.items():
        filepath = audio_dir / filename
        
        # Generate sine wave audio
        duration_samples = config['duration'] * sample_rate
        t = np.linspace(0, config['duration'], duration_samples, False)
        
        # Mix multiple frequencies
        audio = np.zeros_like(t)
        for i, freq in enumerate(config['frequencies']):
            amplitude = 0.3 / len(config['frequencies']) * (1 - i * 0.1)
            audio += amplitude * np.sin(2 * np.pi * freq * t)
        
        # Add gentle amplitude modulation
        audio *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.1 * t)
        
        # Apply fade in/out
        fade_samples = int(2 * sample_rate)  # 2 second fade
        audio[:fade_samples] *= np.linspace(0, 1, fade_samples)
        audio[-fade_samples:] *= np.linspace(1, 0, fade_samples)
        
        # Normalize
        audio = librosa.util.normalize(audio)
        
        # Save as WAV
        librosa.output.write_wav(filepath, audio, sample_rate)
        
        print(f"   🎵 Created: {filename} ({config['description']})")
    
    print(f"✅ Created {len(demo_sounds)} demo audio files")

def run_preprocessing_example():
    """Run the preprocessing pipeline on the sample dataset"""
    
    print("\n🚀 Running Audio Preprocessing Pipeline Example")
    print("=" * 50)
    
    # Initialize pipeline
    pipeline = AudioPreprocessingPipeline(
        audio_dir="healing_music_dataset/audio",
        metadata_file="healing_music_dataset/metadata.json",
        output_dir="processed_dataset_example",
        target_sample_rate=32000,
        max_audio_length=30,  # Limit to 30 seconds for demo
        model_name="facebook/musicgen-small"
    )
    
    try:
        # Process dataset
        print("\n📊 Processing dataset...")
        dataset = pipeline.process_dataset()
        
        # Create train/validation split
        print("\n📈 Creating train/validation split...")
        dataset_dict = pipeline.create_train_val_split(dataset, val_split=0.2)
        
        # Generate visualizations
        print("\n📊 Generating visualizations...")
        pipeline.visualize_features(dataset, num_samples=3)
        
        # Generate summary
        print("\n📋 Generating dataset summary...")
        summary = pipeline.generate_dataset_summary(dataset)
        
        print("\n🎉 Example preprocessing completed successfully!")
        print(f"📁 Output directory: {pipeline.output_dir}")
        print(f"📊 Total samples processed: {len(dataset)}")
        print(f"🚂 Train samples: {len(dataset_dict['train'])}")
        print(f"✅ Validation samples: {len(dataset_dict['validation'])}")
        
        return dataset, dataset_dict
        
    except Exception as e:
        print(f"❌ Error in preprocessing: {e}")
        raise

def demonstrate_dataset_usage(dataset, dataset_dict):
    """Demonstrate how to use the processed dataset"""
    
    print("\n🔍 Dataset Usage Demonstration")
    print("=" * 40)
    
    # Show sample structure
    sample = dataset[0]
    print(f"\n📋 Sample structure:")
    print(f"   Audio file: {sample['audio_file']}")
    print(f"   Text: {sample['text'][:100]}...")
    print(f"   Style: {sample['style']}")
    print(f"   Duration: {sample['audio_features']['duration']:.1f} seconds")
    print(f"   Tempo: {sample['audio_features']['tempo']:.1f} BPM")
    
    # Show feature dimensions
    print(f"\n🎯 Feature dimensions:")
    print(f"   MusicGen input_ids: {len(sample['musicgen_features']['input_ids'][0])} tokens")
    print(f"   Whisper features: {len(sample['whisper_features']['input_features'][0])} frames")
    print(f"   MFCC coefficients: {len(sample['audio_features']['mfcc_mean'])}")
    
    # Show dataset statistics
    print(f"\n📊 Dataset statistics:")
    print(f"   Total samples: {len(dataset)}")
    print(f"   Train samples: {len(dataset_dict['train'])}")
    print(f"   Validation samples: {len(dataset_dict['validation'])}")
    
    # Show style distribution
    styles = {}
    for sample in dataset:
        style = sample['style']
        styles[style] = styles.get(style, 0) + 1
    
    print(f"\n🎨 Style distribution:")
    for style, count in styles.items():
        print(f"   {style}: {count} samples")

def main():
    """Main function to run the complete example"""
    
    print("🎵 Audio Preprocessing Pipeline - Example Usage")
    print("=" * 60)
    
    try:
        # Step 1: Create sample dataset
        print("\n📁 Step 1: Creating sample dataset structure...")
        create_sample_dataset()
        
        # Step 2: Create demo audio files
        print("\n🎵 Step 2: Creating demo audio files...")
        create_demo_audio_files()
        
        # Step 3: Run preprocessing pipeline
        print("\n🔄 Step 3: Running preprocessing pipeline...")
        dataset, dataset_dict = run_preprocessing_example()
        
        # Step 4: Demonstrate usage
        print("\n📖 Step 4: Demonstrating dataset usage...")
        demonstrate_dataset_usage(dataset, dataset_dict)
        
        print("\n🎉 Example completed successfully!")
        print("\n📋 Next steps:")
        print("1. Review the generated visualizations in processed_dataset_example/visualizations/")
        print("2. Check the dataset summary in processed_dataset_example/dataset_summary.json")
        print("3. Use the processed dataset for MusicGen fine-tuning")
        print("4. Replace demo audio files with your real healing music samples")
        
    except Exception as e:
        print(f"❌ Error in example: {e}")
        raise

if __name__ == "__main__":
    main() 
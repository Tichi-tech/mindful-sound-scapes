#!/usr/bin/env python3
"""
🚀 Quick Start Script for Audio Preprocessing Pipeline

This script provides a simple interface to run the complete preprocessing pipeline
for MusicGen fine-tuning. It handles setup, validation, and execution.
"""

import os
import sys
import json
from pathlib import Path
from typing import Optional

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        'transformers', 'datasets', 'torch', 'torchaudio', 
        'librosa', 'numpy', 'matplotlib', 'tqdm'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n📦 Install with:")
        print("   pip install -r requirements_preprocessing.txt")
        return False
    
    print("✅ All required packages are installed")
    return True

def validate_dataset_structure(audio_dir: str, metadata_file: str) -> bool:
    """Validate that the dataset structure is correct"""
    
    audio_path = Path(audio_dir)
    metadata_path = Path(metadata_file)
    
    # Check if directories and files exist
    if not audio_path.exists():
        print(f"❌ Audio directory not found: {audio_dir}")
        return False
    
    if not metadata_path.exists():
        print(f"❌ Metadata file not found: {metadata_file}")
        return False
    
    # Check if metadata is valid JSON
    try:
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        if not isinstance(metadata, list):
            print("❌ Metadata should be a list of audio entries")
            return False
        
        # Check if audio files exist
        missing_files = []
        for entry in metadata:
            audio_file = entry.get('audio_file', '')
            if audio_file:
                audio_file_path = audio_path / audio_file
                if not audio_file_path.exists():
                    missing_files.append(audio_file)
        
        if missing_files:
            print("❌ Missing audio files:")
            for file in missing_files:
                print(f"   - {file}")
            return False
        
        print(f"✅ Dataset structure validated")
        print(f"   📁 Audio files: {len([f for f in audio_path.glob('*.wav')])}")
        print(f"   📄 Metadata entries: {len(metadata)}")
        return True
        
    except json.JSONDecodeError:
        print("❌ Invalid JSON in metadata file")
        return False
    except Exception as e:
        print(f"❌ Error validating dataset: {e}")
        return False

def run_preprocessing_pipeline(
    audio_dir: str = "healing_music_dataset/audio",
    metadata_file: str = "healing_music_dataset/metadata.json",
    output_dir: str = "processed_dataset",
    target_sample_rate: int = 32000,
    max_audio_length: int = 30,
    model_name: str = "facebook/musicgen-small",
    create_visualizations: bool = True,
    create_splits: bool = True
):
    """Run the complete preprocessing pipeline"""
    
    print("🎵 Audio Preprocessing Pipeline - Quick Start")
    print("=" * 50)
    
    # Step 1: Check dependencies
    print("\n📦 Step 1: Checking dependencies...")
    if not check_dependencies():
        return False
    
    # Step 2: Validate dataset structure
    print("\n🔍 Step 2: Validating dataset structure...")
    if not validate_dataset_structure(audio_dir, metadata_file):
        return False
    
    # Step 3: Import and run pipeline
    print("\n🚀 Step 3: Running preprocessing pipeline...")
    try:
        from audio_preprocessing_pipeline import AudioPreprocessingPipeline
        
        # Initialize pipeline
        pipeline = AudioPreprocessingPipeline(
            audio_dir=audio_dir,
            metadata_file=metadata_file,
            output_dir=output_dir,
            target_sample_rate=target_sample_rate,
            max_audio_length=max_audio_length,
            model_name=model_name
        )
        
        # Process dataset
        dataset = pipeline.process_dataset()
        
        # Create train/validation splits
        if create_splits:
            print("\n📈 Creating train/validation splits...")
            dataset_dict = pipeline.create_train_val_split(dataset, val_split=0.2)
        
        # Generate visualizations
        if create_visualizations:
            print("\n📊 Generating visualizations...")
            pipeline.visualize_features(dataset, num_samples=5)
        
        # Generate summary
        print("\n📋 Generating dataset summary...")
        summary = pipeline.generate_dataset_summary(dataset)
        
        print("\n🎉 Preprocessing completed successfully!")
        print(f"📁 Output directory: {pipeline.output_dir}")
        print(f"📊 Total samples processed: {len(dataset)}")
        
        if create_splits:
            print(f"🚂 Train samples: {len(dataset_dict['train'])}")
            print(f"✅ Validation samples: {len(dataset_dict['validation'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in preprocessing pipeline: {e}")
        return False

def create_example_dataset():
    """Create an example dataset for testing"""
    
    print("\n🎯 Creating example dataset...")
    
    try:
        from example_usage import create_sample_dataset, create_demo_audio_files
        
        create_sample_dataset()
        create_demo_audio_files()
        
        print("✅ Example dataset created successfully!")
        print("   You can now run the preprocessing pipeline on this example dataset")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating example dataset: {e}")
        return False

def main():
    """Main function with command line interface"""
    
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Quick Start Script for Audio Preprocessing Pipeline"
    )
    
    parser.add_argument(
        "--audio-dir",
        default="healing_music_dataset/audio",
        help="Directory containing audio files"
    )
    
    parser.add_argument(
        "--metadata-file",
        default="healing_music_dataset/metadata.json",
        help="JSON file containing audio metadata"
    )
    
    parser.add_argument(
        "--output-dir",
        default="processed_dataset",
        help="Output directory for processed dataset"
    )
    
    parser.add_argument(
        "--sample-rate",
        type=int,
        default=32000,
        help="Target sample rate (default: 32000)"
    )
    
    parser.add_argument(
        "--max-length",
        type=int,
        default=30,
        help="Maximum audio length in seconds (default: 30)"
    )
    
    parser.add_argument(
        "--model",
        default="facebook/musicgen-small",
        help="MusicGen model name (default: facebook/musicgen-small)"
    )
    
    parser.add_argument(
        "--no-visualizations",
        action="store_true",
        help="Skip generating visualizations"
    )
    
    parser.add_argument(
        "--no-splits",
        action="store_true",
        help="Skip creating train/validation splits"
    )
    
    parser.add_argument(
        "--create-example",
        action="store_true",
        help="Create an example dataset for testing"
    )
    
    args = parser.parse_args()
    
    # Handle example dataset creation
    if args.create_example:
        if create_example_dataset():
            print("\n🎯 To run preprocessing on the example dataset:")
            print("   python quick_start.py")
        return
    
    # Run preprocessing pipeline
    success = run_preprocessing_pipeline(
        audio_dir=args.audio_dir,
        metadata_file=args.metadata_file,
        output_dir=args.output_dir,
        target_sample_rate=args.sample_rate,
        max_audio_length=args.max_length,
        model_name=args.model,
        create_visualizations=not args.no_visualizations,
        create_splits=not args.no_splits
    )
    
    if success:
        print("\n🎉 Pipeline completed successfully!")
        print("\n📋 Next steps:")
        print("1. Review visualizations in the output directory")
        print("2. Check dataset summary for statistics")
        print("3. Use the processed dataset for MusicGen fine-tuning")
        print("4. Upload to Hugging Face Hub for sharing")
    else:
        print("\n❌ Pipeline failed. Check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 
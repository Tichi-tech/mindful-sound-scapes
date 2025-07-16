#!/usr/bin/env python3
"""
🎵 Audio Preprocessing Pipeline for MusicGen Fine-tuning

This script converts raw audio data to preprocessing data suitable for fine-tuning
the MusicGen model. It includes feature extraction, data preparation, and dataset creation.

Requirements:
- transformers
- datasets
- torch
- torchaudio
- librosa
- numpy
- pandas
- json
"""

import os
import json
import numpy as np
import pandas as pd
import torch
import torchaudio
import librosa
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from datasets import Dataset, DatasetDict
from transformers import (
    MusicgenProcessor, 
    MusicgenForConditionalGeneration,
    WhisperFeatureExtractor,
    AutoProcessor
)
import matplotlib.pyplot as plt
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')

class AudioPreprocessingPipeline:
    """
    Complete pipeline for preprocessing audio data for MusicGen fine-tuning
    """
    
    def __init__(
        self,
        audio_dir: str = "healing_music_dataset/audio",
        metadata_file: str = "healing_music_dataset/metadata.json",
        output_dir: str = "processed_dataset",
        target_sample_rate: int = 32000,
        max_audio_length: int = 30,  # seconds
        model_name: str = "facebook/musicgen-small"
    ):
        self.audio_dir = Path(audio_dir)
        self.metadata_file = Path(metadata_file)
        self.output_dir = Path(output_dir)
        self.target_sample_rate = target_sample_rate
        self.max_audio_length = max_audio_length
        self.model_name = model_name
        
        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize processors
        self.musicgen_processor = None
        self.whisper_feature_extractor = None
        
        print(f"🎵 Audio Preprocessing Pipeline initialized")
        print(f"📁 Audio directory: {self.audio_dir}")
        print(f"📄 Metadata file: {self.metadata_file}")
        print(f"📤 Output directory: {self.output_dir}")
        print(f"🎯 Target sample rate: {self.target_sample_rate} Hz")
        print(f"⏱️  Max audio length: {self.max_audio_length} seconds")
    
    def load_processors(self):
        """Load MusicGen processor and Whisper feature extractor"""
        print("🔄 Loading processors...")
        
        try:
            # Load MusicGen processor
            self.musicgen_processor = MusicgenProcessor.from_pretrained(self.model_name)
            print(f"✅ MusicGen processor loaded: {self.model_name}")
            
            # Load Whisper feature extractor for additional features
            self.whisper_feature_extractor = WhisperFeatureExtractor.from_pretrained("openai/whisper-small")
            print("✅ Whisper feature extractor loaded")
            
        except Exception as e:
            print(f"❌ Error loading processors: {e}")
            raise
    
    def load_audio_file(self, file_path: str) -> Tuple[np.ndarray, int]:
        """
        Load and preprocess audio file
        
        Args:
            file_path: Path to audio file
            
        Returns:
            Tuple of (audio_array, sample_rate)
        """
        try:
            # Load audio with librosa (handles various formats)
            audio_array, sample_rate = librosa.load(
                file_path, 
                sr=self.target_sample_rate,
                mono=True
            )
            
            # Normalize audio
            audio_array = librosa.util.normalize(audio_array)
            
            # Trim silence
            audio_array, _ = librosa.effects.trim(audio_array, top_db=20)
            
            return audio_array, sample_rate
            
        except Exception as e:
            print(f"❌ Error loading audio file {file_path}: {e}")
            return None, None
    
    def extract_audio_features(self, audio_array: np.ndarray, sample_rate: int) -> Dict[str, Any]:
        """
        Extract comprehensive audio features
        
        Args:
            audio_array: Audio data as numpy array
            sample_rate: Sample rate of audio
            
        Returns:
            Dictionary of extracted features
        """
        features = {}
        
        try:
            # Basic features
            features['duration'] = len(audio_array) / sample_rate
            features['sample_rate'] = sample_rate
            
            # Spectral features
            stft = librosa.stft(audio_array)
            features['spectral_centroid'] = np.mean(librosa.feature.spectral_centroid(S=stft))
            features['spectral_bandwidth'] = np.mean(librosa.feature.spectral_bandwidth(S=stft))
            features['spectral_rolloff'] = np.mean(librosa.feature.spectral_rolloff(S=stft))
            
            # MFCC features
            mfccs = librosa.feature.mfcc(y=audio_array, sr=sample_rate, n_mfcc=13)
            features['mfcc_mean'] = np.mean(mfccs, axis=1).tolist()
            features['mfcc_std'] = np.std(mfccs, axis=1).tolist()
            
            # Tempo and rhythm
            tempo, _ = librosa.beat.beat_track(y=audio_array, sr=sample_rate)
            features['tempo'] = tempo
            
            # Harmonic features
            harmonic, percussive = librosa.effects.hpss(audio_array)
            features['harmonic_ratio'] = np.mean(np.abs(harmonic)) / (np.mean(np.abs(harmonic)) + np.mean(np.abs(percussive)))
            
            # Zero crossing rate
            features['zero_crossing_rate'] = np.mean(librosa.feature.zero_crossing_rate(audio_array))
            
            # RMS energy
            features['rms_energy'] = np.mean(librosa.feature.rms(y=audio_array))
            
        except Exception as e:
            print(f"❌ Error extracting features: {e}")
            features = {}
        
        return features
    
    def prepare_musicgen_features(self, audio_array: np.ndarray, text: str) -> Dict[str, Any]:
        """
        Prepare features specifically for MusicGen model
        
        Args:
            audio_array: Audio data as numpy array
            text: Text prompt describing the audio
            
        Returns:
            Dictionary with MusicGen-compatible features
        """
        if self.musicgen_processor is None:
            raise ValueError("MusicGen processor not loaded. Call load_processors() first.")
        
        try:
            # Process with MusicGen processor
            inputs = self.musicgen_processor(
                text=[text],
                audio=audio_array,
                sampling_rate=self.target_sample_rate,
                return_tensors="pt"
            )
            
            # Convert to numpy for storage
            processed_features = {
                'input_ids': inputs['input_ids'].numpy().tolist(),
                'attention_mask': inputs['attention_mask'].numpy().tolist(),
                'labels': inputs['labels'].numpy().tolist() if 'labels' in inputs else None
            }
            
            return processed_features
            
        except Exception as e:
            print(f"❌ Error preparing MusicGen features: {e}")
            return {}
    
    def prepare_whisper_features(self, audio_array: np.ndarray) -> Dict[str, Any]:
        """
        Prepare features using Whisper feature extractor
        
        Args:
            audio_array: Audio data as numpy array
            
        Returns:
            Dictionary with Whisper-compatible features
        """
        if self.whisper_feature_extractor is None:
            raise ValueError("Whisper feature extractor not loaded. Call load_processors() first.")
        
        try:
            # Process with Whisper feature extractor
            features = self.whisper_feature_extractor(
                audio_array, 
                sampling_rate=self.target_sample_rate, 
                padding=True
            )
            
            return {
                'input_features': features['input_features']
            }
            
        except Exception as e:
            print(f"❌ Error preparing Whisper features: {e}")
            return {}
    
    def process_single_audio(self, audio_file: str, metadata: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Process a single audio file with its metadata
        
        Args:
            audio_file: Path to audio file
            metadata: Metadata for the audio file
            
        Returns:
            Processed data dictionary or None if failed
        """
        audio_path = self.audio_dir / audio_file
        
        if not audio_path.exists():
            print(f"❌ Audio file not found: {audio_path}")
            return None
        
        print(f"🔄 Processing: {audio_file}")
        
        # Load audio
        audio_array, sample_rate = self.load_audio_file(str(audio_path))
        if audio_array is None:
            return None
        
        # Check duration
        duration = len(audio_array) / sample_rate
        if duration > self.max_audio_length:
            print(f"⚠️  Audio too long ({duration:.1f}s), truncating to {self.max_audio_length}s")
            max_samples = int(self.max_audio_length * sample_rate)
            audio_array = audio_array[:max_samples]
        
        # Extract features
        audio_features = self.extract_audio_features(audio_array, sample_rate)
        musicgen_features = self.prepare_musicgen_features(audio_array, metadata['text'])
        whisper_features = self.prepare_whisper_features(audio_array)
        
        # Combine all data
        processed_data = {
            'audio_file': audio_file,
            'text': metadata['text'],
            'style': metadata.get('style', 'unknown'),
            'duration': metadata.get('duration', 'unknown'),
            'emotion': metadata.get('emotion', 'unknown'),
            'instruments': metadata.get('instruments', []),
            'therapeutic_benefit': metadata.get('therapeutic_benefit', ''),
            'audio_features': audio_features,
            'musicgen_features': musicgen_features,
            'whisper_features': whisper_features,
            'processed_audio': audio_array.tolist(),
            'sample_rate': sample_rate
        }
        
        return processed_data
    
    def process_dataset(self) -> Dataset:
        """
        Process the entire dataset
        
        Returns:
            HuggingFace Dataset with processed features
        """
        print("🚀 Starting dataset processing...")
        
        # Load metadata
        if not self.metadata_file.exists():
            raise FileNotFoundError(f"Metadata file not found: {self.metadata_file}")
        
        with open(self.metadata_file, 'r') as f:
            metadata_list = json.load(f)
        
        print(f"📊 Found {len(metadata_list)} audio files to process")
        
        # Load processors
        self.load_processors()
        
        # Process each audio file
        processed_data = []
        
        for metadata in tqdm(metadata_list, desc="Processing audio files"):
            audio_file = metadata.get('audio_file', '')
            if not audio_file:
                continue
            
            processed_item = self.process_single_audio(audio_file, metadata)
            if processed_item:
                processed_data.append(processed_item)
        
        print(f"✅ Successfully processed {len(processed_data)} audio files")
        
        # Create HuggingFace Dataset
        dataset = Dataset.from_list(processed_data)
        
        # Save processed dataset
        dataset.save_to_disk(str(self.output_dir / "processed_dataset"))
        
        # Save metadata
        with open(self.output_dir / "processing_metadata.json", 'w') as f:
            json.dump({
                'total_files': len(metadata_list),
                'processed_files': len(processed_data),
                'failed_files': len(metadata_list) - len(processed_data),
                'target_sample_rate': self.target_sample_rate,
                'max_audio_length': self.max_audio_length,
                'model_name': self.model_name
            }, f, indent=2)
        
        return dataset
    
    def create_train_val_split(self, dataset: Dataset, val_split: float = 0.2) -> DatasetDict:
        """
        Create train/validation split
        
        Args:
            dataset: Processed dataset
            val_split: Fraction of data to use for validation
            
        Returns:
            DatasetDict with train and validation splits
        """
        print(f"📊 Creating train/validation split (val_split={val_split})")
        
        # Shuffle dataset
        dataset = dataset.shuffle(seed=42)
        
        # Split dataset
        split_dataset = dataset.train_test_split(test_size=val_split, seed=42)
        
        dataset_dict = DatasetDict({
            'train': split_dataset['train'],
            'validation': split_dataset['test']
        })
        
        # Save splits
        dataset_dict.save_to_disk(str(self.output_dir / "train_val_split"))
        
        print(f"✅ Created train/validation split:")
        print(f"   Train: {len(dataset_dict['train'])} samples")
        print(f"   Validation: {len(dataset_dict['validation'])} samples")
        
        return dataset_dict
    
    def visualize_features(self, dataset: Dataset, num_samples: int = 5):
        """
        Visualize extracted features for quality control
        
        Args:
            dataset: Processed dataset
            num_samples: Number of samples to visualize
        """
        print(f"📊 Visualizing features for {num_samples} samples...")
        
        # Create visualization directory
        viz_dir = self.output_dir / "visualizations"
        viz_dir.mkdir(exist_ok=True)
        
        for i in range(min(num_samples, len(dataset))):
            sample = dataset[i]
            
            # Create figure with subplots
            fig, axes = plt.subplots(2, 2, figsize=(15, 10))
            fig.suptitle(f'Sample {i+1}: {sample["audio_file"]}', fontsize=16)
            
            # Plot 1: Waveform
            audio_array = np.array(sample['processed_audio'])
            axes[0, 0].plot(audio_array)
            axes[0, 0].set_title('Waveform')
            axes[0, 0].set_xlabel('Samples')
            axes[0, 0].set_ylabel('Amplitude')
            
            # Plot 2: Spectrogram
            D = librosa.amplitude_to_db(np.abs(librosa.stft(audio_array)), ref=np.max)
            librosa.display.specshow(D, sr=sample['sample_rate'], x_axis='time', y_axis='log', ax=axes[0, 1])
            axes[0, 1].set_title('Spectrogram')
            
            # Plot 3: MFCC
            mfccs = np.array(sample['audio_features']['mfcc_mean'])
            axes[1, 0].bar(range(len(mfccs)), mfccs)
            axes[1, 0].set_title('MFCC Features (Mean)')
            axes[1, 0].set_xlabel('MFCC Coefficient')
            axes[1, 0].set_ylabel('Value')
            
            # Plot 4: Feature summary
            features = sample['audio_features']
            feature_names = ['tempo', 'harmonic_ratio', 'zero_crossing_rate', 'rms_energy']
            feature_values = [features.get(name, 0) for name in feature_names]
            
            axes[1, 1].bar(feature_names, feature_values)
            axes[1, 1].set_title('Audio Features Summary')
            axes[1, 1].tick_params(axis='x', rotation=45)
            
            plt.tight_layout()
            plt.savefig(viz_dir / f'sample_{i+1}_features.png', dpi=300, bbox_inches='tight')
            plt.close()
        
        print(f"✅ Visualizations saved to {viz_dir}")
    
    def generate_dataset_summary(self, dataset: Dataset):
        """
        Generate comprehensive dataset summary
        
        Args:
            dataset: Processed dataset
        """
        print("📊 Generating dataset summary...")
        
        summary = {
            'total_samples': len(dataset),
            'styles': {},
            'emotions': {},
            'durations': {},
            'feature_statistics': {}
        }
        
        # Count styles, emotions, durations
        for sample in dataset:
            style = sample.get('style', 'unknown')
            emotion = sample.get('emotion', 'unknown')
            duration = sample.get('duration', 'unknown')
            
            summary['styles'][style] = summary['styles'].get(style, 0) + 1
            summary['emotions'][emotion] = summary['emotions'].get(emotion, 0) + 1
            summary['durations'][duration] = summary['durations'].get(duration, 0) + 1
        
        # Calculate feature statistics
        tempos = [sample['audio_features'].get('tempo', 0) for sample in dataset]
        harmonic_ratios = [sample['audio_features'].get('harmonic_ratio', 0) for sample in dataset]
        
        summary['feature_statistics'] = {
            'tempo': {
                'mean': np.mean(tempos),
                'std': np.std(tempos),
                'min': np.min(tempos),
                'max': np.max(tempos)
            },
            'harmonic_ratio': {
                'mean': np.mean(harmonic_ratios),
                'std': np.std(harmonic_ratios),
                'min': np.min(harmonic_ratios),
                'max': np.max(harmonic_ratios)
            }
        }
        
        # Save summary
        with open(self.output_dir / "dataset_summary.json", 'w') as f:
            json.dump(summary, f, indent=2)
        
        # Print summary
        print("\n📊 Dataset Summary:")
        print(f"Total samples: {summary['total_samples']}")
        print(f"\nStyles distribution:")
        for style, count in summary['styles'].items():
            print(f"  {style}: {count} samples")
        print(f"\nEmotions distribution:")
        for emotion, count in summary['emotions'].items():
            print(f"  {emotion}: {count} samples")
        print(f"\nFeature statistics:")
        print(f"  Tempo: {summary['feature_statistics']['tempo']['mean']:.1f} ± {summary['feature_statistics']['tempo']['std']:.1f} BPM")
        print(f"  Harmonic ratio: {summary['feature_statistics']['harmonic_ratio']['mean']:.3f} ± {summary['feature_statistics']['harmonic_ratio']['std']:.3f}")
        
        return summary


def main():
    """
    Main function to run the complete preprocessing pipeline
    """
    print("🎵 Starting Audio Preprocessing Pipeline for MusicGen Fine-tuning")
    print("=" * 70)
    
    # Initialize pipeline
    pipeline = AudioPreprocessingPipeline(
        audio_dir="healing_music_dataset/audio",
        metadata_file="healing_music_dataset/metadata.json",
        output_dir="processed_dataset",
        target_sample_rate=32000,
        max_audio_length=30,
        model_name="facebook/musicgen-small"
    )
    
    try:
        # Process dataset
        dataset = pipeline.process_dataset()
        
        # Create train/validation split
        dataset_dict = pipeline.create_train_val_split(dataset, val_split=0.2)
        
        # Generate visualizations
        pipeline.visualize_features(dataset, num_samples=5)
        
        # Generate summary
        summary = pipeline.generate_dataset_summary(dataset)
        
        print("\n🎉 Preprocessing pipeline completed successfully!")
        print(f"📁 Processed dataset saved to: {pipeline.output_dir}")
        print(f"📊 Dataset summary saved to: {pipeline.output_dir}/dataset_summary.json")
        print(f"📈 Visualizations saved to: {pipeline.output_dir}/visualizations/")
        
        print("\n🚀 Next steps:")
        print("1. Review the dataset summary and visualizations")
        print("2. Use the processed dataset for MusicGen fine-tuning")
        print("3. The dataset is ready for training in Google Colab or local environment")
        
    except Exception as e:
        print(f"❌ Error in preprocessing pipeline: {e}")
        raise


if __name__ == "__main__":
    main() 
# 🎵 Audio Preprocessing Pipeline for MusicGen Fine-tuning

## 📋 Overview

This guide provides a complete pipeline to convert raw audio data into preprocessing data suitable for fine-tuning the MusicGen model. The pipeline includes feature extraction, data preparation, and dataset creation.

## 🎯 What This Pipeline Does

### **Input: Raw Audio Data**
- Audio files (WAV, MP3, etc.)
- Metadata with text descriptions
- Various audio qualities and formats

### **Output: Preprocessed Dataset**
- MusicGen-compatible features
- Whisper-compatible features
- Audio feature analysis
- Train/validation splits
- Quality visualizations

## 🚀 Complete Implementation Pipeline

### **Step 1: Setup Environment**

```bash
# Install required packages
pip install transformers datasets accelerate wandb torch torchaudio
pip install librosa numpy pandas matplotlib tqdm
pip install git+https://github.com/facebookresearch/audiocraft.git
```

### **Step 2: Prepare Your Dataset Structure**

Create this directory structure:
```
healing_music_dataset/
├── audio/
│   ├── ambient_001.wav
│   ├── tibetan_001.wav
│   ├── binaural_001.wav
│   └── ...
└── metadata.json
```

### **Step 3: Create Metadata File**

```json
[
  {
    "text": "Gentle rain sounds with soft piano melodies for deep relaxation and stress relief",
    "audio_file": "ambient_001.wav",
    "style": "ambient",
    "duration": "3-5",
    "emotion": "relaxation",
    "instruments": ["piano", "rain sounds"],
    "therapeutic_benefit": "stress relief, deep relaxation"
  },
  {
    "text": "Tibetan singing bowls with nature sounds for spiritual meditation",
    "audio_file": "tibetan_001.wav",
    "style": "tibetan",
    "duration": "5-10",
    "emotion": "meditation",
    "instruments": ["singing bowls", "nature sounds"],
    "therapeutic_benefit": "spiritual meditation, chakra healing"
  }
]
```

### **Step 4: Run the Preprocessing Pipeline**

```python
# Run the complete pipeline
python audio_preprocessing_pipeline.py
```

## 🔧 Pipeline Components Explained

### **1. Audio Loading & Preprocessing**
```python
def load_audio_file(self, file_path: str) -> Tuple[np.ndarray, int]:
    # Load audio with librosa (handles various formats)
    audio_array, sample_rate = librosa.load(
        file_path, 
        sr=self.target_sample_rate,  # 32000 Hz for MusicGen
        mono=True
    )
    
    # Normalize audio
    audio_array = librosa.util.normalize(audio_array)
    
    # Trim silence
    audio_array, _ = librosa.effects.trim(audio_array, top_db=20)
    
    return audio_array, sample_rate
```

**What it does:**
- Converts any audio format to WAV
- Resamples to 32kHz (MusicGen requirement)
- Normalizes audio levels
- Removes leading/trailing silence

### **2. Feature Extraction**
```python
def extract_audio_features(self, audio_array: np.ndarray, sample_rate: int):
    features = {}
    
    # Spectral features
    stft = librosa.stft(audio_array)
    features['spectral_centroid'] = np.mean(librosa.feature.spectral_centroid(S=stft))
    features['spectral_bandwidth'] = np.mean(librosa.feature.spectral_bandwidth(S=stft))
    
    # MFCC features (13 coefficients)
    mfccs = librosa.feature.mfcc(y=audio_array, sr=sample_rate, n_mfcc=13)
    features['mfcc_mean'] = np.mean(mfccs, axis=1).tolist()
    features['mfcc_std'] = np.std(mfccs, axis=1).tolist()
    
    # Tempo detection
    tempo, _ = librosa.beat.beat_track(y=audio_array, sr=sample_rate)
    features['tempo'] = tempo
    
    # Harmonic analysis
    harmonic, percussive = librosa.effects.hpss(audio_array)
    features['harmonic_ratio'] = np.mean(np.abs(harmonic)) / (np.mean(np.abs(harmonic)) + np.mean(np.abs(percussive)))
    
    return features
```

**What it extracts:**
- **Spectral features**: Frequency characteristics
- **MFCC**: Mel-frequency cepstral coefficients (audio fingerprint)
- **Tempo**: Beat tracking and rhythm analysis
- **Harmonic ratio**: Harmonic vs percussive content
- **Zero crossing rate**: Frequency content indicator
- **RMS energy**: Overall loudness

### **3. MusicGen Feature Preparation**
```python
def prepare_musicgen_features(self, audio_array: np.ndarray, text: str):
    # Process with MusicGen processor
    inputs = self.musicgen_processor(
        text=[text],
        audio=audio_array,
        sampling_rate=self.target_sample_rate,
        return_tensors="pt"
    )
    
    return {
        'input_ids': inputs['input_ids'].numpy().tolist(),
        'attention_mask': inputs['attention_mask'].numpy().tolist(),
        'labels': inputs['labels'].numpy().tolist() if 'labels' in inputs else None
    }
```

**What it creates:**
- **input_ids**: Tokenized text prompts
- **attention_mask**: Attention patterns for text
- **labels**: Target audio representations

### **4. Whisper Feature Preparation**
```python
def prepare_whisper_features(self, audio_array: np.ndarray):
    # Process with Whisper feature extractor
    features = self.whisper_feature_extractor(
        audio_array, 
        sampling_rate=self.target_sample_rate, 
        padding=True
    )
    
    return {
        'input_features': features['input_features']
    }
```

**What it creates:**
- **Log-mel spectrograms**: Audio representation for speech/music analysis
- **Padded sequences**: Uniform length for batch processing

## 📊 Output Structure

After running the pipeline, you'll get:

```
processed_dataset/
├── processed_dataset/          # HuggingFace Dataset
│   ├── dataset_info.json
│   ├── state.json
│   └── data/
├── train_val_split/           # Train/validation splits
│   ├── train/
│   └── validation/
├── visualizations/            # Quality control plots
│   ├── sample_1_features.png
│   ├── sample_2_features.png
│   └── ...
├── dataset_summary.json       # Dataset statistics
└── processing_metadata.json   # Processing info
```

## 🎯 Dataset Features

Each processed sample contains:

```python
{
    'audio_file': 'ambient_001.wav',
    'text': 'Gentle rain sounds with soft piano...',
    'style': 'ambient',
    'emotion': 'relaxation',
    'instruments': ['piano', 'rain sounds'],
    'therapeutic_benefit': 'stress relief, deep relaxation',
    
    # Audio features
    'audio_features': {
        'duration': 180.5,
        'tempo': 85.2,
        'harmonic_ratio': 0.73,
        'spectral_centroid': 1200.5,
        'mfcc_mean': [0.1, 0.2, ...],  # 13 values
        'mfcc_std': [0.05, 0.1, ...],  # 13 values
        'zero_crossing_rate': 0.12,
        'rms_energy': 0.45
    },
    
    # MusicGen features
    'musicgen_features': {
        'input_ids': [[1, 234, 567, ...]],  # Tokenized text
        'attention_mask': [[1, 1, 1, ...]], # Attention pattern
        'labels': [[0.1, 0.2, ...]]         # Audio targets
    },
    
    # Whisper features
    'whisper_features': {
        'input_features': [[[0.1, 0.2, ...]]]  # Log-mel spectrograms
    },
    
    # Processed audio
    'processed_audio': [0.1, 0.2, ...],  # Normalized audio array
    'sample_rate': 32000
}
```

## 🔍 Quality Control

### **Visualizations Generated:**
1. **Waveform**: Raw audio visualization
2. **Spectrogram**: Frequency content over time
3. **MFCC Features**: Audio fingerprint analysis
4. **Feature Summary**: Statistical overview

### **Dataset Summary:**
- Total samples processed
- Style distribution
- Emotion distribution
- Feature statistics (tempo, harmonic ratio, etc.)
- Processing metadata

## 🚀 Integration with Fine-tuning

### **Load Processed Dataset:**
```python
from datasets import load_from_disk

# Load the processed dataset
dataset = load_from_disk("processed_dataset/processed_dataset")

# Load train/validation splits
dataset_dict = load_from_disk("processed_dataset/train_val_split")

train_dataset = dataset_dict['train']
val_dataset = dataset_dict['validation']
```

### **Use in Training:**
```python
from transformers import Trainer, TrainingArguments

# Training arguments
training_args = TrainingArguments(
    output_dir="./healing-music-model",
    num_train_epochs=3,
    per_device_train_batch_size=1,
    learning_rate=5e-5,
    # ... other args
)

# Create trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
)

# Start training
trainer.train()
```

## 🎯 Key Benefits

### **1. Comprehensive Feature Extraction**
- MusicGen-specific features
- Whisper-compatible features
- Audio analysis features
- Quality control metrics

### **2. Standardized Processing**
- Consistent sample rate (32kHz)
- Normalized audio levels
- Uniform feature formats
- Quality filtering

### **3. Quality Control**
- Visualizations for inspection
- Dataset statistics
- Error handling and logging
- Processing metadata

### **4. Ready for Training**
- HuggingFace Dataset format
- Train/validation splits
- Compatible with MusicGen fine-tuning
- Optimized for GPU training

## 🔧 Customization Options

### **Adjust Audio Parameters:**
```python
pipeline = AudioPreprocessingPipeline(
    target_sample_rate=32000,    # MusicGen requirement
    max_audio_length=30,         # Maximum seconds per sample
    model_name="facebook/musicgen-small"  # Model variant
)
```

### **Modify Feature Extraction:**
```python
# Add custom features
def extract_custom_features(self, audio_array, sample_rate):
    features = {}
    
    # Your custom feature extraction
    features['custom_feature'] = your_calculation(audio_array)
    
    return features
```

### **Change Validation Split:**
```python
# Different train/validation ratio
dataset_dict = pipeline.create_train_val_split(dataset, val_split=0.15)
```

## 🎉 Next Steps

1. **Run the pipeline** on your healing music dataset
2. **Review visualizations** for quality control
3. **Check dataset summary** for distribution analysis
4. **Use processed dataset** for MusicGen fine-tuning
5. **Iterate and improve** based on results

This pipeline transforms your raw audio data into a professional-grade dataset ready for MusicGen fine-tuning! 🎵 
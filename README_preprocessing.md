# 🎵 Audio Preprocessing Pipeline for MusicGen Fine-tuning

## 📋 Overview

This repository contains a complete pipeline to convert raw audio data into preprocessing data suitable for fine-tuning the MusicGen model. The pipeline transforms your healing music samples into a professional-grade dataset ready for AI music generation training.

## 🎯 What This Pipeline Does

### **Input: Raw Audio Data**
- Audio files (WAV, MP3, etc.)
- Metadata with detailed text descriptions
- Various audio qualities and formats

### **Output: Preprocessed Dataset**
- MusicGen-compatible features
- Whisper-compatible features
- Comprehensive audio analysis
- Train/validation splits
- Quality control visualizations

## 🚀 Quick Start

### **1. Install Dependencies**
```bash
pip install -r requirements_preprocessing.txt
```

### **2. Create Example Dataset (Optional)**
```bash
python quick_start.py --create-example
```

### **3. Run Preprocessing Pipeline**
```bash
python quick_start.py
```

### **4. Use Your Own Data**
```bash
python quick_start.py --audio-dir "your_audio_folder" --metadata-file "your_metadata.json"
```

## 📁 File Structure

```
mindful-sound-scapes/
├── audio_preprocessing_pipeline.py    # Main preprocessing pipeline
├── example_usage.py                   # Example usage and demo
├── quick_start.py                     # Quick start script
├── requirements_preprocessing.txt     # Python dependencies
├── preprocessing_pipeline_guide.md    # Detailed guide
├── README_preprocessing.md            # This file
└── healing_music_dataset/             # Your dataset (created by example)
    ├── audio/
    │   ├── ambient_001.wav
    │   ├── tibetan_001.wav
    │   └── ...
    └── metadata.json
```

## 🔧 Pipeline Components

### **1. Audio Loading & Preprocessing**
- **Format Conversion**: Handles WAV, MP3, FLAC, etc.
- **Resampling**: Converts to 32kHz (MusicGen requirement)
- **Normalization**: Standardizes audio levels
- **Silence Trimming**: Removes leading/trailing silence

### **2. Feature Extraction**
- **Spectral Features**: Frequency characteristics
- **MFCC**: Mel-frequency cepstral coefficients (audio fingerprint)
- **Tempo Detection**: Beat tracking and rhythm analysis
- **Harmonic Analysis**: Harmonic vs percussive content
- **Energy Analysis**: RMS energy and zero crossing rate

### **3. MusicGen Feature Preparation**
- **Text Tokenization**: Converts prompts to model tokens
- **Attention Masks**: Attention patterns for text
- **Audio Labels**: Target audio representations

### **4. Whisper Feature Preparation**
- **Log-mel Spectrograms**: Audio representation for analysis
- **Padded Sequences**: Uniform length for batch processing

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

## 📋 Metadata Format

Create a `metadata.json` file with this structure:

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

## 🎯 Command Line Options

### **Basic Usage:**
```bash
# Run with default settings
python quick_start.py

# Create example dataset first
python quick_start.py --create-example
python quick_start.py
```

### **Custom Settings:**
```bash
# Use your own data
python quick_start.py \
  --audio-dir "my_audio_folder" \
  --metadata-file "my_metadata.json" \
  --output-dir "my_processed_data"

# Adjust processing parameters
python quick_start.py \
  --sample-rate 32000 \
  --max-length 60 \
  --model "facebook/musicgen-medium"

# Skip optional features
python quick_start.py \
  --no-visualizations \
  --no-splits
```

## 🔧 Customization

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

## 🎉 Key Benefits

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

## 🚨 Troubleshooting

### **Common Issues:**

1. **Missing Dependencies:**
   ```bash
   pip install -r requirements_preprocessing.txt
   ```

2. **Audio File Not Found:**
   - Check file paths in metadata.json
   - Ensure audio files exist in the specified directory

3. **Memory Issues:**
   - Reduce `max_audio_length` parameter
   - Process smaller batches

4. **Model Loading Errors:**
   - Check internet connection for model downloads
   - Verify model name is correct

### **Error Messages:**
- `❌ Audio file not found`: Check file paths
- `❌ Invalid JSON`: Fix metadata.json format
- `❌ Missing required packages`: Install dependencies

## 📚 Additional Resources

- [MusicGen Documentation](https://huggingface.co/docs/transformers/model_doc/musicgen)
- [HuggingFace Datasets](https://huggingface.co/docs/datasets/)
- [Librosa Audio Processing](https://librosa.org/)
- [Fine-tuning Guide](./fine_tuning_guide.md)

## 🤝 Contributing

Feel free to contribute improvements to the preprocessing pipeline:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the Mindful Sound Scapes application. See the main repository for license information.

---

**🎵 Transform your raw audio into professional-grade training data for MusicGen fine-tuning!** 
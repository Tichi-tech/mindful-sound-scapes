# 🎵 MusicGen Fine-tuning Guide (No Local GPU Required)

## 🚀 Setup: Google Colab Pro

### Step 1: Get Google Colab Pro
1. Go to [colab.research.google.com](https://colab.research.google.com)
2. Sign up for Colab Pro ($10/month) - includes GPU access
3. Create a new notebook

### Step 2: Install Dependencies
```python
# Run this in a Colab cell
!pip install transformers datasets accelerate wandb torch torchaudio
!pip install git+https://github.com/facebookresearch/audiocraft.git
```

### Step 3: Check GPU Availability
```python
import torch
print(f"GPU available: {torch.cuda.is_available()}")
print(f"GPU device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None'}")
```

## 📊 Prepare Your Dataset

### Step 1: Create Training Data Structure
```python
import json
from datasets import Dataset

# Your healing music dataset
training_data = [
    {
        "text": "Gentle rain sounds with soft piano melodies for deep relaxation and stress relief",
        "audio_file": "path/to/audio1.wav",
        "style": "ambient",
        "duration": "3-5"
    },
    {
        "text": "Tibetan singing bowls with nature sounds for spiritual meditation",
        "audio_file": "path/to/audio2.wav", 
        "style": "tibetan",
        "duration": "5-10"
    },
    # Add more examples...
]

# Save to JSON
with open('healing_music_dataset.json', 'w') as f:
    json.dump(training_data, f, indent=2)
```

### Step 2: Upload Your Audio Files
```python
# Upload your audio files to Google Drive or Colab
from google.colab import files
uploaded = files.upload()  # Upload your .wav files

# Or mount Google Drive
from google.colab import drive
drive.mount('/content/drive')
```

## 🎯 Fine-tuning Code

### Step 1: Load Model and Processor
```python
from transformers import MusicgenForConditionalGeneration, MusicgenProcessor
import torch

# Load the base model
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")
processor = MusicgenProcessor.from_pretrained("facebook/musicgen-small")

# Move to GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
```

### Step 2: Prepare Dataset
```python
import torchaudio
import numpy as np
from datasets import Dataset

def load_audio(file_path, target_sample_rate=32000):
    """Load and resample audio file"""
    waveform, sample_rate = torchaudio.load(file_path)
    if sample_rate != target_sample_rate:
        resampler = torchaudio.transforms.Resample(sample_rate, target_sample_rate)
        waveform = resampler(waveform)
    return waveform.squeeze().numpy()

def prepare_dataset(json_file):
    """Prepare dataset for fine-tuning"""
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    processed_data = []
    for item in data:
        try:
            # Load audio
            audio = load_audio(item['audio_file'])
            
            # Process with MusicGen processor
            inputs = processor(
                text=[item['text']],
                audio=audio,
                sampling_rate=32000,
                return_tensors="pt"
            )
            
            processed_data.append({
                'input_ids': inputs['input_ids'],
                'attention_mask': inputs['attention_mask'],
                'labels': inputs['labels']
            })
        except Exception as e:
            print(f"Error processing {item['audio_file']}: {e}")
    
    return processed_data

# Prepare your dataset
dataset = prepare_dataset('healing_music_dataset.json')
```

### Step 3: Training Configuration
```python
from transformers import TrainingArguments, Trainer
import wandb

# Initialize wandb for experiment tracking
wandb.init(project="healing-music-gen", name="musicgen-finetune")

# Training arguments
training_args = TrainingArguments(
    output_dir="./healing-music-model",
    num_train_epochs=3,
    per_device_train_batch_size=1,  # Small batch size for GPU memory
    gradient_accumulation_steps=4,
    learning_rate=5e-5,
    warmup_steps=100,
    logging_steps=10,
    save_steps=500,
    eval_steps=500,
    evaluation_strategy="steps",
    save_strategy="steps",
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    greater_is_better=False,
    report_to="wandb",
    dataloader_pin_memory=False,
    remove_unused_columns=False,
)

# Create trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    eval_dataset=dataset[:10],  # Use subset for evaluation
)

# Start training
trainer.train()
```

### Step 4: Save and Test Your Model
```python
# Save the fine-tuned model
trainer.save_model("./healing-music-model-final")

# Test generation
def generate_healing_music(prompt, duration_seconds=30):
    inputs = processor(
        text=[prompt],
        return_tensors="pt"
    ).to(device)
    
    with torch.no_grad():
        generated_audio = model.generate(
            **inputs,
            max_new_tokens=duration_seconds * 50,  # Approximate tokens
            do_sample=True,
            temperature=0.8,
            top_p=0.9
        )
    
    return generated_audio

# Test your model
test_prompt = "Gentle rain sounds with soft piano melodies for deep relaxation"
generated_audio = generate_healing_music(test_prompt)

# Save the generated audio
import torchaudio
torchaudio.save("generated_healing_music.wav", generated_audio.squeeze(), 32000)
```

## 💰 Cost Breakdown

### Google Colab Pro: $10/month
- **GPU Hours**: ~100 hours/month
- **Fine-tuning Time**: 2-6 hours for small dataset
- **Total Cost**: $10-20 for complete fine-tuning

### Alternative: Paperspace Gradient
- **RTX 4000**: $0.59/hour
- **V100**: $2.99/hour
- **Fine-tuning Time**: 2-6 hours
- **Total Cost**: $1.18-17.94

## 🚀 Deploy to Your App

### Step 1: Upload Model to Hugging Face
```python
# Push your model to Hugging Face Hub
model.push_to_hub("your-username/healing-music-gen")
processor.push_to_hub("your-username/healing-music-gen")
```

### Step 2: Update Your Supabase Function
```typescript
// In your generate-music function
const response = await fetch(
  "https://api-inference.huggingface.co/models/your-username/healing-music-gen",
  {
    headers: {
      Authorization: `Bearer ${huggingFaceToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      inputs: enhancedPrompt,
      parameters: {
        max_new_tokens: Math.floor(durationSeconds * 50),
        temperature: 0.8,
        top_p: 0.9,
        do_sample: true
      }
    }),
  }
);
```

## 📋 Checklist for Fine-tuning

- [ ] Get Google Colab Pro account
- [ ] Prepare 50-200 high-quality healing music samples
- [ ] Create detailed prompts for each sample
- [ ] Upload audio files to Colab
- [ ] Run fine-tuning script
- [ ] Test generated samples
- [ ] Upload model to Hugging Face
- [ ] Update your app to use fine-tuned model

## 🎯 Tips for Success

1. **Start Small**: Begin with 50-100 samples
2. **Quality Over Quantity**: Use high-quality audio files
3. **Detailed Prompts**: Be specific about instruments, mood, tempo
4. **Monitor Training**: Use wandb to track progress
5. **Test Regularly**: Generate samples during training
6. **Iterate**: Improve dataset based on results

This approach gives you professional-grade fine-tuning without any local GPU requirements! 
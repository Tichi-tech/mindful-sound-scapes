# 📊 Dataset Preparation Guide

## 🎵 What You Need to Collect

### **Target: 50-200 High-Quality Healing Music Samples**

### **Step 1: Source Your Audio Files**

**Option A: Create Your Own (Recommended)**
- Record your own healing music sessions
- Use high-quality microphones
- Focus on specific healing styles (ambient, Tibetan bowls, etc.)

**Option B: Licensed Music**
- Purchase royalty-free healing music
- Use Creative Commons licensed music
- Ensure you have rights to use for training

**Option C: Public Domain**
- Find public domain healing music
- Historical recordings
- Traditional meditation music

### **Step 2: Audio Requirements**

```
Format: WAV (uncompressed)
Sample Rate: 44.1kHz or 48kHz
Bit Depth: 16-bit or 24-bit
Duration: 30 seconds to 5 minutes
Quality: High-quality, clear audio
```

### **Step 3: Create Detailed Prompts**

For each audio file, create a detailed prompt that describes:

1. **Instruments/Sounds**: "gentle piano", "Tibetan singing bowls", "rain sounds"
2. **Emotional Intent**: "for deep relaxation", "stress relief", "meditation"
3. **Tempo/Dynamics**: "slow and flowing", "gentle", "building gradually"
4. **Environmental Elements**: "with nature sounds", "distant bird calls"
5. **Therapeutic Purpose**: "healing frequencies", "chakra balancing"

### **Example Prompts:**

```
Audio: gentle_piano_meditation.wav
Prompt: "Soft, flowing piano melodies with gentle arpeggios for deep meditation and stress relief. The music gradually builds in warmth and then gently fades, creating a sense of inner peace and tranquility."

Audio: tibetan_bowls_nature.wav  
Prompt: "Resonant Tibetan singing bowls with deep, spiritual frequencies layered with subtle nature sounds including distant bird calls and gentle wind. Perfect for spiritual meditation and chakra healing."

Audio: binaural_focus.wav
Prompt: "Steady binaural beats at 40Hz for concentration and focus, accompanied by soft synthesizer pads and gentle ambient textures. The rhythm is consistent but not repetitive, maintaining attention without distraction."
```

## 📋 Dataset Structure

Create a JSON file with this structure:

```json
[
  {
    "text": "Detailed prompt describing the audio",
    "audio_file": "path/to/audio.wav",
    "style": "ambient|tibetan|binaural|piano|crystal|meditation|chakra|nature",
    "duration": "30s|1-2|2-3|3-5|5-10|10-15",
    "emotion": "relaxation|focus|healing|meditation|sleep|stress_relief",
    "instruments": ["piano", "singing bowls", "nature sounds"],
    "therapeutic_benefit": "stress relief, deep relaxation"
  }
]
```

## 🎯 Recommended Dataset Size

### **Minimum Viable Dataset: 50 samples**
- 10 ambient healing
- 10 Tibetan bowls
- 10 binaural beats
- 10 piano meditation
- 10 nature sounds

### **Good Dataset: 100 samples**
- 20 ambient healing
- 20 Tibetan bowls
- 15 binaural beats
- 15 piano meditation
- 15 nature sounds
- 15 crystal bowls

### **Excellent Dataset: 200+ samples**
- 40 ambient healing
- 40 Tibetan bowls
- 30 binaural beats
- 30 piano meditation
- 30 nature sounds
- 30 crystal bowls

## 📁 File Organization

```
healing_music_dataset/
├── audio/
│   ├── ambient_001.wav
│   ├── tibetan_001.wav
│   ├── binaural_001.wav
│   └── ...
├── metadata.json
└── prompts.txt
```

## 🔍 Quality Checklist

Before using each audio file:

- [ ] High audio quality (no background noise)
- [ ] Clear, detailed prompt
- [ ] Appropriate duration (30s-5min)
- [ ] Therapeutic/healing purpose
- [ ] Consistent style labeling
- [ ] Rights to use for training

## 🚀 Next Steps

1. **Start with 10-20 samples** for initial testing
2. **Test fine-tuning** with small dataset
3. **Evaluate results** and iterate
4. **Expand dataset** based on what works
5. **Refine prompts** based on generated quality

## 💡 Tips for Success

1. **Be Specific**: Detailed prompts produce better results
2. **Consistent Style**: Group similar sounds together
3. **Quality Over Quantity**: Better to have 50 high-quality samples than 200 poor ones
4. **Diverse Emotions**: Include different therapeutic purposes
5. **Test Prompts**: Try generating with your prompts before training

Start with a small dataset (10-20 samples) to test the process, then expand based on results! 
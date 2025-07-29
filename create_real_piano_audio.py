#!/usr/bin/env python3
"""
Generate real ambient piano audio files to replace HTML placeholders
"""

import numpy as np
import scipy.io.wavfile as wav
import os

def generate_piano_note(frequency, duration, sample_rate=44100):
    """Generate a realistic piano note with harmonics and decay"""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # Piano harmonics with inharmonic stretching (like real piano strings)
    harmonics = [1.0, 2.01, 3.05, 4.12, 5.23, 6.37]
    amplitudes = [1.0, 0.7, 0.5, 0.3, 0.2, 0.1]
    
    note = np.zeros_like(t)
    
    for harmonic, amplitude in zip(harmonics, amplitudes):
        harmonic_freq = frequency * harmonic
        # Piano attack and decay envelope
        envelope = amplitude * np.exp(-t * (1 + harmonic * 0.3))
        # Add slight inharmonicity to make it sound like real piano strings
        wave = np.sin(2 * np.pi * harmonic_freq * t + 0.1 * np.sin(2 * np.pi * harmonic_freq * 0.01 * t))
        note += wave * envelope
    
    # Piano body resonance
    body_resonance = 0.15 * np.sin(2 * np.pi * 100 * t) * np.exp(-t * 0.5)
    note += body_resonance
    
    # Apply overall envelope for natural attack/decay
    attack_time = 0.05  # 50ms attack
    decay_start = 0.2   # Start decay after 200ms
    
    envelope = np.ones_like(t)
    attack_samples = int(attack_time * sample_rate)
    decay_start_samples = int(decay_start * sample_rate)
    
    # Attack phase
    envelope[:attack_samples] = np.linspace(0, 1, attack_samples)
    
    # Decay phase
    if decay_start_samples < len(envelope):
        decay_samples = len(envelope) - decay_start_samples
        envelope[decay_start_samples:] = np.exp(-3 * np.linspace(0, 1, decay_samples))
    
    note *= envelope
    
    return note

def generate_ambient_piano_sequence(duration=30, sample_rate=44100):
    """Generate a peaceful ambient piano sequence"""
    
    # C major pentatonic scale for peaceful sound (C, D, E, G, A)
    notes = [261.63, 293.66, 329.63, 392.00, 440.00]  # C4, D4, E4, G4, A4
    
    total_samples = int(sample_rate * duration)
    audio = np.zeros(total_samples)
    
    # Generate overlapping notes for ambient effect
    note_duration = 4.0  # Each note lasts 4 seconds
    note_interval = 2.0  # New note every 2 seconds
    
    current_time = 0
    note_index = 0
    
    while current_time < duration - note_duration:
        # Choose note from pentatonic scale
        frequency = notes[note_index % len(notes)]
        
        # Generate the note
        note = generate_piano_note(frequency, note_duration, sample_rate)
        
        # Calculate sample positions
        start_sample = int(current_time * sample_rate)
        end_sample = min(start_sample + len(note), total_samples)
        note_samples = end_sample - start_sample
        
        # Add note to the audio (with some randomness in timing)
        if note_samples > 0:
            audio[start_sample:end_sample] += note[:note_samples] * 0.3
        
        # Move to next note
        current_time += note_interval + np.random.uniform(-0.5, 0.5)  # Add slight timing variation
        note_index += 1
        
        # Sometimes play octave lower for depth
        if np.random.random() < 0.3:
            lower_freq = frequency / 2
            lower_note = generate_piano_note(lower_freq, note_duration * 1.5, sample_rate)
            if start_sample + len(lower_note) <= total_samples:
                audio[start_sample:start_sample + len(lower_note)] += lower_note * 0.2
    
    # Apply gentle fade in/out
    fade_samples = int(0.5 * sample_rate)  # 0.5 second fade
    audio[:fade_samples] *= np.linspace(0, 1, fade_samples)
    audio[-fade_samples:] *= np.linspace(1, 0, fade_samples)
    
    # Normalize to prevent clipping
    audio = audio / np.max(np.abs(audio)) * 0.8
    
    return audio

def create_piano_files():
    """Create real piano audio files"""
    
    print("🎹 Generating ambient piano audio...")
    
    # Generate 30-second ambient piano sequence
    piano_audio = generate_ambient_piano_sequence(duration=30)
    
    # Convert to 16-bit integer
    piano_audio_int = (piano_audio * 32767).astype(np.int16)
    
    # Save as WAV file
    audio_dir = "/Users/mima0000/mindful-sound-scapes/public/audio"
    wav_path = os.path.join(audio_dir, "ambient-piano.wav")
    
    print(f"Saving to: {wav_path}")
    wav.write(wav_path, 44100, piano_audio_int)
    
    # Also create a shorter version for testing
    short_piano = piano_audio[:44100 * 10]  # 10 seconds
    short_piano_int = (short_piano * 32767).astype(np.int16)
    short_wav_path = os.path.join(audio_dir, "ambient-piano-short.wav")
    wav.write(short_wav_path, 44100, short_piano_int)
    
    print(f"✅ Created ambient piano audio files:")
    print(f"   - {wav_path} (30 seconds)")
    print(f"   - {short_wav_path} (10 seconds)")
    
    # File sizes
    print(f"\nFile sizes:")
    print(f"   - ambient-piano.wav: {os.path.getsize(wav_path):,} bytes")
    print(f"   - ambient-piano-short.wav: {os.path.getsize(short_wav_path):,} bytes")

if __name__ == "__main__":
    create_piano_files()
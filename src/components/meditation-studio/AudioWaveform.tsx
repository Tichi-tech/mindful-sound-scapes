import React from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
  isPlaying: boolean;
  hasAudio: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isPlaying, hasAudio }) => {
  // Generate random heights for waveform bars
  const bars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    height: Math.random() * 0.8 + 0.2 // Random height between 0.2 and 1
  }));

  return (
    <div className="flex items-center justify-center h-8 gap-0.5">
      {bars.map((bar) => (
        <motion.div
          key={bar.id}
          className={`
            w-0.5 bg-white/80 rounded-full
            ${hasAudio ? 'opacity-100' : 'opacity-50'}
          `}
          style={{
            height: `${bar.height * 100}%`,
          }}
          animate={{
            scaleY: isPlaying && hasAudio ? [1, 0.3, 1.2, 0.8, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isPlaying && hasAudio ? Infinity : 0,
            delay: bar.id * 0.02, // Stagger the animation
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
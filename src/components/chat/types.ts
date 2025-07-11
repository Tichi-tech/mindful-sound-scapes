export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ChatInterfaceProps {
  onSoundRecommendation: (soundId: string) => void;
}
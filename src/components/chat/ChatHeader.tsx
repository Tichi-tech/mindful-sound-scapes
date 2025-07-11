import React from 'react';
import { Bot } from 'lucide-react';

export const ChatHeader: React.FC = () => {
  return (
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Tichi - AI Meditation Assistant</h2>
        <p className="text-sm text-gray-600">Tell me what you need, and I'll create the perfect soundscape</p>
      </div>
    </div>
  );
};
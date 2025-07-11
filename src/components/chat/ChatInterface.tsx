import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ChatInterfaceProps } from './types';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { LoadingIndicator } from './LoadingIndicator';
import { ChatInput } from './ChatInput';
import { useChatLogic } from './useChatLogic';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSoundRecommendation }) => {
  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSend,
    handleKeyPress
  } = useChatLogic({ onSoundRecommendation });

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
        <div className="p-6">
          <ChatHeader />

          <div className="h-96 overflow-y-auto mb-6 space-y-4 pr-2">
            <AnimatePresence>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </AnimatePresence>
            
            {isLoading && <LoadingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>
      </Card>
    </div>
  );
};
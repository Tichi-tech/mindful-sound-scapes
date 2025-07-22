import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader2 } from 'lucide-react';

export const LoadingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-meditation)' }}>
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-2xl">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            <span className="text-sm text-gray-600">Indara is thinking...</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
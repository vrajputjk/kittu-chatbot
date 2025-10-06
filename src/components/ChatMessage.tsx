import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex gap-3 p-4 ${isAssistant ? 'bg-card/50' : 'bg-transparent'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isAssistant ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
      }`}>
        {isAssistant ? <Bot size={18} /> : <User size={18} />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          {isAssistant ? 'Kittu' : 'You'}
        </div>
        <div className="text-foreground leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

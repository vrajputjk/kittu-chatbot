import { AssistantAvatar } from './AssistantAvatar';
import { User } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const ChatMessage = ({ role, content, timestamp }: ChatMessageProps) => {
  const isUser = role === 'user';
  const formattedTime = timestamp ? format(new Date(timestamp), 'HH:mm') : '';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <AssistantAvatar size="sm" />
        </div>
      )}
      
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div
          className={`rounded-3xl px-6 py-4 shadow-lg transition-all duration-300 ${
            isUser
              ? 'bg-gradient-to-br from-google-blue to-google-blue/90 text-white ml-auto hover:shadow-xl hover:scale-[1.02]'
              : 'bg-white/95 backdrop-blur-sm border border-border/50 hover:shadow-xl hover:border-google-blue/30'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>
        {timestamp && (
          <span className={`text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity px-2 ${isUser ? 'text-right' : 'text-left'}`}>
            {formattedTime}
          </span>
        )}
      </div>
      
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-google-blue to-google-green flex items-center justify-center shadow-lg flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;

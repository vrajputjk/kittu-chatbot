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
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group mb-6`}>
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <AssistantAvatar size="sm" />
        </div>
      )}
      
      <div className="flex flex-col gap-1 max-w-[85%] md:max-w-[70%]">
        <div
          className={`rounded-2xl px-5 py-3 transition-all duration-200 ${
            isUser
              ? 'bg-[hsl(var(--chat-user-bg))] text-white shadow-md'
              : 'bg-[hsl(var(--chat-assistant-bg))] text-foreground border border-border shadow-sm'
          }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>
        {timestamp && (
          <span className={`text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity px-3 ${isUser ? 'text-right' : 'text-left'}`}>
            {formattedTime}
          </span>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-google-blue to-google-green flex items-center justify-center shadow-md flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;

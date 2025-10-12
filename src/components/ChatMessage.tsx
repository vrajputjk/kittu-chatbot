import { AssistantAvatar } from './AssistantAvatar';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isAssistant = role === 'assistant';

  const isUser = role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <AssistantAvatar size="sm" />
        </div>
      )}
      
      <div
        className={`max-w-[75%] rounded-3xl px-6 py-4 shadow-lg transition-all duration-300 ${
          isUser
            ? 'bg-gradient-to-br from-google-blue to-google-blue/90 text-white ml-auto hover:shadow-xl hover:scale-[1.02]'
            : 'bg-white/95 backdrop-blur-sm border border-border/50 hover:shadow-xl hover:border-google-blue/30'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;

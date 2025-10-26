import { AssistantAvatar } from './AssistantAvatar';

export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-4 animate-fade-in">
      <AssistantAvatar size="sm" isSpeaking={true} />
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-lg border border-border/50">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-google-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-google-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-google-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

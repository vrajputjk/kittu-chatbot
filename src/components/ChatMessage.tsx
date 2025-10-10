import { AssistantAvatar } from './AssistantAvatar';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex gap-4 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {isAssistant && (
        <div className="flex-shrink-0 pt-1">
          <AssistantAvatar size="sm" />
        </div>
      )}
      <div
        className={`flex-1 ${
          isAssistant ? 'bg-assistant-surface-variant' : 'bg-primary/10'
        } rounded-3xl px-5 py-4 max-w-[85%]`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;

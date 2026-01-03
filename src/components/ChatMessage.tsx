import { AssistantAvatar } from './AssistantAvatar';
import { User, Volume2, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  imageUrl?: string;
}

const ChatMessage = ({ role, content, timestamp, imageUrl }: ChatMessageProps) => {
  const isUser = role === 'user';
  const formattedTime = timestamp ? format(new Date(timestamp), 'HH:mm') : '';
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Message copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Parse content for special formatting
  const renderContent = () => {
    // Check for numbered lists
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Handle bold text with **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const formattedLine = line.replace(boldRegex, '<strong>$1</strong>');
      
      // Handle links
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      const lineWithLinks = formattedLine.replace(
        linkRegex,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
      );
      
      return (
        <span key={index}>
          <span dangerouslySetInnerHTML={{ __html: lineWithLinks }} />
          {index < lines.length - 1 && <br />}
        </span>
      );
    });
  };

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
          {imageUrl && (
            <div className="mb-3 rounded-xl overflow-hidden">
              <img src={imageUrl} alt="Generated" className="w-full h-auto" />
            </div>
          )}
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {renderContent()}
          </p>
        </div>
        
        {/* Actions and timestamp */}
        <div className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'justify-end' : 'justify-start'}`}>
          {!isUser && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeak}
                className="h-6 w-6 p-0"
              >
                <Volume2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 w-6 p-0"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </Button>
            </>
          )}
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {formattedTime}
            </span>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--google-blue))] to-[hsl(var(--google-green))] flex items-center justify-center shadow-md flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;

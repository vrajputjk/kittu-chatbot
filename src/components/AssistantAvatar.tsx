import { Mic } from 'lucide-react';

interface AssistantAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AssistantAvatar = ({ 
  isListening = false, 
  isSpeaking = false,
  size = 'lg' 
}: AssistantAvatarProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer pulsing rings when listening */}
      {isListening && (
        <>
          <div className={`absolute ${sizeClasses[size]} rounded-full bg-primary/20 animate-pulse-ring`} />
          <div 
            className={`absolute ${sizeClasses[size]} rounded-full bg-primary/20 animate-pulse-ring`}
            style={{ animationDelay: '0.5s' }}
          />
        </>
      )}
      
      {/* Main avatar circle with gradient */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 via-red-500 via-yellow-500 to-green-500 flex items-center justify-center shadow-large ${
          isSpeaking ? 'animate-pulse-ring' : ''
        } transition-transform`}
      >
        <div className="w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-full bg-background flex items-center justify-center">
          <Mic className={`${iconSizes[size]} text-primary`} />
        </div>
      </div>

      {/* Color dots animation when speaking */}
      {isSpeaking && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#4285F4', '#EA4335', '#FBBC04', '#34A853'][i],
                animation: 'wave 0.8s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

import { Sparkles } from 'lucide-react';

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
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-google-blue via-google-red to-google-yellow flex items-center justify-center shadow-xl relative overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-2xl`}
    >
      {isListening && (
        <>
          <div className="absolute inset-0 animate-pulse-ring rounded-full border-4 border-google-green"></div>
          <div className="absolute inset-0 animate-pulse rounded-full bg-google-green/30"></div>
        </>
      )}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 animate-ripple rounded-full bg-google-blue/30"></div>
          <div className="absolute inset-0 animate-pulse rounded-full bg-google-red/20"></div>
        </>
      )}
      <Sparkles className="text-white drop-shadow-lg" size={size === 'sm' ? 20 : size === 'md' ? 28 : 40} />
    </div>
  );
};

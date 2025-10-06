import React from 'react';

interface VoiceWaveProps {
  isActive: boolean;
}

const VoiceWave: React.FC<VoiceWaveProps> = ({ isActive }) => {
  const bars = Array.from({ length: 5 });

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-primary rounded-full transition-all duration-300 ${
            isActive ? 'animate-wave' : 'h-2'
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: isActive ? '100%' : '8px',
          }}
        />
      ))}
    </div>
  );
};

export default VoiceWave;

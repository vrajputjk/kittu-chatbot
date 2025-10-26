import { useState, useCallback } from 'react';

export const useElevenLabsVoice = (apiKey: string | undefined, voiceEnabled: boolean = true) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, voiceId: string = '9BWtsMINqrJLrRacOk9x') => {
    if (!voiceEnabled || !apiKey || !text) return;

    // Stop any current speech
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    try {
      setIsSpeaking(true);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('ElevenLabs API error');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      await audio.play();
    } catch (error) {
      console.error('ElevenLabs voice error:', error);
      setIsSpeaking(false);
    }
  }, [voiceEnabled, apiKey, currentAudio]);

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsSpeaking(false);
      setCurrentAudio(null);
    }
  }, [currentAudio]);

  return { speak, stop, isSpeaking };
};

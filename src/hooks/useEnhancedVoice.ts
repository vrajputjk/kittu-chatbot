import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VoiceSettings {
  enabled: boolean;
  speed: number;
  language: string;
  gender: 'female' | 'male';
  usePremiumVoice: boolean;
}

export const useEnhancedVoice = (settings: VoiceSettings) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPremiumAvailable, setIsPremiumAvailable] = useState<boolean | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakWithBrowser = useCallback((text: string, language: string) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.speed;
    utterance.pitch = settings.gender === 'female' ? 1.1 : 0.9;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = language.split('-')[0];

    // Find best matching voice
    let selectedVoice = voices.find(
      (voice) =>
        voice.lang.startsWith(langPrefix) &&
        (settings.gender === 'female'
          ? voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('heera') ||
            voice.name.toLowerCase().includes('nicky') ||
            voice.name.toLowerCase().includes('samantha')
          : voice.name.toLowerCase().includes('male') ||
            voice.name.toLowerCase().includes('man') ||
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('james'))
    );

    if (!selectedVoice) {
      selectedVoice = voices.find((voice) => voice.lang.startsWith(langPrefix));
    }

    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = language;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [settings.speed, settings.gender]);

  const speakWithPremium = useCallback(async (text: string, language: string) => {
    if (!text) return;

    try {
      setIsSpeaking(true);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          language,
          gender: settings.gender,
        },
      });

      if (error) throw error;

      if (!data.available) {
        setIsPremiumAvailable(false);
        speakWithBrowser(text, language);
        return;
      }

      setIsPremiumAvailable(true);

      // Play the audio
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        // Fallback to browser voice
        speakWithBrowser(text, language);
      };

      await audio.play();
    } catch (error) {
      console.error('Premium voice error:', error);
      setIsPremiumAvailable(false);
      speakWithBrowser(text, language);
    }
  }, [settings.gender, speakWithBrowser]);

  const speak = useCallback((text: string, language: string = 'en-US') => {
    if (!settings.enabled || !text) return;

    if (settings.usePremiumVoice && isPremiumAvailable !== false) {
      speakWithPremium(text, language);
    } else {
      speakWithBrowser(text, language);
    }
  }, [settings.enabled, settings.usePremiumVoice, isPremiumAvailable, speakWithPremium, speakWithBrowser]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isPremiumAvailable,
  };
};

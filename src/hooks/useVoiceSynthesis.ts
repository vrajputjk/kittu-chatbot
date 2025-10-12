import { useState, useEffect, useCallback } from 'react';

export const useVoiceSynthesis = (enabled: boolean = true, speed: number = 1.0) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string, language: string = 'en-US') => {
      if (!enabled || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1.1; // Slightly higher pitch for female voice
      utterance.volume = 1.0;

      // Advanced voice selection logic prioritizing female Hindi/English voices
      let selectedVoice: SpeechSynthesisVoice | undefined;
      const langPrefix = language.split('-')[0];

      // Priority 1: Female voice in the target language
      selectedVoice = voices.find(
        (voice) =>
          voice.lang.startsWith(langPrefix) &&
          (voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('heera') ||
            voice.name.toLowerCase().includes('nicky'))
      );

      // Priority 2: Any voice in the target language
      if (!selectedVoice) {
        selectedVoice = voices.find((voice) => voice.lang.startsWith(langPrefix));
      }

      // Priority 3: Any female voice
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (voice) =>
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('samantha')
        );
      }

      // Priority 4: Fallback to first available voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = language; // Explicitly set language
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [enabled, speed, voices]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
};

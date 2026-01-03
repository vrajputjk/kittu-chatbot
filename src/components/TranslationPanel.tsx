import { useState } from 'react';
import { X, Languages, ArrowRightLeft, Loader2, Copy, Check, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TranslationPanelProps {
  onClose: () => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'hinglish', name: 'Hinglish', flag: '🇮🇳🇺🇸' },
];

export const TranslationPanel = ({ onClose }: TranslationPanelProps) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: 'Please enter text',
        description: 'Enter the text you want to translate.',
        variant: 'destructive',
      });
      return;
    }

    setIsTranslating(true);
    setTranslatedText('');

    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { 
          text: sourceText.trim(),
          sourceLang,
          targetLang 
        },
      });

      if (error) throw error;

      if (data.translatedText) {
        setTranslatedText(data.translatedText);
      } else {
        throw new Error(data.error || 'Translation failed');
      }
    } catch (error: unknown) {
      console.error('Translation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      toast({
        title: 'Translation failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Translation copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string, lang: string) => {
    if (!text) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'hinglish' ? 'en-IN' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--google-green))] to-[hsl(var(--google-blue))] flex items-center justify-center">
              <Languages className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Translation</h2>
              <p className="text-sm text-muted-foreground">English • Hindi • Hinglish</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Language selectors */}
          <div className="flex items-center gap-2">
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwapLanguages}
              className="flex-shrink-0"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>

            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {languages.find(l => l.code === sourceLang)?.flag} Source
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSpeak(sourceText, sourceLang)}
                disabled={!sourceText}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Translate button */}
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText.trim()}
            className="w-full bg-gradient-to-r from-[hsl(var(--google-green))] to-[hsl(var(--google-blue))] hover:opacity-90"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-4 h-4 mr-2" />
                Translate
              </>
            )}
          </Button>

          {/* Translated text */}
          {(translatedText || isTranslating) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {languages.find(l => l.code === targetLang)?.flag} Translation
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSpeak(translatedText, targetLang)}
                    disabled={!translatedText}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!translatedText}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="min-h-[120px] p-3 rounded-lg border border-border bg-secondary/50">
                {isTranslating ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Translating...</span>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{translatedText}</p>
                )}
              </div>
            </div>
          )}

          {/* Quick phrases */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Quick phrases:</p>
            <div className="flex flex-wrap gap-2">
              {['Hello, how are you?', 'Thank you very much', 'What is your name?', 'Nice to meet you'].map((phrase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setSourceText(phrase)}
                >
                  {phrase}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Button } from '@/components/ui/button';
import { Sparkles, Clock, CloudSun, Newspaper, Calculator, Dices, ImagePlus, Languages, Music, Brain } from 'lucide-react';

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  { icon: ImagePlus, text: 'Generate an image', color: 'from-pink-500 to-purple-500' },
  { icon: Languages, text: 'Translate something', color: 'from-green-500 to-teal-500' },
  { icon: CloudSun, text: "What's the weather?", color: 'from-yellow-500 to-orange-500' },
  { icon: Sparkles, text: 'Tell me a joke', color: 'from-blue-500 to-indigo-500' },
  { icon: Newspaper, text: 'Latest news', color: 'from-red-500 to-pink-500' },
  { icon: Brain, text: 'Fun fact please', color: 'from-purple-500 to-blue-500' },
  { icon: Calculator, text: 'Calculate 125 × 8', color: 'from-cyan-500 to-blue-500' },
  { icon: Dices, text: 'Roll a dice', color: 'from-orange-500 to-red-500' },
];

export const SuggestionChips = ({ onSuggestionClick }: SuggestionChipsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon;
        return (
          <Button
            key={index}
            variant="outline"
            onClick={() => onSuggestionClick(suggestion.text)}
            className="h-auto py-4 px-3 flex flex-col items-center gap-2 rounded-xl border-2 hover:border-transparent hover:shadow-lg transition-all group"
          >
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${suggestion.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm text-center font-medium">{suggestion.text}</span>
          </Button>
        );
      })}
    </div>
  );
};

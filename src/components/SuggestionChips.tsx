import { Button } from '@/components/ui/button';
import { Sparkles, Clock, CloudSun, Newspaper, Calculator, Dices } from 'lucide-react';

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  { icon: Sparkles, text: 'Tell me a joke', color: 'hover:bg-blue-50' },
  { icon: CloudSun, text: 'Weather today', color: 'hover:bg-yellow-50' },
  { icon: Newspaper, text: 'Latest news', color: 'hover:bg-green-50' },
  { icon: Calculator, text: 'Calculate 25 * 4', color: 'hover:bg-purple-50' },
  { icon: Dices, text: 'Flip a coin', color: 'hover:bg-red-50' },
  { icon: Clock, text: 'What time is it', color: 'hover:bg-orange-50' },
];

export const SuggestionChips = ({ onSuggestionClick }: SuggestionChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon;
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion.text)}
            className={`rounded-full border-2 ${suggestion.color} transition-colors`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {suggestion.text}
          </Button>
        );
      })}
    </div>
  );
};

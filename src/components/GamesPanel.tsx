import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, GamepadIcon, Brain, Volume2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnimalSoundGame } from './games/AnimalSoundGame';
import { TriviaGame } from './games/TriviaGame';

interface GamesPanelProps {
  onClose: () => void;
}

type GameType = 'animal' | 'trivia' | null;

export const GamesPanel = ({ onClose }: GamesPanelProps) => {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all');

  if (selectedGame === 'animal') {
    return <AnimalSoundGame difficulty={difficulty} onClose={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'trivia') {
    return <TriviaGame onClose={() => setSelectedGame(null)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-space-dark rounded-2xl p-8 max-w-md w-full border border-glow-cyan/30 glow-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold glow-text">Games & Quizzes</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Difficulty Level</label>
            <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
              <SelectTrigger className="bg-space-lighter border-glow-cyan/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setSelectedGame('animal')}
              className="w-full h-auto py-6 flex flex-col gap-2 bg-gradient-to-r from-glow-cyan to-glow-purple hover:opacity-90"
            >
              <Volume2 className="h-8 w-8" />
              <span className="text-lg font-bold">Animal Sounds Game</span>
              <span className="text-xs text-white/70">Guess the animal by its sound</span>
            </Button>

            <Button
              onClick={() => setSelectedGame('trivia')}
              className="w-full h-auto py-6 flex flex-col gap-2 bg-gradient-to-r from-glow-purple to-glow-cyan hover:opacity-90"
            >
              <Brain className="h-8 w-8" />
              <span className="text-lg font-bold">Trivia Quiz</span>
              <span className="text-xs text-white/70">Test your knowledge</span>
            </Button>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            More games coming soon! 🎮
          </p>
        </div>
      </div>
    </div>
  );
};

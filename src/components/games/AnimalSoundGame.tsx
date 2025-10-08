import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { animals, Animal } from '@/data/animalSounds';
import { Trophy, RefreshCw, Lightbulb } from 'lucide-react';

interface AnimalSoundGameProps {
  difficulty: 'easy' | 'medium' | 'hard' | 'all';
  onClose: () => void;
}

export const AnimalSoundGame = ({ difficulty, onClose }: AnimalSoundGameProps) => {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [options, setOptions] = useState<Animal[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const filteredAnimals =
    difficulty === 'all' ? animals : animals.filter((a) => a.difficulty === difficulty);

  const startNewRound = () => {
    if (filteredAnimals.length < 4) return;

    const randomAnimal = filteredAnimals[Math.floor(Math.random() * filteredAnimals.length)];
    setCurrentAnimal(randomAnimal);

    const wrongOptions = filteredAnimals
      .filter((a) => a.id !== randomAnimal.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [randomAnimal, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setShowResult(false);
    setShowHint(false);
  };

  useEffect(() => {
    startNewRound();
  }, [difficulty]);

  const handleGuess = (animal: Animal) => {
    if (showResult) return;

    const correct = animal.id === currentAnimal?.id;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + (showHint ? 5 : 10));
    }

    setTimeout(() => {
      setRound(round + 1);
      startNewRound();
    }, 2000);
  };

  const handleHint = () => {
    setShowHint(true);
    setHintsUsed(hintsUsed + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-space-dark rounded-2xl p-8 max-w-2xl w-full border border-glow-cyan/30 glow-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-glow-cyan" />
              <span className="text-xl font-bold">Score: {score}</span>
            </div>
            <span className="text-muted-foreground">Round: {round + 1}</span>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        {currentAnimal && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-glow-cyan to-glow-purple flex items-center justify-center animate-pulse-glow">
                <span className="text-6xl">{currentAnimal.sound.split(' ')[0]}</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 glow-text">
                What animal makes this sound?
              </h3>
              <p className="text-4xl font-bold text-glow-cyan mb-2">{currentAnimal.sound}</p>

              {!showResult && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHint}
                  disabled={showHint}
                  className="mt-2 border-glow-cyan/30"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Hint (-5 points)
                </Button>
              )}

              {showHint && !showResult && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  💡 {currentAnimal.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {options.map((animal) => (
                <Button
                  key={animal.id}
                  onClick={() => handleGuess(animal)}
                  disabled={showResult}
                  variant={
                    showResult && animal.id === currentAnimal.id
                      ? 'default'
                      : showResult && animal.id !== currentAnimal.id
                      ? 'destructive'
                      : 'outline'
                  }
                  className={`h-auto py-4 flex flex-col gap-2 ${
                    showResult && animal.id === currentAnimal.id
                      ? 'bg-green-500 hover:bg-green-600'
                      : ''
                  }`}
                >
                  <img
                    src={animal.imageUrl}
                    alt={animal.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <span className="text-lg font-semibold">{animal.name}</span>
                </Button>
              ))}
            </div>

            {showResult && (
              <div
                className={`text-center p-4 rounded-lg ${
                  isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                <p className="text-xl font-bold">
                  {isCorrect ? '🎉 Correct!' : '❌ Wrong!'}
                </p>
                <p className="text-sm mt-1">
                  {isCorrect
                    ? `+${showHint ? '5' : '10'} points`
                    : `It was ${currentAnimal.name}`}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Hints used: {hintsUsed}</p>
        </div>
      </Card>
    </div>
  );
};

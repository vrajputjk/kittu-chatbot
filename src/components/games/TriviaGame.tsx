import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Timer } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

const triviaQuestions: Question[] = [
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2,
    category: 'Geography',
  },
  {
    question: 'Who painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
    correctAnswer: 1,
    category: 'Art',
  },
  {
    question: 'What is the largest planet in our solar system?',
    options: ['Mars', 'Saturn', 'Jupiter', 'Neptune'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    question: 'In which year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correctAnswer: 2,
    category: 'History',
  },
  {
    question: 'What is the smallest unit of life?',
    options: ['Atom', 'Molecule', 'Cell', 'Organ'],
    correctAnswer: 2,
    category: 'Biology',
  },
  {
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctAnswer: 1,
    category: 'Literature',
  },
  {
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 2,
    category: 'Chemistry',
  },
  {
    question: 'How many continents are there?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    category: 'Geography',
  },
];

interface TriviaGameProps {
  onClose: () => void;
}

export const TriviaGame = ({ onClose }: TriviaGameProps) => {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);

  const question = triviaQuestions[currentQuestion];

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1);
    }
  }, [timeLeft, showResult, gameOver]);

  const handleAnswer = (answerIndex: number) => {
    if (showResult || gameOver) return;

    const correct = answerIndex === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + timeLeft * 10);
    }

    setTimeout(() => {
      if (currentQuestion < triviaQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowResult(false);
        setTimeLeft(15);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setScore(0);
    setCurrentQuestion(0);
    setShowResult(false);
    setTimeLeft(15);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="bg-space-dark rounded-2xl p-8 max-w-md w-full border border-glow-cyan/30 glow-border text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-glow-cyan" />
          <h2 className="text-3xl font-bold mb-4 glow-text">Game Over!</h2>
          <p className="text-2xl mb-2">Final Score: {score}</p>
          <p className="text-muted-foreground mb-6">
            You answered {currentQuestion + 1} questions
          </p>
          <div className="flex gap-3">
            <Button onClick={resetGame} className="flex-1 bg-gradient-to-r from-glow-cyan to-glow-purple">
              Play Again
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 border-glow-cyan/30">
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-space-dark rounded-2xl p-8 max-w-2xl w-full border border-glow-cyan/30 glow-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-glow-cyan" />
              <span className="text-xl font-bold">Score: {score}</span>
            </div>
            <span className="text-muted-foreground">
              Question {currentQuestion + 1}/{triviaQuestions.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-glow-purple" />
              <span className="text-xl font-bold">{timeLeft}s</span>
            </div>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-sm text-glow-cyan">{question.category}</span>
            <h3 className="text-2xl font-bold mt-2 mb-4">{question.question}</h3>
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                variant={
                  showResult && index === question.correctAnswer
                    ? 'default'
                    : showResult && index !== question.correctAnswer
                    ? 'destructive'
                    : 'outline'
                }
                className={`w-full text-left justify-start h-auto py-4 ${
                  showResult && index === question.correctAnswer
                    ? 'bg-green-500 hover:bg-green-600'
                    : ''
                }`}
              >
                <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
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
                  ? `+${timeLeft * 10} points (${timeLeft}s × 10)`
                  : `The answer was ${question.options[question.correctAnswer]}`}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

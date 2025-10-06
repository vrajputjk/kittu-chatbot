import React, { useEffect, useRef, useState } from 'react';
import { Mic, Send, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import VoiceWave from './VoiceWave';
import ChatMessage from './ChatMessage';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

const KittuAssistant: React.FC = () => {
  const { messages, sendMessage, isLoading, sendGreeting, hasGreeted } = useChat();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    sendGreeting();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  const handleVoiceToggle = () => {
    toast({
      title: 'Voice feature coming soon!',
      description: 'Voice recognition will be available in the next update.',
    });
    setIsListening(!isListening);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                <div className="w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold glow-text">Kittu</h1>
              <p className="text-sm text-muted-foreground">Your AI Assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-float">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center glow-border">
                      <div className="w-16 h-16 rounded-full bg-primary/40 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary animate-pulse-glow" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold glow-text">Wake me up with "Kittu" or "Arise"</h2>
                  <p className="text-muted-foreground">I'm here to help you with anything you need</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <ChatMessage key={idx} role={msg.role} content={msg.content} />
                ))}
                {isLoading && (
                  <div className="flex gap-3 p-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <Mic size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Kittu</div>
                      <VoiceWave isActive={true} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 backdrop-blur-md bg-card/30">
          <div className="container mx-auto px-4 py-4 max-w-4xl">
            <Card className="p-2 flex items-center gap-2 bg-card/50 backdrop-blur border-primary/20 glow-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceToggle}
                className={`flex-shrink-0 ${isListening ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 bg-primary hover:bg-primary/90"
              >
                <Send className="w-5 h-5" />
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KittuAssistant;

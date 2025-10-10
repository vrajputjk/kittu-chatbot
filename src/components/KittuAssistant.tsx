import { useState, useRef, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Settings, LogOut, GamepadIcon, Bell, Keyboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/useChat';
import { useVoiceSynthesis } from '@/hooks/useVoiceSynthesis';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import ChatMessage from './ChatMessage';
import { AuthForm } from './AuthForm';
import { SettingsPanel } from './SettingsPanel';
import { GamesPanel } from './GamesPanel';
import { RemindersPanel } from './RemindersPanel';
import { SuggestionChips } from './SuggestionChips';
import { AssistantAvatar } from './AssistantAvatar';
import { parseCommand, executeCommand } from '@/utils/commandParser';

const KittuAssistant = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { messages, sendMessage, isLoading, sendGreeting, hasGreeted, setMessages } = useChat(
    profile?.language_preference || 'en'
  );
  const { speak, stop, isSpeaking } = useVoiceSynthesis(
    profile?.voice_enabled ?? true,
    profile?.voice_speed || 1.0
  );

  const handleVoiceInput = (text: string) => {
    setInput(text);
    toast({
      title: 'Voice recognized',
      description: `"${text}"`,
    });
  };

  const { isListening, startListening, stopListening, isSupported } = useVoiceRecognition(
    handleVoiceInput
  );

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && !hasGreeted) {
      sendGreeting();
    }
  }, [user, hasGreeted, sendGreeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speak assistant messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isLoading) {
        const langMap: Record<string, string> = {
          en: 'en-US',
          hi: 'hi-IN',
          hinglish: 'en-IN',
        };
        speak(lastMessage.content, langMap[profile?.language_preference] || 'en-US');
      }
    }
  }, [messages, isLoading, profile?.language_preference]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput('');
    stop(); // Stop any ongoing speech

    // Parse command
    const command = parseCommand(userInput);

    // Execute command if it's not a chat
    if (command.type !== 'chat') {
      try {
        let commandResponse = '';

        // Handle weather command
        if (command.type === 'weather') {
          const { data, error } = await supabase.functions.invoke('weather', {
            body: { location: command.parameters.location },
          });
          if (error) throw error;
          commandResponse = `Weather in ${data.location}: ${data.temperature}, ${data.condition}. Feels like ${data.feelsLike}. Humidity: ${data.humidity}, Wind: ${data.windSpeed}`;
        }

        // Handle news command
        else if (command.type === 'news') {
          const { data, error } = await supabase.functions.invoke('news', {
            body: { query: command.parameters.query },
          });
          if (error) throw error;
          if (data.articles && data.articles.length > 0) {
            commandResponse = `Latest news:\n\n${data.articles
              .map((article: any, i: number) => `${i + 1}. ${article.title}\n${article.description || ''}`)
              .join('\n\n')}`;
          } else {
            commandResponse = 'No news found for your query.';
          }
        }

        // Handle web search command
        else if (command.type === 'web_search') {
          const { data, error } = await supabase.functions.invoke('search', {
            body: { query: command.parameters.query },
          });
          if (error) throw error;
          commandResponse = data.abstract
            ? `${data.heading}\n\n${data.abstract}\n\nLearn more: ${data.url}`
            : 'No results found for your search.';
        }

        // Handle set reminder command
        else if (command.type === 'set_reminder') {
          setShowReminders(true);
          commandResponse = 'Opening reminders panel. You can add your reminder there.';
        }

        // Handle other commands
        else {
          commandResponse = (await executeCommand(command)) || '';
        }

        if (commandResponse) {
          setMessages((prev) => [
            ...prev,
            { role: 'user', content: userInput },
            { role: 'assistant', content: commandResponse },
          ]);

          // Save command to database
          if (user) {
            await supabase.from('commands').insert({
              user_id: user.id,
              command_text: userInput,
              command_type: command.type,
            });
          }
          return;
        }
      } catch (error: any) {
        console.error('Command execution error:', error);
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: userInput },
          { role: 'assistant', content: `Sorry, I encountered an error: ${error.message}` },
        ]);
        return;
      }
    }

    // Send to AI for chat
    await sendMessage(userInput);
  };

  const handleVoiceToggle = () => {
    if (!isSupported) {
      toast({
        title: 'Voice input not supported',
        description: 'Your browser does not support voice recognition.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      const langMap: Record<string, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        hinglish: 'en-IN',
      };
      startListening(langMap[profile?.language_preference] || 'en-US');
      toast({
        title: 'Listening...',
        description: 'Speak now',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Goodbye!',
      description: 'You have been logged out.',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AuthForm onSuccess={() => {}} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Minimal Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-lg font-medium text-foreground">Assistant</h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowReminders(true)}
              className="rounded-full"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGames(true)}
              className="rounded-full"
            >
              <GamepadIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="rounded-full"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <AssistantAvatar 
                isListening={isListening} 
                isSpeaking={isSpeaking}
                size="lg"
              />
              <h2 className="text-4xl font-normal mt-8 mb-2">
                Hi, {profile?.full_name || 'there'}
              </h2>
              <p className="text-muted-foreground mb-8">How can I help you today?</p>
              <SuggestionChips onSuggestionClick={(text) => {
                setInput(text);
                handleSend();
              }} />
            </div>
          ) : (
            <div className="space-y-6 pb-32">
              {messages.map((message, index) => (
                <ChatMessage key={index} role={message.role} content={message.content} />
              ))}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <AssistantAvatar isListening={false} isSpeaking={true} size="sm" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Input Bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 bg-card rounded-full shadow-medium px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full flex-shrink-0"
              onClick={() => setInput('')}
            >
              <Keyboard className="h-5 w-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            />
            <Button
              size="icon"
              className={`rounded-full flex-shrink-0 transition-all ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse-ring' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
              onClick={handleVoiceToggle}
              disabled={!isSupported}
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
          {isListening && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Listening...
            </p>
          )}
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          onClose={() => {
            setShowSettings(false);
            loadProfile();
          }}
          userId={user.id}
        />
      )}

      {showGames && <GamesPanel onClose={() => setShowGames(false)} />}

      {showReminders && <RemindersPanel onClose={() => setShowReminders(false)} userId={user.id} />}
    </div>
  );
};

export default KittuAssistant;

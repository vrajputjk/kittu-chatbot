import { useState, useRef, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Settings, LogOut, Bell, Send, Gamepad2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
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
  }, [user, hasGreeted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speak assistant messages
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        const langMap: Record<string, string> = {
          en: 'en-US',
          hi: 'hi-IN',
          hinglish: 'en-IN',
        };
        speak(lastMessage.content, langMap[profile?.language_preference] || 'en-US');
      }
    }
  }, [messages.length, isLoading, profile?.language_preference]);

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {!user ? (
        <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <AuthForm onSuccess={() => {}} />
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-border/30 shadow-md">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AssistantAvatar 
                  size="sm"
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-google-blue via-google-red to-google-yellow bg-clip-text text-transparent">
                    Assistant
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium">
                    {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : '✨ Ready to help'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowReminders(true)}
                  className="hover:bg-google-blue/10 hover:text-google-blue transition-all"
                >
                  <Bell className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowGames(true)}
                  className="hover:bg-google-green/10 hover:text-google-green transition-all"
                >
                  <Gamepad2 className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="hover:bg-google-yellow/20 hover:text-google-yellow transition-all"
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-google-red/10 hover:text-google-red transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-12">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-10">
                  <div className="animate-fade-in">
                    <AssistantAvatar 
                      size="lg"
                      isListening={isListening}
                      isSpeaking={isSpeaking}
                    />
                  </div>
                  <div className="text-center space-y-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-google-blue via-google-red to-google-yellow bg-clip-text text-transparent">
                      Hi, I'm your Assistant
                    </h2>
                    <p className="text-muted-foreground text-xl font-medium">How can I help you today?</p>
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <SuggestionChips onSuggestionClick={(text) => {
                      setInput(text);
                      handleSend();
                    }} />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {messages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      role={msg.role}
                      content={msg.content}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-4 animate-fade-in">
                      <AssistantAvatar size="sm" isSpeaking={true} />
                      <div className="bg-white/95 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-lg border border-border/50">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-google-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-3 h-3 bg-google-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-3 h-3 bg-google-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Input Bar */}
          <div className="sticky bottom-0 backdrop-blur-2xl bg-white/80 border-t border-border/30 shadow-2xl">
            <div className="max-w-5xl mx-auto px-6 py-5">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask me anything..."
                    className="min-h-[60px] max-h-36 resize-none rounded-3xl border-2 border-border bg-white/90 backdrop-blur-sm pr-12 focus:border-google-blue focus:shadow-lg transition-all text-base"
                  />
                </div>
                <Button
                  onClick={handleVoiceToggle}
                  variant={isListening ? "default" : "outline"}
                  size="icon"
                  className={`rounded-full w-16 h-16 flex-shrink-0 transition-all duration-300 ${
                    isListening 
                      ? 'bg-google-red hover:bg-google-red/90 text-white shadow-2xl scale-110 animate-pulse' 
                      : 'hover:bg-google-blue/10 hover:border-google-blue hover:scale-105 border-2'
                  }`}
                >
                  <Mic className="w-6 h-6" />
                </Button>
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="rounded-full w-16 h-16 flex-shrink-0 bg-gradient-to-r from-google-blue via-google-red to-google-yellow hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

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

import { useState, useRef, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mic, Settings, LogOut, Bell, Send, Gamepad2, ImagePlus, Languages, Sparkles } from 'lucide-react';
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
import { ImageGenerationPanel } from './ImageGenerationPanel';
import { TranslationPanel } from './TranslationPanel';
import { SuggestionChips } from './SuggestionChips';
import { AssistantAvatar } from './AssistantAvatar';
import { parseCommand, executeCommand } from '@/utils/commandParser';
import { QuickActions } from './QuickActions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const KittuAssistant = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { messages, sendMessage, isLoading, sendGreeting, hasGreeted, setMessages } = useChat(
    profile?.language_preference || 'en',
    profile?.full_name
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

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
    stop();

    const command = parseCommand(userInput);

    // Handle image generation command
    if (command.type === 'chat' && (
      userInput.toLowerCase().includes('generate image') ||
      userInput.toLowerCase().includes('create image') ||
      userInput.toLowerCase().includes('make image') ||
      userInput.toLowerCase().includes('draw') ||
      userInput.toLowerCase().includes('tasveer banao')
    )) {
      setShowImageGen(true);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userInput },
        { role: 'assistant', content: "I've opened the image generation panel for you. Describe what you'd like me to create! ✨" },
      ]);
      return;
    }

    // Handle translation command
    if (command.type === 'translate' || (command.type === 'chat' && (
      userInput.toLowerCase().includes('translate') ||
      userInput.toLowerCase().includes('anuvad') ||
      userInput.toLowerCase().includes('translation')
    ))) {
      setShowTranslation(true);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userInput },
        { role: 'assistant', content: "I've opened the translation panel. You can translate between English, Hindi, and Hinglish! 🌐" },
      ]);
      return;
    }

    if (command.type !== 'chat') {
      try {
        let commandResponse = '';

        if (command.type === 'weather') {
          const { data, error } = await supabase.functions.invoke('weather', {
            body: { location: command.parameters.location },
          });
          if (error) throw error;
          commandResponse = `Weather in ${data.location}: ${data.temperature}, ${data.condition}. Feels like ${data.feelsLike}. Humidity: ${data.humidity}, Wind: ${data.windSpeed}`;
        }

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

        else if (command.type === 'web_search') {
          const { data, error } = await supabase.functions.invoke('search', {
            body: { query: command.parameters.query },
          });
          if (error) throw error;
          commandResponse = data.abstract
            ? `${data.heading}\n\n${data.abstract}\n\nLearn more: ${data.url}`
            : 'No results found for your search.';
        }

        else if (command.type === 'set_reminder') {
          setShowReminders(true);
          commandResponse = 'Opening reminders panel. You can add your reminder there.';
        }

        else {
          commandResponse = (await executeCommand(command)) || '';
        }

        if (commandResponse) {
          setMessages((prev) => [
            ...prev,
            { role: 'user', content: userInput },
            { role: 'assistant', content: commandResponse },
          ]);

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
          { role: 'assistant', content: `Sorry, I encountered an error. Please try again.` },
        ]);
        return;
      }
    }

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

  const handleClearChat = () => {
    setMessages([]);
    setShowClearDialog(false);
    toast({
      title: 'Chat cleared',
      description: 'Your conversation history has been cleared.',
    });
  };

  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `🎨 I created this image for you: "${prompt}"\n\n[Image Generated Successfully]` },
    ]);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        {!user ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <AuthForm onSuccess={() => {}} />
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
              <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AssistantAvatar 
                    size="sm"
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                  />
                  <div>
                    <h1 className="text-xl font-semibold bg-gradient-to-r from-[hsl(var(--google-blue))] via-[hsl(var(--google-red))] to-[hsl(var(--google-yellow))] bg-clip-text text-transparent">
                      Kittu
                    </h1>
                    <p className="text-xs text-muted-foreground">Your AI Assistant</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <QuickActions 
                    onClearChat={() => setShowClearDialog(true)} 
                    messages={messages}
                  />
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowImageGen(true)}
                        className="h-9 w-9 p-0"
                      >
                        <ImagePlus className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Generate Image</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowTranslation(true)}
                        className="h-9 w-9 p-0"
                      >
                        <Languages className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Translate</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowReminders(true)}
                        className="h-9 w-9 p-0"
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reminders</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowGames(true)}
                        className="h-9 w-9 p-0"
                      >
                        <Gamepad2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Games</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowSettings(true)}
                        className="h-9 w-9 p-0"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Settings</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleLogout}
                        className="h-9 w-9 p-0"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Logout</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-8">
                    <div className="animate-fade-in">
                      <AssistantAvatar 
                        size="lg"
                        isListening={isListening}
                        isSpeaking={isSpeaking}
                      />
                    </div>
                    <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <h2 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-[hsl(var(--google-blue))] via-[hsl(var(--google-red))] to-[hsl(var(--google-yellow))] bg-clip-text text-transparent">
                        Hi! I'm Kittu ✨
                      </h2>
                      <p className="text-muted-foreground">How can I help you today?</p>
                    </div>
                    <div className="animate-fade-in w-full max-w-2xl" style={{ animationDelay: '0.2s' }}>
                      <SuggestionChips onSuggestionClick={(text) => {
                        setInput(text);
                        setTimeout(() => handleSend(), 100);
                      }} />
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    {messages.map((msg, index) => (
                      <ChatMessage
                        key={index}
                        role={msg.role}
                        content={msg.content}
                        timestamp={new Date().toISOString()}
                      />
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3 animate-fade-in mb-6">
                        <div className="flex-shrink-0 mt-1">
                          <AssistantAvatar size="sm" isSpeaking={true} />
                        </div>
                        <div className="bg-[hsl(var(--chat-assistant-bg))] rounded-2xl px-5 py-3 border border-border shadow-sm">
                          <div className="flex gap-1.5">
                            <div className="w-2 h-2 bg-[hsl(var(--google-blue))] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-[hsl(var(--google-red))] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-[hsl(var(--google-yellow))] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            <div className="w-2 h-2 bg-[hsl(var(--google-green))] rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </main>

            {/* Input Bar */}
            <div className="sticky bottom-0 backdrop-blur-xl bg-background/95 border-t border-border">
              <div className="max-w-3xl mx-auto px-4 py-4">
                <div className="flex gap-2 items-end">
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
                      className="min-h-[52px] max-h-32 resize-none rounded-3xl border border-input bg-background px-5 py-3 pr-12 focus:border-ring focus:ring-1 focus:ring-ring transition-all text-[15px]"
                    />
                  </div>
                  <Button
                    onClick={handleVoiceToggle}
                    variant={isListening ? "default" : "ghost"}
                    size="icon"
                    className={`rounded-full h-12 w-12 flex-shrink-0 transition-all ${
                      isListening 
                        ? 'bg-[hsl(var(--google-red))] hover:bg-[hsl(var(--google-red))]/90 text-white shadow-lg animate-pulse' 
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="rounded-full h-12 w-12 flex-shrink-0 bg-gradient-to-r from-[hsl(var(--google-blue))] to-[hsl(var(--google-green))] hover:opacity-90 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Panels */}
        {showSettings && (
          <SettingsPanel
            onClose={() => {
              setShowSettings(false);
              loadProfile();
            }}
            userId={user!.id}
          />
        )}

        {showGames && <GamesPanel onClose={() => setShowGames(false)} />}

        {showReminders && <RemindersPanel onClose={() => setShowReminders(false)} userId={user!.id} />}

        {showImageGen && (
          <ImageGenerationPanel 
            onClose={() => setShowImageGen(false)} 
            onImageGenerated={handleImageGenerated}
          />
        )}

        {showTranslation && (
          <TranslationPanel onClose={() => setShowTranslation(false)} />
        )}

        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your current conversation. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearChat} className="bg-destructive hover:bg-destructive/90">
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default KittuAssistant;

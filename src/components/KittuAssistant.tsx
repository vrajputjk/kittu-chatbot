import { useState, useRef, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, Settings, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/useChat';
import { useVoiceSynthesis } from '@/hooks/useVoiceSynthesis';
import ChatMessage from './ChatMessage';
import VoiceWave from './VoiceWave';
import { AuthForm } from './AuthForm';
import { SettingsPanel } from './SettingsPanel';
import { parseCommand, executeCommand } from '@/utils/commandParser';

const KittuAssistant = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
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
      const commandResponse = await executeCommand(command);
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
    }

    // Send to AI for chat
    await sendMessage(userInput);
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
      <div className="min-h-screen bg-gradient-to-br from-space-dark via-space-dark to-glow-purple/10 flex items-center justify-center p-4">
        <AuthForm onSuccess={() => {}} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-space-dark via-space-dark to-glow-purple/10">
      {/* Header */}
      <div className="border-b border-glow-cyan/20 bg-space-dark/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-glow-cyan to-glow-purple animate-pulse-glow flex items-center justify-center">
              <span className="text-xl font-bold">K</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold glow-text">Kittu</h1>
              <p className="text-sm text-muted-foreground">AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.full_name || user.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="hover:bg-glow-cyan/10"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-glow-cyan/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-glow-cyan to-glow-purple animate-float flex items-center justify-center mb-6">
              <span className="text-4xl font-bold">K</span>
            </div>
            <h2 className="text-3xl font-bold mb-2 glow-text">Welcome back, {profile?.full_name || 'Rajput'}!</h2>
            <p className="text-muted-foreground max-w-md">
              I'm Kittu, your AI assistant. I can help you with conversations, commands, and more. Try saying "search for AI news" or just chat with me!
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={index} role={message.role} content={message.content} />
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-3 p-4">
            <VoiceWave isActive={true} />
            <span className="text-sm text-muted-foreground">Kittu is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-glow-cyan/20 bg-space-dark/80 backdrop-blur-sm p-6">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Button
            variant="outline"
            size="icon"
            className="flex-shrink-0 border-glow-cyan/30 hover:bg-glow-cyan/10"
            onClick={() => {
              toast({
                title: 'Voice input coming soon!',
                description: 'Speech recognition will be available in the next update.',
              });
            }}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message or command..."
            disabled={isLoading}
            className="flex-1 bg-space-lighter border-glow-cyan/30 focus:border-glow-cyan"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 bg-gradient-to-r from-glow-cyan to-glow-purple hover:opacity-90"
          >
            <Send className="h-5 w-5" />
          </Button>
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
    </div>
  );
};

export default KittuAssistant;

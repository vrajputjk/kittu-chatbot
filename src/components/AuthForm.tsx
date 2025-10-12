import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

interface AuthFormProps {
  onSuccess: () => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password';

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're coming back from a password reset email
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setView('reset-password');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        onSuccess();
      } else if (view === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Welcome to Kittu AI Assistant.",
        });
        onSuccess();
      } else if (view === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });

        if (error) throw error;

        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
        setView('login');
      } else if (view === 'reset-password') {
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords don't match",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) throw error;

        toast({
          title: "Password updated!",
          description: "Your password has been successfully reset.",
        });
        setView('login');
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Join Assistant';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'New Password';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'login': return 'Sign in to continue';
      case 'signup': return 'Create your account';
      case 'forgot-password': return 'Enter your email to receive a reset link';
      case 'reset-password': return 'Enter your new password';
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-border shadow-2xl animate-fade-in">
      {(view === 'forgot-password' || view === 'reset-password') && (
        <button
          onClick={() => setView('login')}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-google-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>
      )}
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-google-blue via-google-red to-google-yellow bg-clip-text text-transparent">
          {getTitle()}
        </h1>
        <p className="text-muted-foreground">
          {getSubtitle()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {view === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground font-medium">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-background border-border focus:border-google-blue transition-colors h-12"
              placeholder="Enter your name"
            />
          </div>
        )}

        {view !== 'reset-password' && (
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background border-border focus:border-google-blue transition-colors h-12"
              placeholder="your@email.com"
            />
          </div>
        )}

        {(view === 'login' || view === 'signup' || view === 'reset-password') && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              {view === 'reset-password' ? 'New Password' : 'Password'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-background border-border focus:border-google-blue transition-colors h-12"
              placeholder="••••••••"
            />
          </div>
        )}

        {view === 'reset-password' && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="bg-background border-border focus:border-google-blue transition-colors h-12"
              placeholder="••••••••"
            />
          </div>
        )}

        {view === 'login' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setView('forgot-password')}
              className="text-sm text-google-blue hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-google-blue via-google-red to-google-yellow hover:shadow-lg hover:scale-[1.02] transition-all font-semibold text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {view === 'login' && 'Signing in...'}
              {view === 'signup' && 'Creating account...'}
              {view === 'forgot-password' && 'Sending email...'}
              {view === 'reset-password' && 'Updating password...'}
            </>
          ) : (
            <>
              {view === 'login' && 'Sign In'}
              {view === 'signup' && 'Create Account'}
              {view === 'forgot-password' && 'Send Reset Link'}
              {view === 'reset-password' && 'Update Password'}
            </>
          )}
        </Button>

        {(view === 'login' || view === 'signup') && (
          <button
            type="button"
            onClick={() => setView(view === 'login' ? 'signup' : 'login')}
            className="w-full text-sm text-muted-foreground hover:text-google-blue transition-colors font-medium pt-2"
          >
            {view === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        )}
      </form>
    </div>
  );
};

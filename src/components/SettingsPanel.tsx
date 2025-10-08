import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { X, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsPanelProps {
  onClose: () => void;
  userId: string;
}

interface Profile {
  full_name: string;
  voice_enabled: boolean;
  voice_speed: number;
  language_preference: string;
}

export const SettingsPanel = ({ onClose, userId }: SettingsPanelProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    voice_enabled: true,
    voice_speed: 1.0,
    language_preference: 'en',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          voice_enabled: data.voice_enabled ?? true,
          voice_speed: data.voice_speed || 1.0,
          language_preference: data.language_preference || 'en',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error loading profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          voice_enabled: profile.voice_enabled,
          voice_speed: profile.voice_speed,
          language_preference: profile.language_preference,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
      });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-space-dark rounded-2xl p-8 border border-glow-cyan/30 glow-border">
          <Loader2 className="h-8 w-8 animate-spin text-glow-cyan" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-space-dark rounded-2xl p-8 max-w-md w-full mx-4 border border-glow-cyan/30 glow-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold glow-text">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="bg-space-lighter border-glow-cyan/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language Preference</Label>
            <Select
              value={profile.language_preference}
              onValueChange={(value) => setProfile({ ...profile, language_preference: value })}
            >
              <SelectTrigger id="language" className="bg-space-lighter border-glow-cyan/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="hinglish">Hinglish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="voice">Voice Responses</Label>
            <Switch
              id="voice"
              checked={profile.voice_enabled}
              onCheckedChange={(checked) => setProfile({ ...profile, voice_enabled: checked })}
            />
          </div>

          {profile.voice_enabled && (
            <div className="space-y-2">
              <Label>Voice Speed: {profile.voice_speed.toFixed(1)}x</Label>
              <Slider
                value={[profile.voice_speed]}
                onValueChange={(value) => setProfile({ ...profile, voice_speed: value[0] })}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-glow-cyan to-glow-purple hover:opacity-90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

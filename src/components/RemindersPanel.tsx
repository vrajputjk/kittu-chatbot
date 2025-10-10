import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  reminder_time: string;
  is_completed: boolean;
}

interface RemindersPanelProps {
  onClose: () => void;
  userId: string;
}

export const RemindersPanel = ({ onClose, userId }: RemindersPanelProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('reminder_time', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading reminders',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addReminder = async () => {
    if (!title || !reminderTime) {
      toast({
        title: 'Missing fields',
        description: 'Please provide title and time',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('reminders').insert({
        user_id: userId,
        title,
        description,
        reminder_time: new Date(reminderTime).toISOString(),
      });

      if (error) throw error;

      toast({
        title: 'Reminder added',
        description: 'Your reminder has been created',
      });

      setTitle('');
      setDescription('');
      setReminderTime('');
      loadReminders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: !isCompleted })
        .eq('id', id);

      if (error) throw error;
      loadReminders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id);

      if (error) throw error;
      loadReminders();
      toast({
        title: 'Reminder deleted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-space-dark border-glow-cyan/30 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold glow-text">Reminders</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          <Input
            placeholder="Reminder title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-space-lighter border-glow-cyan/30"
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-space-lighter border-glow-cyan/30"
          />
          <Input
            type="datetime-local"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="bg-space-lighter border-glow-cyan/30"
          />
          <Button onClick={addReminder} className="w-full bg-gradient-to-r from-glow-cyan to-glow-purple">
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        </div>

        <div className="space-y-3">
          {reminders.map((reminder) => (
            <Card
              key={reminder.id}
              className={`p-4 bg-space-lighter border-glow-cyan/20 ${
                reminder.is_completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`font-semibold ${reminder.is_completed ? 'line-through' : ''}`}>
                    {reminder.title}
                  </h3>
                  {reminder.description && (
                    <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(reminder.reminder_time).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleComplete(reminder.id, reminder.is_completed)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {reminders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No reminders yet</p>
          )}
        </div>
      </Card>
    </div>
  );
};

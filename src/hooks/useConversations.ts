import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  const loadConversations = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (title: string = 'New Conversation') => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: userId, title })
        .select()
        .single();

      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      setCurrentConversationId(data.id);
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const updateConversationTitle = async (conversationId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) throw error;
      
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, title } : c)
      );
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    deleteConversation,
    updateConversationTitle,
    isLoading,
    refreshConversations: loadConversations,
  };
};

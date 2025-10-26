import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Message = { 
  id?: string;
  role: 'user' | 'assistant' | 'system'; 
  content: string;
  created_at?: string;
};

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      subscribeToMessages();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const loadMessages = async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        created_at: msg.created_at
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const saveMessage = async (message: Omit<Message, 'id' | 'created_at'>) => {
    if (!conversationId) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  const addLocalMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const updateLastMessage = (content: string) => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant') {
        return prev.map((m, i) => 
          i === prev.length - 1 ? { ...m, content } : m
        );
      }
      return [...prev, { role: 'assistant', content }];
    });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    setMessages,
    saveMessage,
    addLocalMessage,
    updateLastMessage,
    clearMessages,
    isLoading,
  };
};

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ContactMessage } from '@/types';

export function useContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          console.error('useContactMessages error:', fetchError);
          setError(fetchError.message);
        } else {
          setMessages(data ?? []);
          setError(null);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setRead = useCallback(async (id: string, read: boolean) => {
    const { data, error: updateError } = await supabase
      .from('contacts')
      .update({ read })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    setMessages((current) => current.map((message) => (message.id === id ? (data as ContactMessage) : message)));
    return data as ContactMessage;
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase.from('contacts').delete().eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  return { messages, loading, error, setRead, deleteMessage };
}

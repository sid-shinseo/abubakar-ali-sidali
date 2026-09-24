import { useEffect, useMemo, useState } from 'react';
import type { AuthSession } from '../types';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

    const syncSession = (authSession: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null) => {
      const user = authSession?.user ?? null;

      if (!isSubscribed) {
        return;
      }

      setSession({
        user: user
          ? {
              id: user.id,
              email: user.email ?? undefined,
            }
          : null,
        isAuthenticated: Boolean(user),
      });
      setIsLoading(false);
    };

    void supabase.auth.getSession().then(({ data }) => {
      syncSession(data.session ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, authSession) => {
      syncSession(authSession ?? null);
    });

    return () => {
      isSubscribed = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return useMemo(() => ({ session, isLoading }), [session, isLoading]);
}

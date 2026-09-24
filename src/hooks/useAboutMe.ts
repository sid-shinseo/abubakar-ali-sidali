import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { AboutMe, AboutMeInput } from '@/types';

export function useAboutMe() {
  const [aboutMe, setAboutMe] = useState<AboutMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void supabase
      .from('about_me')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          console.error('useAboutMe error:', fetchError);
          setError(fetchError.message);
        } else {
          setAboutMe(data ?? null);
          setError(null);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const upsertAboutMe = useCallback(async (payload: AboutMeInput) => {
    const existing = await supabase.from('about_me').select('id').limit(1).maybeSingle();

    const response = existing.data?.id
      ? await supabase.from('about_me').update(payload).eq('id', existing.data.id).select().single()
      : await supabase.from('about_me').insert(payload).select().single();

    if (response.error) {
      throw response.error;
    }

    setAboutMe(response.data as AboutMe);
    return response.data as AboutMe;
  }, []);

  /** Changes only the CV (null removes it). The presentation must exist first. */
  const setCvPath = useCallback(async (cvPath: string | null) => {
    const existing = await supabase.from('about_me').select('id').limit(1).maybeSingle();
    if (!existing.data?.id) {
      throw new Error("Enregistre d'abord ta présentation, puis ajoute le CV.");
    }

    const response = await supabase.from('about_me').update({ cv_path: cvPath }).eq('id', existing.data.id).select().single();
    if (response.error) {
      throw response.error;
    }

    setAboutMe(response.data as AboutMe);
    return response.data as AboutMe;
  }, []);

  return { aboutMe, loading, error, upsertAboutMe, setCvPath };
}

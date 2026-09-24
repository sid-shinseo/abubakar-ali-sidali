import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Project, ProjectInput } from '@/types';
import { useTable } from './useTable';

interface ProjectQuery {
  /** Only featured (true) or non-featured (false) projects. */
  featured?: boolean;
  /** Admin: also load drafts. Public pages only ever show published projects. */
  includeDrafts?: boolean;
}

export function useProjects({ featured, includeDrafts = false }: ProjectQuery = {}) {
  const options = useMemo(() => {
    const filters: Array<[string, boolean]> = [];
    if (!includeDrafts) filters.push(['published', true]);
    if (featured !== undefined) filters.push(['featured', featured]);
    return {
      orderBy: [
        ['order_index', true],
        ['created_at', false],
      ] as Array<[string, boolean]>,
      filters,
    };
  }, [featured, includeDrafts]);

  const table = useTable<Project, ProjectInput>('projects', options);

  return {
    projects: table.items,
    loading: table.loading,
    error: table.error,
    createProject: table.create,
    updateProject: table.update,
    deleteProject: table.remove,
    reorderProjects: table.reorder,
  };
}

interface SlugResult {
  slug: string;
  project: Project | null;
  error: string | null;
}

/**
 * Drafts stay reachable here for the logged-in admin (RLS hides them from visitors),
 * so "Voir sur le site" can preview a draft.
 */
export function useProjectBySlug(slug: string) {
  const [result, setResult] = useState<SlugResult | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    // maybeSingle: an unknown slug returns null (not-found state) instead of an error.
    void supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) {
          setResult({ slug, project: data, error: error?.message ?? null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Loading until the stored result matches the requested slug (handles navigation between projects).
  const loading = Boolean(slug) && result?.slug !== slug;
  return {
    project: loading ? null : (result?.project ?? null),
    loading,
    error: loading ? null : (result?.error ?? null),
  };
}

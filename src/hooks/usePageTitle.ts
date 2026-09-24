import { useEffect } from 'react';
import { profile } from '@/lib/profile';

/** Sets the browser tab title: "Projets · Abubakar Ali Sid-Ali". Without a title, the site's default. */
export function usePageTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · ${profile.name}` : `${profile.name} · Systèmes & réseaux`;
  }, [title]);
}

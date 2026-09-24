import { useSyncExternalStore } from 'react';
import { getThemePreference, resolveTheme, setThemePreference, subscribeTheme } from '@/lib/theme';

/** Current theme preference, the theme actually shown, and a setter. */
export function useTheme() {
  const preference = useSyncExternalStore(subscribeTheme, getThemePreference, () => 'system' as const);
  // Read from <html> so it also reflects OS changes while in "system" mode.
  const resolved = useSyncExternalStore(
    subscribeTheme,
    () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
    () => resolveTheme('system'),
  );

  return { preference, resolved, setPreference: setThemePreference };
}

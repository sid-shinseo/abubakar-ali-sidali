// Theme preference: "system" follows the visitor's OS setting, "light"/"dark" force it.
// The first paint is handled by the inline script in index.html (same storage key and logic),
// so the page never flashes the wrong theme; this module keeps it in sync afterwards.

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';
const darkQuery = '(prefers-color-scheme: dark)';

const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

let preference: ThemePreference = typeof window === 'undefined' ? 'system' : readPreference();

export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref !== 'system') return pref;
  return window.matchMedia(darkQuery).matches ? 'dark' : 'light';
}

function apply() {
  const resolved = resolveTheme(preference);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  listeners.forEach((listener) => listener());
}

export function setThemePreference(next: ThemePreference) {
  preference = next;
  try {
    if (next === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private browsing: the choice just isn't remembered.
  }
  apply();
}

export function getThemePreference() {
  return preference;
}

/** Subscribes to preference changes and, in "system" mode, to OS theme changes. */
export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia(darkQuery);
  const onSystemChange = () => {
    if (preference === 'system') apply();
  };
  media.addEventListener('change', onSystemChange);
  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', onSystemChange);
  };
}

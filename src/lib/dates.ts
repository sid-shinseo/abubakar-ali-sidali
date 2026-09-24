const relative = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
const absolute = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const short = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** "il y a 3 heures", "hier"… then a short date after a week. */
export function formatRelative(iso: string) {
  const diffSeconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diffSeconds);
  if (abs < 60) return "à l'instant";
  if (abs < 3600) return relative.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86400) return relative.format(Math.round(diffSeconds / 3600), 'hour');
  if (abs < 7 * 86400) return relative.format(Math.round(diffSeconds / 86400), 'day');
  return short.format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return absolute.format(new Date(iso));
}

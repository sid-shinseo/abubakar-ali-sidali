/** Extracts a readable message from an Error or a Supabase error object. */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') return err.message;
  return 'Erreur inconnue';
}

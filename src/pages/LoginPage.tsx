import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePageTitle } from '@/hooks/usePageTitle';
import { supabase } from '@/lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  usePageTitle('Connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      const message = signInError.message;
      console.error('Supabase login failed:', message, signInError);
      setError(
        message.includes('Email not confirmed')
          ? "Ce compte n'a pas été confirmé. Vérifiez l'email de confirmation Supabase."
          : message.includes('Invalid login credentials')
            ? 'Identifiants invalides.'
            : message,
      );
      return;
    }

    if (!data.session) {
      setError('Connexion refusée. Vérifiez que le compte existe dans Auth > Users et qu’il est confirmé.');
      return;
    }

    navigate('/admin');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-5">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Connexion</CardTitle>
          <CardDescription>Espace d'administration du portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-password">Mot de passe</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        Retour au site
      </Link>
    </main>
  );
}

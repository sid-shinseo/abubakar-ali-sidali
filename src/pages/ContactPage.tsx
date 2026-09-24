import { useEffect, useRef, useState } from 'react';
import { CvButton } from '@/components/CvButton';
import { PageIntro } from '@/components/PageIntro';
import { SiteLayout } from '@/components/SiteLayout';
import { SocialDetailLinks } from '@/components/SocialLinks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAboutMe } from '@/hooks/useAboutMe';
import { usePageTitle } from '@/hooks/usePageTitle';
import { profile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import type { ContactMessageInput } from '@/types';

type FieldErrors = Partial<Record<keyof ContactMessageInput, string>>;

const emptyForm: ContactMessageInput = { name: '', email: '', subject: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Same limits as the database constraints (supabase/portfolio-schema.sql).
const limits = { name: 100, email: 254, subject: 150, message: 5000 };
const MESSAGE_MIN = 10;
// A human needs more than this to fill the form; faster submissions are bots.
const MIN_FILL_TIME_MS = 3000;

function validate(form: ContactMessageInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Indiquez votre nom.';
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Adresse email invalide.';
  if (!form.subject.trim()) errors.subject = 'Indiquez un sujet.';
  if (form.message.trim().length < MESSAGE_MIN) errors.message = `Le message doit faire au moins ${MESSAGE_MIN} caractères.`;
  return errors;
}

export function ContactPage() {
  const { aboutMe } = useAboutMe();
  usePageTitle('Contact');
  const [formData, setFormData] = useState<ContactMessageInput>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  // Anti-spam: a field humans never see, and the time the form was displayed.
  const [honeypot, setHoneypot] = useState('');
  const shownAt = useRef(0);

  useEffect(() => {
    shownAt.current = Date.now();
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors = validate(formData);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Bot detected: pretend it worked so it doesn't retry, but store nothing.
    if (honeypot || Date.now() - shownAt.current < MIN_FILL_TIME_MS) {
      setFormData(emptyForm);
      setStatus('sent');
      return;
    }

    setStatus('sending');
    const { error: insertError } = await supabase.from('contacts').insert({
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    });

    if (insertError) {
      console.error('Contact form submit error:', insertError);
      // P0001: rate limit raised by the database trigger, its message is written for visitors.
      setError(
        insertError.code === 'P0001'
          ? insertError.message
          : "Le message n'a pas pu être envoyé. Réessayez, ou écrivez-moi directement par email.",
      );
      setStatus('idle');
      return;
    }

    setFormData(emptyForm);
    setStatus('sent');
  };

  const fields: Array<{ name: 'name' | 'email' | 'subject'; label: string; type?: string; autoComplete: string; className?: string }> = [
    { name: 'name', label: 'Nom', autoComplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { name: 'subject', label: 'Sujet', autoComplete: 'off', className: 'sm:col-span-2' },
  ];

  return (
    <SiteLayout>
      <div className="container-shell py-12 sm:py-16">
        <PageIntro title="Contact">
          Je cherche une alternance de 12 mois en administration systèmes et réseaux pour préparer le Titre Pro AIS. Si votre entreprise
          recrute, écrivez-moi.
        </PageIntro>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <dl className="space-y-6 text-sm">
              <div>
                <dt className="font-mono text-xs text-muted-foreground">Email</dt>
                <dd className="mt-1">
                  <a href={`mailto:${profile.email}`} className="underline-offset-4 hover:underline">
                    {profile.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-muted-foreground">Téléphone</dt>
                <dd className="mt-1">
                  <a href={`tel:${profile.phoneHref}`} className="underline-offset-4 hover:underline">
                    {profile.phoneLabel}
                  </a>
                </dd>
              </div>
              <SocialDetailLinks />
              {aboutMe?.location && (
                <div>
                  <dt className="font-mono text-xs text-muted-foreground">Localisation</dt>
                  <dd className="mt-1">{aboutMe.location}</dd>
                </div>
              )}
            </dl>
            <CvButton cvPath={aboutMe?.cv_path} className="mt-8" />
          </div>

          <div className="surface p-6 sm:p-8">
            {status === 'sent' ? (
              <div>
                <h2 className="font-medium">Message envoyé</h2>
                <p className="mt-2 text-sm text-muted-foreground">Merci, je vous réponds dans les meilleurs délais.</p>
                <Button variant="outline" size="sm" className="mt-6" onClick={() => setStatus('idle')}>
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <form className="relative grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
                {error && (
                  <Alert variant="destructive" className="sm:col-span-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Honeypot: off-screen and skipped by keyboard and screen readers; only bots fill it. */}
                <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
                  <label htmlFor="contact-website">Site web</label>
                  <input
                    id="contact-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {fields.map((field) => (
                  <div key={field.name} className={`grid gap-2 ${field.className ?? ''}`}>
                    <Label htmlFor={`contact-${field.name}`}>{field.label}</Label>
                    <Input
                      id={`contact-${field.name}`}
                      name={field.name}
                      type={field.type ?? 'text'}
                      autoComplete={field.autoComplete}
                      maxLength={limits[field.name]}
                      value={formData[field.name]}
                      onChange={handleChange}
                      aria-invalid={Boolean(fieldErrors[field.name])}
                    />
                    {fieldErrors[field.name] && <p className="text-xs text-destructive">{fieldErrors[field.name]}</p>}
                  </div>
                ))}

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    maxLength={limits.message}
                    value={formData.message}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.message)}
                  />
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-destructive">{fieldErrors.message}</span>
                    <span className="font-mono text-muted-foreground">
                      {formData.message.length} / {limits.message}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Button type="submit" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Envoi…' : 'Envoyer'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

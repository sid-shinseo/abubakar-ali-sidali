import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { defaultCta } from '@/lib/cta';
import { errorMessage } from '@/lib/errors';
import { profile } from '@/lib/profile';
import { cn } from '@/lib/utils';
import type { AboutMe, AboutMeInput } from '@/types';
import { useAdminData } from './admin-data';
import { CvCard } from './CvCard';
import { AdminPageHeader, Field } from './shared';

const EMPLOYED = 'Déjà en poste';
const availabilityOptions = ['Disponible', 'En recherche active (CDI / alternance)', EMPLOYED];

type FormValues = {
  title: string;
  bio: string;
  location: string;
  availability_status: string;
  cta_enabled: boolean;
  cta_title: string;
  cta_text: string;
};
type FormErrors = Partial<Record<keyof FormValues, string>>;

function toFormValues(about: AboutMe | null): FormValues {
  return {
    title: about?.title ?? '',
    bio: about?.bio ?? '',
    location: about?.location ?? '',
    availability_status: about?.availability_status ?? 'Disponible',
    cta_enabled: about?.cta_enabled ?? true,
    cta_title: about?.cta_title ?? '',
    cta_text: about?.cta_text ?? '',
  };
}

function formKey(about: AboutMe | null) {
  return about ? JSON.stringify(toFormValues(about)) : 'new';
}

export function AboutPage() {
  const { about } = useAdminData();

  return (
    <>
      <AdminPageHeader
        title="Présentation"
        description="Ton CV, ton titre, ta bio, ta disponibilité et l'encadré de recherche affichés sur l'accueil."
      />
      {about.loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid gap-6">
          <CvCard />
          {/* Keyed on the saved text fields so the form picks up fresh values after a save,
              but not when only the CV changes (that would wipe unsaved edits). */}
          <AboutForm key={formKey(about.aboutMe)} initial={about.aboutMe} onSave={about.upsertAboutMe} />
        </div>
      )}
    </>
  );
}

interface AboutFormProps {
  initial: AboutMe | null;
  onSave: (payload: AboutMeInput) => Promise<AboutMe>;
}

function AboutForm({ initial, onSave }: AboutFormProps) {
  const [saved] = useState(() => toFormValues(initial));
  const [form, setForm] = useState(saved);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = !initial || (Object.keys(form) as Array<keyof FormValues>).some((key) => form[key] !== saved[key]);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Switching availability also suggests the matching state for the search block.
  const changeAvailability = (value: string) => {
    setForm((prev) => ({ ...prev, availability_status: value, cta_enabled: value !== EMPLOYED }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors: FormErrors = {};
    if (!form.title.trim()) validationErrors.title = 'Le titre est obligatoire.';
    if (!form.bio.trim()) validationErrors.bio = 'La bio est obligatoire.';
    if (!form.location.trim()) validationErrors.location = 'La localisation est obligatoire.';
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        availability_status: form.availability_status,
        cta_enabled: form.cta_enabled,
        cta_title: form.cta_title.trim() || null,
        cta_text: form.cta_text.trim() || null,
      });
      toast.success('Présentation enregistrée.');
    } catch (err) {
      const message = errorMessage(err);
      toast.error(
        message.includes('cta_')
          ? "Les colonnes de l'encadré n'existent pas encore : relance supabase/portfolio-schema.sql dans Supabase."
          : `Enregistrement impossible : ${message}`,
      );
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <div className="grid gap-6">
        <section className="surface grid gap-6 p-6">
          <h2 className="font-medium">Profil</h2>
          <Field label="Titre" htmlFor="about-title" error={errors.title} hint="Ton diplôme ou ton intitulé, sous ton nom.">
            <Input id="about-title" value={form.title} onChange={(e) => update('title', e.target.value)} aria-invalid={Boolean(errors.title)} />
          </Field>
          <Field label="Bio" htmlFor="about-bio" error={errors.bio} hint={`${form.bio.length} caractères`}>
            <Textarea id="about-bio" rows={7} value={form.bio} onChange={(e) => update('bio', e.target.value)} aria-invalid={Boolean(errors.bio)} />
          </Field>
          <Field label="Localisation" htmlFor="about-location" error={errors.location}>
            <Input id="about-location" value={form.location} onChange={(e) => update('location', e.target.value)} aria-invalid={Boolean(errors.location)} />
          </Field>
          <div className="grid gap-2">
            <Label>Disponibilité</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={form.availability_status}
              onValueChange={(value) => value && changeAvailability(value)}
              className="flex-wrap"
            >
              {availabilityOptions.map((option) => (
                <ToggleGroupItem key={option} value={option}>
                  {option}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </section>

        <section className="surface grid gap-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-medium">Encadré de recherche</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Le bloc « Prendre contact » en bas de l'accueil. Désactive-le quand tu n'es plus en recherche.
              </p>
            </div>
            <Switch checked={form.cta_enabled} onCheckedChange={(checked) => update('cta_enabled', checked)} aria-label="Afficher l'encadré de recherche" />
          </div>
          <div className={cn('grid gap-6 transition-opacity', !form.cta_enabled && 'pointer-events-none opacity-50')}>
            <Field label="Titre de l'encadré" htmlFor="cta-title" hint="Laisse vide pour le texte par défaut.">
              <Input
                id="cta-title"
                value={form.cta_title}
                onChange={(e) => update('cta_title', e.target.value)}
                placeholder={defaultCta.title}
                disabled={!form.cta_enabled}
              />
            </Field>
            <Field label="Texte" htmlFor="cta-text">
              <Textarea
                id="cta-text"
                rows={3}
                value={form.cta_text}
                onChange={(e) => update('cta_text', e.target.value)}
                placeholder={defaultCta.text}
                disabled={!form.cta_enabled}
              />
            </Field>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving || !isDirty}>
            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
          {isDirty && initial && <span className="text-xs text-muted-foreground">Modifications non enregistrées</span>}
        </div>
      </div>

      <aside className="grid gap-4 self-start">
        <p className="font-mono text-xs text-muted-foreground">Aperçu de l'accueil</p>
        <div className="surface p-5">
          <p className="text-lg font-semibold tracking-tight">{profile.name}</p>
          <p className="mt-1 text-sm text-foreground/80">{form.title || 'Titre'}</p>
          <p className="mt-3 line-clamp-4 text-xs leading-5 text-muted-foreground">{form.bio || 'Bio'}</p>
          <div className="mt-4 grid gap-2">
            {[
              { label: 'Poste', value: form.availability_status },
              { label: 'Localisation', value: form.location || '…' },
            ].map((row) => (
              <div key={row.label} className="rounded-md bg-background/60 px-3 py-2">
                <p className="font-mono text-[11px] text-muted-foreground">{row.label}</p>
                <p className="text-sm font-medium">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {form.cta_enabled ? (
          <div className="surface p-5">
            <p className="font-medium">{form.cta_title || defaultCta.title}</p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{form.cta_text || defaultCta.text}</p>
            <span className="mt-3 inline-flex rounded-md border px-3 py-1.5 text-xs">Prendre contact</span>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-5 text-center text-xs text-muted-foreground">Encadré de recherche masqué</div>
        )}
      </aside>
    </form>
  );
}

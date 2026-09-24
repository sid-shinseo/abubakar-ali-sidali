import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { errorMessage } from '@/lib/errors';
import type { Experience, ExperienceInput, ExperienceType } from '@/types';
import { useAdminData } from './admin-data';
import { Field } from './shared';

type Values = {
  title: string;
  company: string;
  period: string;
  description: string;
  location: string;
  type: ExperienceType;
};
type FormErrors = Partial<Record<keyof Values, string>>;

interface ExperienceFormProps {
  formId: string;
  item: Experience | null;
  defaultType: ExperienceType;
  onSavingChange: (saving: boolean) => void;
  onSaved: () => void;
}

export function ExperienceForm({ formId, item, defaultType, onSavingChange, onSaved }: ExperienceFormProps) {
  const { experiences } = useAdminData();
  const [form, setForm] = useState<Values>({
    title: item?.title ?? '',
    company: item?.company ?? '',
    period: item?.period ?? '',
    description: item?.description ?? '',
    location: item?.location ?? '',
    type: item?.type ?? defaultType,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors: FormErrors = {};
    if (!form.title.trim()) validationErrors.title = 'Le titre est obligatoire.';
    if (!form.period.trim()) validationErrors.period = 'La période est obligatoire.';
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: ExperienceInput = {
      title: form.title.trim(),
      company: form.company.trim() || null,
      period: form.period.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      type: form.type,
    };

    onSavingChange(true);
    try {
      if (item) {
        await experiences.updateExperience(item.id, payload);
        toast.success('Parcours mis à jour.');
      } else {
        await experiences.createExperience(payload);
        toast.success('Élément ajouté au parcours.');
      }
      onSaved();
    } catch (err) {
      toast.error(`Enregistrement impossible : ${errorMessage(err)}`);
    } finally {
      onSavingChange(false);
    }
  };

  const isEducation = form.type === 'education';

  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-6" noValidate>
      <div className="grid gap-2">
        <Label>Type</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          value={form.type}
          onValueChange={(value) => value && update('type', value as ExperienceType)}
          className="w-full"
        >
          <ToggleGroupItem value="experience" className="flex-1">
            Expérience
          </ToggleGroupItem>
          <ToggleGroupItem value="education" className="flex-1">
            Formation
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Field label={isEducation ? 'Diplôme ou formation' : 'Poste'} htmlFor="experience-title" error={errors.title}>
        <Input id="experience-title" value={form.title} onChange={(e) => update('title', e.target.value)} aria-invalid={Boolean(errors.title)} />
      </Field>
      <Field label={isEducation ? 'Établissement' : 'Entreprise'} htmlFor="experience-company">
        <Input id="experience-company" value={form.company} onChange={(e) => update('company', e.target.value)} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Période" htmlFor="experience-period" error={errors.period}>
          <Input
            id="experience-period"
            value={form.period}
            onChange={(e) => update('period', e.target.value)}
            placeholder="2024 - 2025"
            aria-invalid={Boolean(errors.period)}
          />
        </Field>
        <Field label="Lieu" htmlFor="experience-location">
          <Input id="experience-location" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Colmar" />
        </Field>
      </div>
      <Field label="Description" htmlFor="experience-description" hint="Missions, compétences mobilisées, résultats.">
        <Textarea id="experience-description" rows={6} value={form.description} onChange={(e) => update('description', e.target.value)} />
      </Field>
    </form>
  );
}

import { useState } from 'react';
import { toast } from 'sonner';
import { TechIcon } from '@/components/TechIcon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { certificationStatuses } from '@/lib/certifications';
import { errorMessage } from '@/lib/errors';
import type { Certification, CertificationInput, CertificationStatus } from '@/types';
import { useAdminData } from './admin-data';
import { Field } from './shared';

type Values = { name: string; issuer: string; status: CertificationStatus; date_label: string; credential_url: string };
type FormErrors = Partial<Record<keyof Values, string>>;

const dateHints: Record<CertificationStatus, string> = {
  obtenue: 'Ex. Juin 2027',
  en_cours: 'Ex. Passage prévu en mars 2027',
  prevue: 'Ex. Pendant le Titre Pro AIS',
};

interface CertificationFormProps {
  formId: string;
  item: Certification | null;
  onSavingChange: (saving: boolean) => void;
  onSaved: () => void;
}

export function CertificationForm({ formId, item, onSavingChange, onSaved }: CertificationFormProps) {
  const { certifications } = useAdminData();
  const [form, setForm] = useState<Values>({
    name: item?.name ?? '',
    issuer: item?.issuer ?? '',
    status: item?.status ?? 'prevue',
    date_label: item?.date_label ?? '',
    credential_url: item?.credential_url ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors: FormErrors = {};
    if (!form.name.trim()) validationErrors.name = 'Le nom est obligatoire.';
    if (form.credential_url && !/^https?:\/\//.test(form.credential_url)) {
      validationErrors.credential_url = "L'URL doit commencer par http:// ou https://";
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: CertificationInput = {
      name: form.name.trim(),
      issuer: form.issuer.trim() || null,
      status: form.status,
      date_label: form.date_label.trim() || null,
      credential_url: form.status === 'obtenue' ? form.credential_url.trim() || null : null,
    };

    onSavingChange(true);
    try {
      if (item) {
        await certifications.updateCertification(item.id, payload);
        toast.success('Certification mise à jour.');
      } else {
        await certifications.createCertification(payload);
        toast.success('Certification ajoutée.');
      }
      onSaved();
    } catch (err) {
      toast.error(`Enregistrement impossible : ${errorMessage(err)}`);
    } finally {
      onSavingChange(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-6" noValidate>
      <div className="grid gap-2">
        <Label>Statut</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          value={form.status}
          onValueChange={(value) => value && update('status', value as CertificationStatus)}
          className="w-full"
        >
          {certificationStatuses.map((status) => (
            <ToggleGroupItem key={status.value} value={status.value} className="flex-1">
              {status.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <Field label="Certification" htmlFor="cert-name" error={errors.name}>
        <div className="relative">
          <span className="absolute top-1/2 left-3 -translate-y-1/2">
            <TechIcon name={`${form.name} ${form.issuer}`.trim() || 'certification'} className="size-4" />
          </span>
          <Input
            id="cert-name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="CCNA : Introduction to Networks"
            className="pl-9"
            aria-invalid={Boolean(errors.name)}
          />
        </div>
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Organisme" htmlFor="cert-issuer">
          <Input id="cert-issuer" value={form.issuer} onChange={(e) => update('issuer', e.target.value)} placeholder="Cisco Networking Academy" />
        </Field>
        <Field label="Date" htmlFor="cert-date">
          <Input id="cert-date" value={form.date_label} onChange={(e) => update('date_label', e.target.value)} placeholder={dateHints[form.status]} />
        </Field>
      </div>
      {form.status === 'obtenue' && (
        <Field label="Lien de vérification" htmlFor="cert-url" error={errors.credential_url} hint="Credly, badge Cisco, attestation en ligne…">
          <Input
            id="cert-url"
            type="url"
            value={form.credential_url}
            onChange={(e) => update('credential_url', e.target.value)}
            placeholder="https://www.credly.com/badges/…"
            aria-invalid={Boolean(errors.credential_url)}
          />
        </Field>
      )}
    </form>
  );
}

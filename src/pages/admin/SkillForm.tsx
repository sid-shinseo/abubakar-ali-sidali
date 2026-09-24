import { useState } from 'react';
import { toast } from 'sonner';
import { SkillLevel } from '@/components/SkillLevel';
import { TechIcon } from '@/components/TechIcon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { errorMessage } from '@/lib/errors';
import { skillLevels } from '@/lib/skill-levels';
import { cn } from '@/lib/utils';
import type { Skill, SkillInput, SkillLevel as Level } from '@/types';
import { useAdminData } from './admin-data';
import { CategoryOptions, Field } from './shared';

type FormErrors = Partial<Record<'name' | 'category', string>>;

interface SkillFormProps {
  formId: string;
  skill: Skill | null;
  defaultCategory?: string;
  onSavingChange: (saving: boolean) => void;
  onSaved: () => void;
}

export function SkillForm({ formId, skill, defaultCategory, onSavingChange, onSaved }: SkillFormProps) {
  const { skills } = useAdminData();
  const [name, setName] = useState(skill?.name ?? '');
  const [category, setCategory] = useState(skill?.category ?? defaultCategory ?? '');
  const [description, setDescription] = useState(skill?.description ?? '');
  const [level, setLevel] = useState<Level>(skill?.level ?? 'autonome');
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors: FormErrors = {};
    if (!name.trim()) validationErrors.name = 'Le nom est obligatoire.';
    if (!category.trim()) validationErrors.category = 'La catégorie est obligatoire.';
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: SkillInput = {
      name: name.trim(),
      category: category.trim(),
      description: description.trim() || null,
      level,
    };

    onSavingChange(true);
    try {
      if (skill) {
        await skills.updateSkill(skill.id, payload);
        toast.success('Compétence mise à jour.');
      } else {
        await skills.createSkill(payload);
        toast.success('Compétence ajoutée.');
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
      <Field label="Nom" htmlFor="skill-name" error={errors.name} hint="Le logo de la technologie est détecté à partir du nom.">
        <div className="relative">
          <span className="absolute top-1/2 left-3 -translate-y-1/2">
            <TechIcon name={name || '?'} className="size-4" />
          </span>
          <Input
            id="skill-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            className="pl-9"
            aria-invalid={Boolean(errors.name)}
          />
        </div>
      </Field>
      <Field label="Catégorie" htmlFor="skill-category" error={errors.category}>
        <Input
          id="skill-category"
          list="skill-categories"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setErrors((prev) => ({ ...prev, category: undefined }));
          }}
          aria-invalid={Boolean(errors.category)}
        />
        <CategoryOptions id="skill-categories" values={skills.skills.map((s) => s.category)} />
      </Field>
      <Field label="Description" htmlFor="skill-description">
        <Textarea id="skill-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="grid gap-2">
        <Label>Niveau</Label>
        <div role="radiogroup" aria-label="Niveau" className="grid gap-2">
          {skillLevels.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={level === option.value}
              onClick={() => setLevel(option.value)}
              className={cn(
                'flex items-center justify-between gap-4 rounded-md border px-4 py-3 text-left transition-colors',
                level === option.value ? 'border-primary/60 bg-primary/10' : 'hover:bg-accent/60',
              )}
            >
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              </span>
              <SkillLevel level={option.value} className="[&>span:last-child]:hidden" />
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

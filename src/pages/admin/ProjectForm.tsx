import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { btsCompetencies } from '@/lib/bts';
import { errorMessage } from '@/lib/errors';
import { compressImage, IMAGE_BUCKET, removeFilesByUrl, uploadFile } from '@/lib/storage';
import type { Project, ProjectImage, ProjectInput } from '@/types';
import { useAdminData } from './admin-data';
import { CategoryOptions, Field } from './shared';

// Select items cannot have an empty value: this stands for no linked experience.
const NO_EXPERIENCE = 'none';

const MAX_INPUT_SIZE = 20 * 1024 * 1024; // before compression
const MAX_STORED_SIZE = 5 * 1024 * 1024; // bucket limit, after compression

type ProjectFormValues = {
  title: string;
  slug: string;
  description: string;
  long_description: string;
  category: string;
  cover_image_url: string;
  link_url: string;
  tech_stack: string;
  featured: boolean;
  published: boolean;
  context: string;
  period: string;
  competencies: string[];
  experience_id: string;
};
type FormErrors = Partial<Record<keyof ProjectFormValues | 'cover' | 'gallery', string>>;

/** A gallery entry: already stored (url) or picked locally and not uploaded yet (file). */
interface GalleryItem {
  key: string;
  url: string | null;
  file: File | null;
  preview: string;
  caption: string;
}

let localKey = 0;
const nextKey = () => `local-${++localKey}`;

function toFormValues(project: Project | null): ProjectFormValues {
  return {
    title: project?.title ?? '',
    slug: project?.slug ?? '',
    description: project?.description ?? '',
    long_description: project?.long_description ?? '',
    category: project?.category ?? '',
    cover_image_url: project?.cover_image_url ?? '',
    link_url: project?.link_url ?? '',
    tech_stack: project?.tech_stack.join(', ') ?? '',
    featured: project?.featured ?? false,
    published: project?.published ?? true,
    context: project?.context ?? '',
    period: project?.period ?? '',
    competencies: project?.competencies ?? [],
    experience_id: project?.experience_id ?? NO_EXPERIENCE,
  };
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function validate(form: ProjectFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = 'Le titre est obligatoire.';
  if (!form.description.trim()) errors.description = 'La description courte est obligatoire.';
  if (!form.category.trim()) errors.category = 'La catégorie est obligatoire.';
  if (form.link_url && !/^https?:\/\//.test(form.link_url)) errors.link_url = "L'URL doit commencer par http:// ou https://";
  return errors;
}

/** Checks the type, compresses, then checks the final size. Returns an error message or the file to upload. */
async function prepareImage(file: File): Promise<{ file: File } | { error: string }> {
  if (!file.type.startsWith('image/')) return { error: `« ${file.name} » n'est pas une image.` };
  if (file.size > MAX_INPUT_SIZE) return { error: `« ${file.name} » dépasse 20 Mo.` };
  const compressed = await compressImage(file);
  if (compressed.size > MAX_STORED_SIZE) return { error: `« ${file.name} » reste trop lourde après compression (5 Mo max).` };
  return { file: compressed };
}

function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5">
      <legend className="mb-4">
        <span className="font-mono text-xs text-muted-foreground">{title}</span>
        {description && <span className="mt-1 block text-xs text-muted-foreground/80">{description}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

interface ProjectFormProps {
  formId: string;
  project: Project | null;
  onSavingChange: (saving: boolean) => void;
  onSaved: () => void;
}

export function ProjectForm({ formId, project, onSavingChange, onSaved }: ProjectFormProps) {
  const { projects, experiences } = useAdminData();
  const [form, setForm] = useState(() => toFormValues(project));
  const [errors, setErrors] = useState<FormErrors>({});
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(project?.cover_image_url ?? null);
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    (project?.gallery ?? []).map((image) => ({ key: nextKey(), url: image.url, file: null, preview: image.url, caption: image.caption })),
  );
  const [isPreparing, setIsPreparing] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Local previews (blob: URLs) are freed once replaced or when the form closes.
  useEffect(() => {
    if (!coverPreview?.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  const galleryBlobs = useRef<string[]>([]);
  useEffect(() => {
    galleryBlobs.current = gallery.filter((item) => item.file).map((item) => item.preview);
  }, [gallery]);
  useEffect(() => () => galleryBlobs.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const update = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const clearCoverInput = () => {
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleCoverSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    setErrors((prev) => ({ ...prev, cover: undefined }));
    if (!picked) return;

    setIsPreparing(true);
    const result = await prepareImage(picked);
    setIsPreparing(false);
    if ('error' in result) {
      setErrors((prev) => ({ ...prev, cover: result.error }));
      clearCoverInput();
      return;
    }

    setCoverFile(result.file);
    setCoverPreview(URL.createObjectURL(result.file));
    setForm((prev) => ({ ...prev, cover_image_url: '' }));
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setForm((prev) => ({ ...prev, cover_image_url: '' }));
    clearCoverInput();
  };

  const handleGallerySelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (picked.length === 0) return;

    setIsPreparing(true);
    const results = await Promise.all(picked.map(prepareImage));
    setIsPreparing(false);

    const rejected = results.flatMap((result) => ('error' in result ? [result.error] : []));
    setErrors((prev) => ({ ...prev, gallery: rejected.length > 0 ? rejected.join(' ') : undefined }));

    const added = results.flatMap((result) =>
      'file' in result
        ? [{ key: nextKey(), url: null, file: result.file, preview: URL.createObjectURL(result.file), caption: '' }]
        : [],
    );
    setGallery((prev) => [...prev, ...added]);
  };

  const updateGalleryItem = (key: string, caption: string) =>
    setGallery((prev) => prev.map((item) => (item.key === key ? { ...item, caption } : item)));

  const moveGalleryItem = (index: number, direction: -1 | 1) =>
    setGallery((prev) => {
      const next = [...prev];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });

  /** Swaps the image of one entry (e.g. your own diagram instead of the generated one), keeping caption and position. */
  const replaceGalleryItem = async (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = '';
    if (!picked) return;

    setIsPreparing(true);
    const result = await prepareImage(picked);
    setIsPreparing(false);
    if ('error' in result) {
      setErrors((prev) => ({ ...prev, gallery: result.error }));
      return;
    }

    setErrors((prev) => ({ ...prev, gallery: undefined }));
    setGallery((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        if (item.file) URL.revokeObjectURL(item.preview);
        return { ...item, url: null, file: result.file, preview: URL.createObjectURL(result.file) };
      }),
    );
  };

  const removeGalleryItem = (key: string) =>
    setGallery((prev) => {
      const item = prev.find((entry) => entry.key === key);
      if (item?.file) URL.revokeObjectURL(item.preview);
      return prev.filter((entry) => entry.key !== key);
    });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Certains champs sont à corriger.');
      return;
    }

    onSavingChange(true);
    const uploadedUrls: string[] = [];
    try {
      // 1. Upload new files first: if one fails, nothing is written to the database.
      let coverUrl = form.cover_image_url.trim() || null;
      if (coverFile) {
        coverUrl = (await uploadFile(IMAGE_BUCKET, 'project-covers', coverFile)).url;
        uploadedUrls.push(coverUrl);
      }

      const finalGallery: ProjectImage[] = [];
      for (const item of gallery) {
        let url = item.url;
        if (item.file) {
          url = (await uploadFile(IMAGE_BUCKET, 'project-gallery', item.file)).url;
          uploadedUrls.push(url);
        }
        if (url) finalGallery.push({ url, caption: item.caption.trim() });
      }

      // 2. Save the project.
      const payload: ProjectInput = {
        title: form.title.trim(),
        slug: slugify(form.slug || form.title),
        description: form.description.trim(),
        long_description: form.long_description.trim() || null,
        category: form.category.trim(),
        cover_image_url: coverUrl,
        gallery: finalGallery,
        link_url: form.link_url.trim() || null,
        tech_stack: form.tech_stack.split(',').map((item) => item.trim()).filter(Boolean),
        featured: form.featured,
        published: form.published,
        context: form.context.trim() || null,
        period: form.period.trim() || null,
        // Keep the official order whatever the click order.
        competencies: btsCompetencies.filter((item) => form.competencies.includes(item)),
        experience_id: form.experience_id === NO_EXPERIENCE ? null : form.experience_id,
      };

      if (project) {
        await projects.updateProject(project.id, payload);
        toast.success(form.published ? 'Projet mis à jour.' : 'Brouillon enregistré.');
      } else {
        await projects.createProject(payload);
        toast.success(form.published ? 'Projet publié.' : 'Brouillon créé.');
      }

      // 3. Only now delete the files the project no longer uses.
      if (project) {
        const kept = new Set([coverUrl, ...finalGallery.map((image) => image.url)]);
        const previous = [project.cover_image_url, ...(project.gallery ?? []).map((image) => image.url)];
        void removeFilesByUrl(previous.filter((url) => url && !kept.has(url)));
      }
      onSaved();
    } catch (err) {
      // Roll back the uploads of this attempt so they don't pile up in storage.
      void removeFilesByUrl(uploadedUrls);
      toast.error(`Enregistrement impossible : ${errorMessage(err)}`);
    } finally {
      onSavingChange(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-10" noValidate>
      <FormSection title="Publication">
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4 rounded-md border p-4">
            <div>
              <Label htmlFor="project-published">Publié</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Désactivé, le projet reste un brouillon : invisible pour les visiteurs, visible pour toi.
              </p>
            </div>
            <Switch id="project-published" checked={form.published} onCheckedChange={(checked) => update('published', checked)} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md border p-4">
            <div>
              <Label htmlFor="project-featured">Mettre en avant</Label>
              <p className="mt-1 text-xs text-muted-foreground">Le projet apparaît dans « Projets en vedette » sur l'accueil.</p>
            </div>
            <Switch id="project-featured" checked={form.featured} onCheckedChange={(checked) => update('featured', checked)} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Informations">
        <Field label="Titre" htmlFor="project-title" error={errors.title}>
          <Input id="project-title" value={form.title} onChange={(e) => update('title', e.target.value)} aria-invalid={Boolean(errors.title)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Catégorie" htmlFor="project-category" error={errors.category}>
            <Input
              id="project-category"
              list="project-categories"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              aria-invalid={Boolean(errors.category)}
            />
            <CategoryOptions id="project-categories" values={projects.projects.map((p) => p.category ?? '')} />
          </Field>
          <Field label="Slug" htmlFor="project-slug" hint={`/projets/${slugify(form.slug || form.title) || '…'}`}>
            <Input id="project-slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="Généré depuis le titre" />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Cadre" htmlFor="project-context" hint="Ex. Stage · Weishaupt, BTS SIO · AP n°1">
            <Input id="project-context" list="project-contexts" value={form.context} onChange={(e) => update('context', e.target.value)} />
            <CategoryOptions id="project-contexts" values={projects.projects.map((p) => p.context ?? '')} />
          </Field>
          <Field label="Période" htmlFor="project-period" hint="Ex. Mars 2026, Sept. – déc. 2025">
            <Input id="project-period" value={form.period} onChange={(e) => update('period', e.target.value)} />
          </Field>
        </div>
        <Field label="Expérience ou formation" htmlFor="project-experience" hint="Le projet apparaît quand on clique sur cette carte, page Parcours.">
          <Select value={form.experience_id} onValueChange={(value) => update('experience_id', value)}>
            <SelectTrigger id="project-experience" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_EXPERIENCE}>Aucune</SelectItem>
              {(['experience', 'education'] as const).map((type) => (
                <SelectGroup key={type}>
                  <SelectLabel>{type === 'experience' ? 'Expériences' : 'Formations'}</SelectLabel>
                  {experiences.experiences
                    .filter((item) => item.type === type)
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                        {item.company ? ` · ${item.company}` : ''}
                      </SelectItem>
                    ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Technologies" htmlFor="project-tech" hint="Séparées par des virgules. Le logo s'affiche automatiquement.">
          <Input id="project-tech" value={form.tech_stack} onChange={(e) => update('tech_stack', e.target.value)} placeholder="Proxmox, pfSense, Docker" />
        </Field>
      </FormSection>

      <FormSection title="Contenu">
        <Field label="Description courte" htmlFor="project-description" error={errors.description} hint="Affichée sur les cartes de projet.">
          <Textarea
            id="project-description"
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            aria-invalid={Boolean(errors.description)}
          />
        </Field>
        <Field label="Description détaillée" htmlFor="project-long-description" hint="Affichée sur la page du projet.">
          <Textarea id="project-long-description" rows={7} value={form.long_description} onChange={(e) => update('long_description', e.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Compétences BTS SIO" description="Blocs du tableau de synthèse E6, affichés sur la page du projet.">
        <div className="grid gap-2">
          {btsCompetencies.map((competency, index) => (
            <label key={competency} htmlFor={`competency-${index}`} className="flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm hover:bg-accent/40">
              <Checkbox
                id={`competency-${index}`}
                checked={form.competencies.includes(competency)}
                onCheckedChange={(checked) =>
                  update('competencies', checked ? [...form.competencies, competency] : form.competencies.filter((item) => item !== competency))
                }
                className="mt-0.5"
              />
              {competency}
            </label>
          ))}
        </div>
      </FormSection>

      <FormSection title="Image de couverture" description="Les photos sont redimensionnées et converties en WebP automatiquement.">
        <Field label="Couverture" htmlFor="project-cover" error={errors.cover}>
          {coverPreview ? (
            <div className="relative">
              <img src={coverPreview} alt="Aperçu de la couverture" className="aspect-[16/9] w-full rounded-md border object-cover" />
              <Button type="button" size="icon-sm" variant="secondary" className="absolute top-2 right-2" onClick={removeCover} aria-label="Retirer la couverture">
                <X />
              </Button>
            </div>
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              Aucune image
            </div>
          )}
          <Input id="project-cover" ref={coverInputRef} type="file" accept="image/*" onChange={(e) => void handleCoverSelection(e)} />
          <Input
            aria-label="URL de l'image de couverture"
            value={form.cover_image_url}
            onChange={(e) => {
              update('cover_image_url', e.target.value);
              setCoverFile(null);
              setCoverPreview(e.target.value || null);
              clearCoverInput();
            }}
            placeholder="ou URL d'une image"
          />
        </Field>
      </FormSection>

      <FormSection
        title="Schémas et illustrations"
        description="Topologie réseau, plan d'adressage, captures. Formats image et SVG (export draw.io) acceptés."
      >
        {gallery.length > 0 && (
          <ul className="grid gap-3">
            {gallery.map((item, index) => (
              <li key={item.key} className="flex gap-3 rounded-md border p-2">
                <img src={item.preview} alt="" className="h-20 w-28 shrink-0 rounded bg-white object-contain" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Input
                    value={item.caption}
                    onChange={(e) => updateGalleryItem(item.key, e.target.value)}
                    placeholder="Légende, ex. Topologie du lab pfSense"
                    aria-label={`Légende de l'image ${index + 1}`}
                    className="h-8"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer text-xs text-primary underline-offset-4 hover:underline">
                      Remplacer
                      <input type="file" accept="image/*" className="sr-only" onChange={(e) => void replaceGalleryItem(item.key, e)} />
                    </label>
                    {item.file && <span className="font-mono text-[11px] text-muted-foreground">Nouvelle image, envoyée à l'enregistrement</span>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col justify-between">
                  <div className="flex">
                    <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => moveGalleryItem(index, -1)} aria-label="Monter">
                      <ChevronUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === gallery.length - 1}
                      onClick={() => moveGalleryItem(index, 1)}
                      aria-label="Descendre"
                    >
                      <ChevronDown />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeGalleryItem(item.key)}
                  >
                    Retirer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            id="project-gallery"
            onChange={(e) => void handleGallerySelection(e)}
          />
          <Button type="button" variant="outline" disabled={isPreparing} onClick={() => galleryInputRef.current?.click()}>
            <ImagePlus />
            {isPreparing ? 'Préparation des images…' : 'Ajouter des images'}
          </Button>
          {errors.gallery && <p className="mt-2 text-xs text-destructive">{errors.gallery}</p>}
        </div>
      </FormSection>

      <FormSection title="Lien">
        <Field label="Lien externe" htmlFor="project-link" error={errors.link_url} hint="Dépôt GitHub, démo, documentation…">
          <Input
            id="project-link"
            type="url"
            value={form.link_url}
            onChange={(e) => update('link_url', e.target.value)}
            placeholder="https://github.com/…"
            aria-invalid={Boolean(errors.link_url)}
          />
        </Field>
      </FormSection>
    </form>
  );
}

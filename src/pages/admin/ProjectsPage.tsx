import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ExternalLink, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { TechIcon } from '@/components/TechIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { errorMessage } from '@/lib/errors';
import { removeFilesByUrl } from '@/lib/storage';
import type { Project } from '@/types';
import { useAdminData } from './admin-data';
import { ProjectForm } from './ProjectForm';
import { AdminPageHeader, ConfirmDeleteDialog, EmptyState, FormDialog, RowActions } from './shared';
import { SortableTableBody } from './sortable';

const FORM_ID = 'project-form';

export function ProjectsPage() {
  const { projects: data } = useAdminData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  // "?nouveau=1" (from the dashboard) opens the creation panel directly.
  const [sheetOpen, setSheetOpen] = useState(searchParams.get('nouveau') === '1');
  const [editing, setEditing] = useState<Project | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.projects;
    return data.projects.filter((p) =>
      [p.title, p.category ?? '', ...p.tech_stack].some((value) => value.toLowerCase().includes(q)),
    );
  }, [data.projects, query]);

  const draftCount = data.projects.filter((p) => !p.published).length;

  const openForm = (project: Project | null) => {
    setEditing(project);
    setFormKey((key) => key + 1);
    setSheetOpen(true);
  };

  const handleSheetChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open && searchParams.has('nouveau')) setSearchParams({}, { replace: true });
  };

  const updateFlag = async (project: Project, patch: Partial<Pick<Project, 'featured' | 'published'>>, message: string) => {
    try {
      await data.updateProject(project.id, patch);
      toast.success(message);
    } catch (err) {
      toast.error(`Modification impossible : ${errorMessage(err)}`);
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    try {
      await data.reorderProjects(orderedIds);
    } catch (err) {
      toast.error(`Nouvel ordre non enregistré : ${errorMessage(err)}`);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const project = pendingDelete;
    setPendingDelete(null);
    try {
      await data.deleteProject(project.id);
      // The project's images are useless now: free the storage.
      void removeFilesByUrl([project.cover_image_url, ...(project.gallery ?? []).map((image) => image.url)]);
      toast.success('Projet supprimé.');
    } catch (err) {
      toast.error(`Suppression impossible : ${errorMessage(err)}`);
    }
  };

  const isFiltering = query.trim() !== '';

  return (
    <>
      <AdminPageHeader
        title="Projets"
        description="Glisse les lignes pour choisir l'ordre d'affichage sur le site."
        actions={
          <Button onClick={() => openForm(null)}>
            <Plus />
            Nouveau projet
          </Button>
        }
      />

      {data.loading ? (
        <Skeleton className="h-64 w-full" />
      ) : data.projects.length === 0 ? (
        <EmptyState
          title="Aucun projet"
          description="Ajoute ta première réalisation. Tu peux la garder en brouillon le temps de la préparer."
          action={<Button onClick={() => openForm(null)}>Ajouter un projet</Button>}
        />
      ) : (
        <div className="surface overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b p-3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher" className="h-8 pl-8" aria-label="Rechercher un projet" />
            </div>
            {isFiltering && <span className="text-xs text-muted-foreground">Réordonnancement désactivé pendant la recherche.</span>}
            <p className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
              {data.projects.length} projet{data.projects.length > 1 ? 's' : ''}
              {draftCount > 0 && `, ${draftCount} brouillon${draftCount > 1 ? 's' : ''}`}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8" />
                <TableHead>Projet</TableHead>
                <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                <TableHead className="hidden lg:table-cell">Technologies</TableHead>
                <TableHead className="w-24">Vedette</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <SortableTableBody
              items={filtered}
              disabled={isFiltering}
              onReorder={(ids) => void handleReorder(ids)}
              onRowClick={openForm}
              renderCells={(project) => (
                <>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="aspect-[16/10] w-16 shrink-0 overflow-hidden rounded border bg-muted">
                        {project.cover_image_url && <img src={project.cover_image_url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate font-medium">
                          <span className="truncate">{project.title}</span>
                          {!project.published && (
                            <Badge variant="outline" className="shrink-0 text-muted-foreground">
                              Brouillon
                            </Badge>
                          )}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          /{project.slug}
                          {(project.gallery ?? []).length > 0 &&
                            ` · ${project.gallery.length} schéma${project.gallery.length > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {project.category && <Badge variant="outline">{project.category}</Badge>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      {project.tech_stack.slice(0, 6).map((tech) => (
                        <span key={tech} title={tech}>
                          <TechIcon name={tech} className="size-4" />
                        </span>
                      ))}
                      {project.tech_stack.length > 6 && (
                        <span className="font-mono text-xs text-muted-foreground">+{project.tech_stack.length - 6}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={project.featured}
                      onCheckedChange={(featured) =>
                        void updateFlag(
                          project,
                          { featured },
                          featured ? `« ${project.title} » est mis en avant.` : `« ${project.title} » n'est plus mis en avant.`,
                        )
                      }
                      aria-label={`Mettre en avant ${project.title}`}
                    />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <RowActions onEdit={() => openForm(project)} onDelete={() => setPendingDelete(project)}>
                      <DropdownMenuItem
                        onSelect={() =>
                          void updateFlag(
                            project,
                            { published: !project.published },
                            project.published ? `« ${project.title} » repasse en brouillon.` : `« ${project.title} » est publié.`,
                          )
                        }
                      >
                        {project.published ? <EyeOff /> : <Eye />}
                        {project.published ? 'Repasser en brouillon' : 'Publier'}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/projets/${project.slug}`} target="_blank" rel="noreferrer">
                          <ExternalLink />
                          {project.published ? 'Voir sur le site' : 'Prévisualiser'}
                        </a>
                      </DropdownMenuItem>
                    </RowActions>
                  </TableCell>
                </>
              )}
            />
          </Table>
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucun projet ne correspond à « {query} ».</p>}
        </div>
      )}

      <FormDialog
        open={sheetOpen}
        onOpenChange={handleSheetChange}
        title={editing ? 'Modifier le projet' : 'Nouveau projet'}
        description={editing ? editing.title : 'Publié dès l’enregistrement, ou gardé en brouillon.'}
        formId={FORM_ID}
        submitLabel={editing ? 'Enregistrer' : 'Créer le projet'}
        isSaving={isSaving}
        size="lg"
      >
        <ProjectForm key={formKey} formId={FORM_ID} project={editing} onSavingChange={setIsSaving} onSaved={() => handleSheetChange(false)} />
      </FormDialog>

      <ConfirmDeleteDialog itemLabel={pendingDelete?.title ?? null} onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmDelete()} />
    </>
  );
}

import { useState } from 'react';
import { Briefcase, GraduationCap, type LucideIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableCell } from '@/components/ui/table';
import { errorMessage } from '@/lib/errors';
import type { Experience, ExperienceType } from '@/types';
import { useAdminData } from './admin-data';
import { ExperienceForm } from './ExperienceForm';
import { AdminPageHeader, ConfirmDeleteDialog, FormDialog, RowActions } from './shared';
import { SortableTableBody } from './sortable';

const FORM_ID = 'experience-form';

const sections: Array<{ type: ExperienceType; title: string; icon: LucideIcon; empty: string }> = [
  { type: 'experience', title: 'Expériences professionnelles', icon: Briefcase, empty: 'Aucune expérience renseignée.' },
  { type: 'education', title: 'Formations', icon: GraduationCap, empty: 'Aucune formation renseignée.' },
];

export function ExperiencesPage() {
  const { experiences: data } = useAdminData();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [defaultType, setDefaultType] = useState<ExperienceType>('experience');
  const [formKey, setFormKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Experience | null>(null);

  const openForm = (item: Experience | null, type: ExperienceType = 'experience') => {
    setEditing(item);
    setDefaultType(type);
    setFormKey((key) => key + 1);
    setSheetOpen(true);
  };

  // Each section (experiences / education) has its own order.
  const handleReorder = async (orderedIds: string[]) => {
    try {
      await data.reorderExperiences(orderedIds);
    } catch (err) {
      toast.error(`Nouvel ordre non enregistré : ${errorMessage(err)}`);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const item = pendingDelete;
    setPendingDelete(null);
    try {
      await data.deleteExperience(item.id);
      toast.success('Élément supprimé.');
    } catch (err) {
      toast.error(`Suppression impossible : ${errorMessage(err)}`);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Parcours"
        description="Expériences et formations de la page Parcours. Glisse les lignes pour les réordonner."
        actions={
          <Button onClick={() => openForm(null)}>
            <Plus />
            Ajouter
          </Button>
        }
      />

      {data.loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="grid gap-6">
          {sections.map((section) => {
            const items = data.experiences.filter((item) => item.type === section.type);
            return (
              <section key={section.type} className="surface overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                  <h2 className="flex items-center gap-2 font-medium">
                    <section.icon className="size-4 text-primary" />
                    {section.title}
                    <span className="font-mono text-xs font-normal text-muted-foreground">{items.length}</span>
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => openForm(null, section.type)}>
                    <Plus />
                    Ajouter
                  </Button>
                </div>
                {items.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">{section.empty}</p>
                ) : (
                  <Table>
                    <SortableTableBody
                      items={items}
                      onReorder={(ids) => void handleReorder(ids)}
                      onRowClick={(item) => openForm(item)}
                      renderCells={(item) => (
                        <>
                          <TableCell className="w-36 font-mono text-xs text-muted-foreground">{item.period}</TableCell>
                          <TableCell className="whitespace-normal">
                            <p className="font-medium">{item.title}</p>
                            {(item.company || item.location) && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{[item.company, item.location].filter(Boolean).join(' · ')}</p>
                            )}
                          </TableCell>
                          <TableCell className="w-12 pr-4 text-right">
                            <RowActions onEdit={() => openForm(item)} onDelete={() => setPendingDelete(item)} />
                          </TableCell>
                        </>
                      )}
                    />
                  </Table>
                )}
              </section>
            );
          })}
        </div>
      )}

      <FormDialog
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editing ? "Modifier l'élément" : 'Ajouter au parcours'}
        description={editing?.title}
        formId={FORM_ID}
        submitLabel={editing ? 'Enregistrer' : 'Ajouter'}
        isSaving={isSaving}
      >
        <ExperienceForm
          key={formKey}
          formId={FORM_ID}
          item={editing}
          defaultType={defaultType}
          onSavingChange={setIsSaving}
          onSaved={() => setSheetOpen(false)}
        />
      </FormDialog>

      <ConfirmDeleteDialog itemLabel={pendingDelete?.title ?? null} onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmDelete()} />
    </>
  );
}

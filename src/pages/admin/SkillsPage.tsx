import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { SkillLevel } from '@/components/SkillLevel';
import { TechIcon } from '@/components/TechIcon';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableCell } from '@/components/ui/table';
import { errorMessage } from '@/lib/errors';
import { groupBy } from '@/lib/group';
import type { Skill } from '@/types';
import { useAdminData } from './admin-data';
import { AdminPageHeader, ConfirmDeleteDialog, EmptyState, FormDialog, RowActions } from './shared';
import { SkillForm } from './SkillForm';
import { SortableTableBody } from './sortable';

const FORM_ID = 'skill-form';

export function SkillsPage() {
  const { skills: data } = useAdminData();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<string | undefined>();
  const [formKey, setFormKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Skill | null>(null);

  const groups = groupBy(data.skills, (skill) => skill.category || 'Autres');

  const openForm = (skill: Skill | null, category?: string) => {
    setEditing(skill);
    setDefaultCategory(category);
    setFormKey((key) => key + 1);
    setSheetOpen(true);
  };

  /**
   * The public page shows categories in the order of their first skill, so any change
   * is saved as one global order: categories in display order, skills inside each.
   */
  const saveOrder = async (orderedGroups: Array<[string, string[]]>) => {
    try {
      await data.reorderSkills(orderedGroups.flatMap(([, ids]) => ids));
    } catch (err) {
      toast.error(`Nouvel ordre non enregistré : ${errorMessage(err)}`);
    }
  };

  const currentOrder = (): Array<[string, string[]]> => groups.map(([category, items]) => [category, items.map((skill) => skill.id)]);

  const reorderInCategory = (category: string, ids: string[]) =>
    void saveOrder(currentOrder().map(([name, current]) => [name, name === category ? ids : current]));

  const moveCategory = (index: number, direction: -1 | 1) => {
    const order = currentOrder();
    [order[index], order[index + direction]] = [order[index + direction], order[index]];
    void saveOrder(order);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const skill = pendingDelete;
    setPendingDelete(null);
    try {
      await data.deleteSkill(skill.id);
      toast.success('Compétence supprimée.');
    } catch (err) {
      toast.error(`Suppression impossible : ${errorMessage(err)}`);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Compétences"
        description="Glisse les compétences pour les réordonner ; les flèches de chaque carte déplacent la catégorie entière."
        actions={
          <Button onClick={() => openForm(null)}>
            <Plus />
            Nouvelle compétence
          </Button>
        }
      />

      {data.loading ? (
        <Skeleton className="h-64 w-full" />
      ) : groups.length === 0 ? (
        <EmptyState
          title="Aucune compétence"
          description="Ajoute tes compétences techniques, regroupées par catégorie."
          action={<Button onClick={() => openForm(null)}>Ajouter une compétence</Button>}
        />
      ) : (
        <div className="grid gap-6">
          {groups.map(([category, items], index) => (
            <section key={category} className="surface overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                <h2 className="font-medium">
                  {category}
                  <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">{items.length}</span>
                </h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => moveCategory(index, -1)} aria-label="Monter la catégorie">
                    <ChevronUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === groups.length - 1}
                    onClick={() => moveCategory(index, 1)}
                    aria-label="Descendre la catégorie"
                  >
                    <ChevronDown />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openForm(null, category)}>
                    <Plus />
                    Ajouter
                  </Button>
                </div>
              </div>
              <Table>
                <SortableTableBody
                  items={items}
                  onReorder={(ids) => reorderInCategory(category, ids)}
                  onRowClick={(skill) => openForm(skill)}
                  renderCells={(skill) => (
                    <>
                      <TableCell className="w-1/3">
                        <span className="flex items-center gap-2.5 font-medium">
                          <TechIcon name={skill.name} className="size-4" />
                          {skill.name}
                        </span>
                      </TableCell>
                      <TableCell className="w-36">
                        <SkillLevel level={skill.level} />
                      </TableCell>
                      <TableCell className="hidden max-w-0 truncate text-muted-foreground md:table-cell">
                        {skill.description || <span className="italic opacity-60">Sans description</span>}
                      </TableCell>
                      <TableCell className="w-12 pr-4 text-right">
                        <RowActions onEdit={() => openForm(skill)} onDelete={() => setPendingDelete(skill)} />
                      </TableCell>
                    </>
                  )}
                />
              </Table>
            </section>
          ))}
        </div>
      )}

      <FormDialog
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editing ? 'Modifier la compétence' : 'Nouvelle compétence'}
        description={editing?.name}
        formId={FORM_ID}
        submitLabel={editing ? 'Enregistrer' : 'Ajouter'}
        isSaving={isSaving}
      >
        <SkillForm
          key={formKey}
          formId={FORM_ID}
          skill={editing}
          defaultCategory={defaultCategory}
          onSavingChange={setIsSaving}
          onSaved={() => setSheetOpen(false)}
        />
      </FormDialog>

      <ConfirmDeleteDialog itemLabel={pendingDelete?.name ?? null} onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmDelete()} />
    </>
  );
}

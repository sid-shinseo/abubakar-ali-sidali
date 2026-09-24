import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { TechIcon } from '@/components/TechIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableCell } from '@/components/ui/table';
import { certificationStatusLabel } from '@/lib/certifications';
import { errorMessage } from '@/lib/errors';
import type { Certification } from '@/types';
import { useAdminData } from './admin-data';
import { CertificationForm } from './CertificationForm';
import { AdminPageHeader, ConfirmDeleteDialog, EmptyState, FormSheet, RowActions } from './shared';
import { SortableTableBody } from './sortable';

const FORM_ID = 'certification-form';

export function CertificationsPage() {
  const { certifications: data } = useAdminData();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Certification | null>(null);

  const openForm = (item: Certification | null) => {
    setEditing(item);
    setFormKey((key) => key + 1);
    setSheetOpen(true);
  };

  const handleReorder = async (orderedIds: string[]) => {
    try {
      await data.reorderCertifications(orderedIds);
    } catch (err) {
      toast.error(`Nouvel ordre non enregistré : ${errorMessage(err)}`);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const item = pendingDelete;
    setPendingDelete(null);
    try {
      await data.deleteCertification(item.id);
      toast.success('Certification supprimée.');
    } catch (err) {
      toast.error(`Suppression impossible : ${errorMessage(err)}`);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Certifications"
        description="Affichées sur la page Parcours dès qu'il y en a au moins une, y compris celles en préparation."
        actions={
          <Button onClick={() => openForm(null)}>
            <Plus />
            Ajouter
          </Button>
        }
      />

      {data.loading ? (
        <Skeleton className="h-48 w-full" />
      ) : data.certifications.length === 0 ? (
        <EmptyState
          title="Aucune certification"
          description="Tu peux déjà ajouter celle que tu prépares (par exemple Cisco CCNA pendant le Titre Pro AIS) avec le statut « Prévue » ou « En préparation »."
          action={<Button onClick={() => openForm(null)}>Ajouter une certification</Button>}
        />
      ) : (
        <div className="surface overflow-hidden">
          <Table>
            <SortableTableBody
              items={data.certifications}
              onReorder={(ids) => void handleReorder(ids)}
              onRowClick={(item) => openForm(item)}
              renderCells={(item) => (
                <>
                  <TableCell>
                    <span className="flex items-center gap-2.5 font-medium">
                      <TechIcon name={`${item.name} ${item.issuer ?? ''}`} className="size-4" />
                      {item.name}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {[item.issuer, item.date_label].filter(Boolean).join(' · ')}
                  </TableCell>
                  <TableCell className="w-36">
                    <Badge variant="outline" className={item.status === 'obtenue' ? 'border-primary/50 text-primary' : 'text-muted-foreground'}>
                      {certificationStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-12 pr-4 text-right">
                    <RowActions onEdit={() => openForm(item)} onDelete={() => setPendingDelete(item)} />
                  </TableCell>
                </>
              )}
            />
          </Table>
        </div>
      )}

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editing ? 'Modifier la certification' : 'Nouvelle certification'}
        description={editing?.name}
        formId={FORM_ID}
        submitLabel={editing ? 'Enregistrer' : 'Ajouter'}
        isSaving={isSaving}
      >
        <CertificationForm key={formKey} formId={FORM_ID} item={editing} onSavingChange={setIsSaving} onSaved={() => setSheetOpen(false)} />
      </FormSheet>

      <ConfirmDeleteDialog itemLabel={pendingDelete?.name ?? null} onCancel={() => setPendingDelete(null)} onConfirm={() => void confirmDelete()} />
    </>
  );
}

import type { ReactNode } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function CategoryOptions({ id, values }: { id: string; values: string[] }) {
  return (
    <datalist id={id}>
      {Array.from(new Set(values.filter(Boolean))).map((value) => (
        <option key={value} value={value} />
      ))}
    </datalist>
  );
}

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  formId: string;
  submitLabel: string;
  isSaving: boolean;
  /** "lg" for long forms (projects), "md" for the others. Same look either way. */
  size?: 'md' | 'lg';
  children: ReactNode;
}

/**
 * Centered window hosting an edit form: header and footer stay in place while the form scrolls.
 * Used by every admin editor so they all look and behave the same.
 */
export function FormDialog({ open, onOpenChange, title, description, formId, submitLabel, isSaving, size = 'md', children }: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0',
          size === 'lg' ? 'sm:max-w-4xl' : 'sm:max-w-2xl',
        )}
      >
        <DialogHeader className="border-b px-6 py-5 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className={description ? undefined : 'sr-only'}>{description ?? title}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-6 py-6">{children}</div>
        <DialogFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" form={formId} disabled={isSaving}>
            {isSaving ? 'Enregistrement…' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmDeleteDialogProps {
  itemLabel: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Open whenever itemLabel is set. */
export function ConfirmDeleteDialog({ itemLabel, onCancel, onConfirm }: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={itemLabel !== null} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer « {itemLabel} » ?</AlertDialogTitle>
          <AlertDialogDescription>Cette action est définitive et sera visible immédiatement sur le site.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-white hover:bg-destructive/90">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  children?: ReactNode;
}

/** "..." menu at the end of a table row. Extra items go in children. */
export function RowActions({ onEdit, onDelete, children }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil />
          Modifier
        </DropdownMenuItem>
        {children}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

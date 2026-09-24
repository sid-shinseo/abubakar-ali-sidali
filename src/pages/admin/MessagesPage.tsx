import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatDateTime, formatRelative } from '@/lib/dates';
import { errorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import type { ContactMessage } from '@/types';
import { useAdminData } from './admin-data';
import { AdminPageHeader, ConfirmDeleteDialog, EmptyState } from './shared';

type Filter = 'all' | 'unread';

export function MessagesPage() {
  const { messages: data } = useAdminData();
  // The open message lives in the URL (?id=…) so dashboard links can point to it.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const [filter, setFilter] = useState<Filter>('all');
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);

  const unreadCount = data.messages.filter((m) => !m.read).length;
  const visible = useMemo(() => (filter === 'unread' ? data.messages.filter((m) => !m.read) : data.messages), [data.messages, filter]);
  const selected = data.messages.find((m) => m.id === selectedId) ?? null;

  const select = (id: string | null) => setSearchParams(id ? { id } : {}, { replace: true });

  // Opening an unread message marks it as read.
  const { setRead } = data;
  useEffect(() => {
    if (selected && !selected.read) {
      setRead(selected.id, true).catch((err: unknown) => toast.error(`Action impossible : ${errorMessage(err)}`));
    }
  }, [selected, setRead]);

  const toggleRead = async (message: ContactMessage) => {
    // Close it before marking unread, otherwise the "opened = read" effect flips it back.
    if (message.read) select(null);
    try {
      await data.setRead(message.id, !message.read);
    } catch (err) {
      toast.error(`Action impossible : ${errorMessage(err)}`);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const message = pendingDelete;
    setPendingDelete(null);
    try {
      await data.deleteMessage(message.id);
      if (selectedId === message.id) select(null);
      toast.success('Message supprimé.');
    } catch (err) {
      toast.error(`Suppression impossible : ${errorMessage(err)}`);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description={unreadCount > 0 ? `${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}.` : 'Messages reçus via le formulaire de contact.'}
      />

      {data.loading ? (
        <Skeleton className="h-96 w-full" />
      ) : data.messages.length === 0 ? (
        <EmptyState title="Boîte de réception vide" description="Les messages envoyés depuis la page Contact apparaîtront ici." />
      ) : (
        <div className="surface grid overflow-hidden lg:h-[calc(100vh-14rem)] lg:min-h-[28rem] lg:grid-cols-[22rem_1fr]">
          {/* List: hidden on small screens while a message is open */}
          <div className={cn('flex min-h-0 flex-col lg:border-r', selected && 'hidden lg:flex')}>
            <div className="border-b p-3">
              <ToggleGroup type="single" variant="outline" size="sm" value={filter} onValueChange={(v) => v && setFilter(v as Filter)} className="w-full">
                <ToggleGroupItem value="all" className="flex-1">
                  Tous ({data.messages.length})
                </ToggleGroupItem>
                <ToggleGroupItem value="unread" className="flex-1">
                  Non lus ({unreadCount})
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto p-2">
              {visible.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted-foreground">Aucun message non lu.</li>}
              {visible.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => select(message.id)}
                    className={cn(
                      'w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-accent/60',
                      message.id === selectedId && 'bg-accent',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn('size-2 shrink-0 rounded-full', message.read ? 'bg-transparent' : 'bg-primary')} aria-hidden />
                      <span className={cn('min-w-0 flex-1 truncate text-sm', !message.read && 'font-medium')}>{message.name}</span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{formatRelative(message.created_at)}</span>
                    </span>
                    <span className="mt-1 block truncate pl-4 text-sm">{message.subject}</span>
                    <span className="mt-0.5 block truncate pl-4 text-xs text-muted-foreground">{message.message}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Reading pane */}
          <div className={cn('min-h-0 flex-col', selected ? 'flex' : 'hidden lg:flex')}>
            {selected ? (
              <>
                <div className="flex flex-wrap items-center gap-2 border-b p-3">
                  <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => select(null)}>
                    Retour
                  </Button>
                  <Button asChild size="sm">
                    <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}>
                      <Reply />
                      Répondre
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void toggleRead(selected)}>
                    {selected.read ? <Mail /> : <MailOpen />}
                    {selected.read ? 'Marquer non lu' : 'Marquer lu'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-destructive hover:text-destructive"
                    onClick={() => setPendingDelete(selected)}
                  >
                    <Trash2 />
                    Supprimer
                  </Button>
                </div>
                <article className="min-h-0 flex-1 overflow-y-auto p-6">
                  <h2 className="text-xl font-semibold tracking-tight">{selected.subject}</h2>
                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <p>
                      <span className="font-medium">{selected.name}</span>{' '}
                      <a href={`mailto:${selected.email}`} className="font-mono text-xs text-muted-foreground hover:text-foreground">
                        {selected.email}
                      </a>
                    </p>
                    <time dateTime={selected.created_at} className="font-mono text-xs text-muted-foreground">
                      {formatDateTime(selected.created_at)}
                    </time>
                  </div>
                  <p className="mt-6 max-w-2xl whitespace-pre-line leading-7 text-foreground/90">{selected.message}</p>
                </article>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground">Sélectionne un message pour le lire.</div>
            )}
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        itemLabel={pendingDelete ? `Message de ${pendingDelete.name}` : null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}

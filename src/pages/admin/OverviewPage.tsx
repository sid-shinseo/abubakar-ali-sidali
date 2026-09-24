import { Link } from 'react-router-dom';
import { Briefcase, CircleCheck, CircleDashed, Cpu, FolderKanban, Inbox, type LucideIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelative } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { useAdminData } from './admin-data';
import { AdminPageHeader } from './shared';

interface StatCardProps {
  to: string;
  label: string;
  icon: LucideIcon;
  value: number;
  detail: string;
  loading: boolean;
  highlight?: boolean;
}

function StatCard({ to, label, icon: Icon, value, detail, loading, highlight }: StatCardProps) {
  return (
    <Link to={to} className="surface group p-5 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-card-hover">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className={cn('size-4', highlight ? 'text-primary' : 'text-muted-foreground/70')} />
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-12" />
      ) : (
        <p className={cn('mt-2 text-3xl font-semibold tracking-tight', highlight && 'text-primary')}>{value}</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </Link>
  );
}

export function OverviewPage() {
  const { projects, skills, experiences, about, messages } = useAdminData();

  const featuredCount = projects.projects.filter((p) => p.featured && p.published).length;
  const categoryCount = new Set(skills.skills.map((s) => s.category)).size;
  const experienceCount = experiences.experiences.filter((e) => e.type === 'experience').length;
  const educationCount = experiences.experiences.length - experienceCount;
  const unread = messages.messages.filter((m) => !m.read);

  // Content gaps worth fixing, each pointing to the page where it can be fixed.
  const todo = [
    {
      count: !about.loading && !about.aboutMe?.cv_path ? 1 : 0,
      label: () => 'Aucun CV téléchargeable en ligne',
      to: '/admin/presentation',
    },
    {
      count: projects.projects.filter((p) => !p.published).length,
      label: (n: number) => `${n} projet${n > 1 ? 's' : ''} en brouillon, invisible${n > 1 ? 's' : ''} sur le site`,
      to: '/admin/projets',
    },
    {
      count: projects.projects.filter((p) => (p.gallery ?? []).length === 0).length,
      label: (n: number) => `${n} projet${n > 1 ? 's' : ''} sans schéma ni illustration`,
      to: '/admin/projets',
    },
    {
      count: projects.projects.filter((p) => !p.cover_image_url).length,
      label: (n: number) => `${n} projet${n > 1 ? 's' : ''} sans image de couverture`,
      to: '/admin/projets',
    },
    {
      count: projects.projects.filter((p) => !p.long_description).length,
      label: (n: number) => `${n} projet${n > 1 ? 's' : ''} sans description détaillée`,
      to: '/admin/projets',
    },
    {
      count: projects.projects.length > 0 && featuredCount === 0 ? 1 : 0,
      label: () => "Aucun projet mis en avant sur l'accueil",
      to: '/admin/projets',
    },
    {
      count: skills.skills.filter((s) => !s.description).length,
      label: (n: number) => `${n} compétence${n > 1 ? 's' : ''} sans description`,
      to: '/admin/competences',
    },
    {
      count: !about.loading && (!about.aboutMe?.title || !about.aboutMe.bio) ? 1 : 0,
      label: () => 'Présentation incomplète (titre ou bio manquant)',
      to: '/admin/presentation',
    },
  ].filter((item) => item.count > 0);

  const isLoading = projects.loading || skills.loading || experiences.loading;

  return (
    <>
      <AdminPageHeader
        title="Vue d'ensemble"
        description="L'état du contenu publié sur le site."
        actions={
          <Button asChild>
            <Link to="/admin/projets?nouveau=1">
              <Plus />
              Nouveau projet
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          to="/admin/projets"
          label="Projets"
          icon={FolderKanban}
          value={projects.projects.length}
          detail={`${featuredCount} en vedette sur l'accueil`}
          loading={projects.loading}
        />
        <StatCard
          to="/admin/competences"
          label="Compétences"
          icon={Cpu}
          value={skills.skills.length}
          detail={`${categoryCount} catégorie${categoryCount > 1 ? 's' : ''}`}
          loading={skills.loading}
        />
        <StatCard
          to="/admin/parcours"
          label="Parcours"
          icon={Briefcase}
          value={experiences.experiences.length}
          detail={`${experienceCount} expérience${experienceCount > 1 ? 's' : ''}, ${educationCount} formation${educationCount > 1 ? 's' : ''}`}
          loading={experiences.loading}
        />
        <StatCard
          to="/admin/messages"
          label="Messages non lus"
          icon={Inbox}
          value={unread.length}
          detail={`${messages.messages.length} reçu${messages.messages.length > 1 ? 's' : ''} au total`}
          loading={messages.loading}
          highlight={unread.length > 0}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Derniers messages</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/messages">Tout voir</Link>
            </Button>
          </div>
          {messages.loading ? (
            <Skeleton className="mt-4 h-40 w-full" />
          ) : messages.messages.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucun message reçu pour le moment.</p>
          ) : (
            <ul className="mt-3 grid gap-1">
              {messages.messages.slice(0, 5).map((message) => (
                <li key={message.id}>
                  <Link
                    to={`/admin/messages?id=${message.id}`}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent/60"
                  >
                    <span className={cn('size-2 shrink-0 rounded-full', message.read ? 'bg-transparent' : 'bg-primary')} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate text-sm', !message.read && 'font-medium')}>{message.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{message.subject}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatRelative(message.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface p-5">
          <h2 className="font-medium">À compléter</h2>
          {isLoading ? (
            <Skeleton className="mt-4 h-32 w-full" />
          ) : todo.length === 0 ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <CircleCheck className="size-4 text-primary" />
              Tout le contenu est renseigné.
            </p>
          ) : (
            <ul className="mt-3 grid gap-1">
              {todo.map((item) => (
                <li key={item.label(item.count)}>
                  <Link to={item.to} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent/60">
                    <CircleDashed className="size-4 shrink-0 text-primary" />
                    {item.label(item.count)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

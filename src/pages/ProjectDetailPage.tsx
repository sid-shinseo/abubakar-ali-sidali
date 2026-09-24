import { Link, useParams } from 'react-router-dom';
import { ProjectGallery } from '@/components/ProjectGallery';
import { SiteLayout } from '@/components/SiteLayout';
import { TechName } from '@/components/TechIcon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProjectBySlug } from '@/hooks/useProjects';

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { project, loading, error } = useProjectBySlug(slug ?? '');
  usePageTitle(loading ? null : (project?.title ?? 'Projet introuvable'));

  return (
    <SiteLayout>
      <div className="container-shell py-12 sm:py-16">
        <Link to="/projets" className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
          Tous les projets
        </Link>

        {loading && (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="aspect-[16/9] w-full" />
          </div>
        )}

        {!loading && error && (
          <Alert variant="destructive" className="mt-8">
            <AlertDescription>Impossible de charger le projet : {error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && !project && (
          <div className="mt-8 rounded-lg border border-dashed p-10 text-center">
            <h1 className="text-xl font-semibold">Projet introuvable</h1>
            <p className="mt-2 text-sm text-muted-foreground">Ce projet n'existe pas ou a été retiré du portfolio.</p>
            <Button asChild variant="outline" size="sm" className="mt-6">
              <Link to="/projets">Retour aux projets</Link>
            </Button>
          </div>
        )}

        {!loading && project && (
          <article className="mt-8">
            {!project.published && (
              <Alert className="mb-6 border-primary/40">
                <AlertDescription>Brouillon : ce projet n'est visible que par toi tant qu'il n'est pas publié.</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {project.category && <p className="font-mono text-xs text-muted-foreground">{project.category}</p>}
              {!project.published && <Badge variant="outline">Brouillon</Badge>}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-foreground/80">{project.description}</p>

            {project.cover_image_url && (
              <img src={project.cover_image_url} alt="" className="surface mt-10 aspect-[16/9] w-full object-cover" />
            )}

            <div className="mt-10 grid gap-10 md:grid-cols-[1fr_14rem]">
              <div className="max-w-2xl whitespace-pre-line leading-7 text-muted-foreground">
                {project.long_description || project.description}
              </div>

              <aside className="surface space-y-6 self-start p-5 text-sm">
                {(project.context || project.period) && (
                  <div className="space-y-4">
                    {project.context && (
                      <div>
                        <h2 className="font-mono text-xs text-muted-foreground">Contexte</h2>
                        <p className="mt-1">{project.context}</p>
                      </div>
                    )}
                    {project.period && (
                      <div>
                        <h2 className="font-mono text-xs text-muted-foreground">Période</h2>
                        <p className="mt-1">{project.period}</p>
                      </div>
                    )}
                  </div>
                )}
                {project.tech_stack.length > 0 && (
                  <div>
                    <h2 className="font-mono text-xs text-muted-foreground">Technologies</h2>
                    <ul className="mt-3 space-y-2">
                      {project.tech_stack.map((tech) => (
                        <li key={tech}>
                          <TechName name={tech} iconClassName="size-4" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {project.link_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={project.link_url} target="_blank" rel="noopener noreferrer">
                      Voir le projet
                    </a>
                  </Button>
                )}
              </aside>
            </div>

            {(project.competencies ?? []).length > 0 && (
              <section className="mt-14">
                <h2 className="text-xl font-semibold tracking-tight">Compétences BTS SIO mobilisées</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {project.competencies.map((competency) => (
                    <li key={competency} className="surface flex items-start gap-3 p-4 text-sm">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      {competency}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(project.gallery ?? []).length > 0 && (
              <section className="mt-14">
                <h2 className="mb-6 text-xl font-semibold tracking-tight">Schémas et illustrations</h2>
                <ProjectGallery images={project.gallery} />
              </section>
            )}
          </article>
        )}
      </div>
    </SiteLayout>
  );
}

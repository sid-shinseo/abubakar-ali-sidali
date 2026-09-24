import { Link } from 'react-router-dom';
import { CvButton } from '@/components/CvButton';
import { ProjectCard } from '@/components/ProjectCard';
import { Section } from '@/components/Section';
import { SiteLayout } from '@/components/SiteLayout';
import { TechName } from '@/components/TechIcon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAboutMe } from '@/hooks/useAboutMe';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProjects } from '@/hooks/useProjects';
import { useSkills } from '@/hooks/useSkills';
import { defaultCta } from '@/lib/cta';
import { categoryAnchor, groupBy } from '@/lib/group';
import { profile } from '@/lib/profile';

const SKILLS_PER_CATEGORY = 5;

export function HomePage() {
  const { projects: featuredProjects, loading, error } = useProjects({ featured: true });
  usePageTitle();
  const { aboutMe, loading: aboutLoading } = useAboutMe();
  const { skills, loading: skillsLoading } = useSkills();

  const skillGroups = groupBy(skills, (skill) => skill.category || 'Autres');

  return (
    <SiteLayout>
      <section className="container-shell grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        <div>
          {aboutLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full max-w-md" />
              <Skeleton className="h-6 w-full max-w-sm" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{profile.name}</h1>
              {aboutMe?.title && <p className="mt-4 text-lg leading-7 text-foreground/80">{aboutMe.title}</p>}
              {aboutMe?.bio && <p className="mt-6 leading-7 text-muted-foreground">{aboutMe.bio}</p>}
            </>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/projets">Voir les projets</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Me contacter</Link>
            </Button>
            <CvButton cvPath={aboutMe?.cv_path} size="lg" variant="ghost" />
          </div>
        </div>

        <aside className="surface p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Ce que je recherche</h2>
            {aboutMe?.availability_status && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                {aboutMe.availability_status === 'Déjà en poste' ? 'En poste' : 'Disponible'}
              </span>
            )}
          </div>

          <dl className="mt-5 grid gap-3">
            {[
              { label: 'Poste', value: aboutMe?.availability_status },
              { label: 'Objectif', value: profile.goal },
              { label: 'Expérience', value: profile.experience },
              { label: 'Spécialité', value: profile.specialty },
              { label: 'Localisation', value: aboutMe?.location },
            ]
              .filter((row): row is { label: string; value: string } => Boolean(row.value))
              .map((row) => (
                <div key={row.label} className="rounded-md bg-background/60 px-4 py-3">
                  <dt className="font-mono text-xs text-muted-foreground">{row.label}</dt>
                  <dd className="mt-1 font-medium">{row.value}</dd>
                </div>
              ))}
          </dl>
        </aside>
      </section>

      <Section title="Compétences" link={{ to: '/skills', label: 'Toutes les compétences' }}>
        {skillsLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map(([category, items]) => (
              // Same hover as the featured project cards; opens the Skills page on this category.
              <Link
                key={category}
                to={`/skills#${categoryAnchor(category)}`}
                className="surface group p-5 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-card-hover"
              >
                <h3 className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-primary">{category}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {items.slice(0, SKILLS_PER_CATEGORY).map((skill) => (
                    <li key={skill.id}>
                      <TechName name={skill.name} />
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="Projets en vedette" link={{ to: '/projets', label: 'Tous les projets' }}>
        {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>Impossible de charger les projets : {error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && featuredProjects.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun projet mis en avant pour le moment.</p>
        )}
        {!loading && !error && featuredProjects.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </Section>

      {/* Shown unless turned off in admin > Présentation (also shown if the column doesn't exist yet). */}
      {!aboutLoading && aboutMe?.cta_enabled !== false && (
        <section className="container-shell py-12 pb-20">
          <div className="flex flex-col gap-6 surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{aboutMe?.cta_title || defaultCta.title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{aboutMe?.cta_text || defaultCta.text}</p>
            </div>
            <Button asChild variant="outline" className="self-start sm:self-auto">
              <Link to="/contact">Prendre contact</Link>
            </Button>
          </div>
        </section>
      )}
      {!aboutLoading && aboutMe?.cta_enabled === false && <div className="pb-8" />}
    </SiteLayout>
  );
}

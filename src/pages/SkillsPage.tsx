import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Info } from 'lucide-react';
import { PageIntro } from '@/components/PageIntro';
import { SiteLayout } from '@/components/SiteLayout';
import { SkillLevel } from '@/components/SkillLevel';
import { TechIcon } from '@/components/TechIcon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useSkills } from '@/hooks/useSkills';
import { categoryAnchor, groupBy } from '@/lib/group';
import { skillLevels } from '@/lib/skill-levels';

export function SkillsPage() {
  const { skills, loading, error } = useSkills();
  const skillGroups = groupBy(skills, (skill) => skill.category || 'Autres');
  usePageTitle('Compétences');
  const { hash } = useLocation();

  // Coming from a homepage card (/skills#category): scroll to it once the data is there.
  useEffect(() => {
    if (loading || !hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loading, hash]);

  return (
    <SiteLayout>
      <div className="container-shell py-12 sm:py-16">
        <PageIntro title="Compétences">
          Systèmes, réseau, sécurité et virtualisation d'abord ; le développement web vient en complément.
        </PageIntro>

        {/* Desktop: compact legend, definitions in tooltips. */}
        <div className="mt-6 hidden flex-wrap items-center gap-x-6 gap-y-2 sm:flex">
          <span className="text-xs text-muted-foreground">Niveaux</span>
          {skillLevels.map((level) => (
            <SkillLevel key={level.value} level={level.value} withTooltip />
          ))}
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70">
            <Info className="size-3.5" aria-hidden />
            Survolez un niveau pour sa définition
          </span>
        </div>

        {/* Mobile: no hover on touch screens, so the definitions are written out. */}
        <dl className="mt-6 grid gap-2 sm:hidden">
          {skillLevels.map((level) => (
            <div key={level.value} className="flex items-start gap-3 text-xs">
              <dt className="w-32 shrink-0">
                <SkillLevel level={level.value} />
              </dt>
              <dd className="text-muted-foreground">{level.description}</dd>
            </div>
          ))}
        </dl>

        {loading && <Skeleton className="mt-10 h-64 w-full" />}

        {error && (
          <Alert variant="destructive" className="mt-10">
            <AlertDescription>Impossible de charger les compétences : {error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && skillGroups.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">Aucune compétence renseignée.</p>
        )}

        {!loading && !error && skillGroups.length > 0 && (
          // Regular grid like the Projects page: every card gets the same height (the tallest one).
          <div className="mt-10 grid gap-6 md:grid-cols-2 md:auto-rows-fr xl:grid-cols-3">
            {skillGroups.map(([category, items]) => (
              <section key={category} id={categoryAnchor(category)} className="surface flex scroll-mt-6 flex-col overflow-hidden">
                <header className="flex items-baseline justify-between gap-3 border-b px-5 py-3.5">
                  <h2 className="font-medium">{category}</h2>
                  <span className="font-mono text-xs text-muted-foreground">{items.length}</span>
                </header>
                <ul className="grid gap-1 p-2">
                  {items.map((skill) => (
                    <li key={skill.id} className="flex items-center gap-4 rounded-md px-3 py-3 transition-colors hover:bg-accent/40">
                      {/* Same proportions as the logo tiles on the project covers: icon ≈ half of the tile. */}
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-background/60">
                        <TechIcon name={skill.name} className="size-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        {/* Level always under the name, so every row lines up the same way. */}
                        <h3 className="text-sm font-medium">{skill.name}</h3>
                        <SkillLevel level={skill.level} withTooltip className="mt-1" />
                        {skill.description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{skill.description}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

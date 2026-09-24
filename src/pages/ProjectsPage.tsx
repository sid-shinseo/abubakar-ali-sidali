import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageIntro } from '@/components/PageIntro';
import { ProjectCard } from '@/components/ProjectCard';
import { SiteLayout } from '@/components/SiteLayout';
import { TechName } from '@/components/TechIcon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProjects } from '@/hooks/useProjects';

const ALL = 'all';

export function ProjectsPage() {
  const { projects, loading, error } = useProjects();
  usePageTitle('Projets');
  // Filters live in the URL so they survive a round-trip to a project page and back.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('categorie') ?? ALL;
  const selectedTech = searchParams.get('tech') ?? ALL;
  const selectedContext = searchParams.get('cadre') ?? ALL;

  const categories = useMemo(
    () => Array.from(new Set(projects.map((p) => p.category).filter((c): c is string => Boolean(c)))).sort(),
    [projects],
  );
  const contexts = useMemo(
    () => Array.from(new Set(projects.map((p) => p.context).filter((c): c is string => Boolean(c)))).sort((a, b) => a.localeCompare(b, 'fr')),
    [projects],
  );
  const technologies = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.tech_stack))).sort((a, b) => a.localeCompare(b, 'fr')),
    [projects],
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          (selectedCategory === ALL || p.category === selectedCategory) &&
          (selectedTech === ALL || p.tech_stack.includes(selectedTech)) &&
          (selectedContext === ALL || p.context === selectedContext),
      ),
    [projects, selectedCategory, selectedTech, selectedContext],
  );

  const setFilter = (key: 'categorie' | 'tech' | 'cadre', value: string) => {
    setSearchParams(
      (params) => {
        if (value === ALL) params.delete(key);
        else params.set(key, value);
        return params;
      },
      { replace: true },
    );
  };

  const hasFilters = selectedCategory !== ALL || selectedTech !== ALL || selectedContext !== ALL;

  return (
    <SiteLayout>
      <div className="container-shell py-12 sm:py-16">
        <PageIntro title="Projets">
          Mes réalisations du BTS SIO option SISR : ateliers de professionnalisation, projets menés en formation et missions de stage en entreprise.
        </PageIntro>

        {error && (
          <Alert variant="destructive" className="mt-8">
            <AlertDescription>Impossible de charger les projets : {error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-8 grid gap-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Select value={selectedContext} onValueChange={(value) => setFilter('cadre', value)}>
                  <SelectTrigger size="sm" className="w-full sm:w-64" aria-label="Filtrer par cadre">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Tous les cadres</SelectItem>
                    {contexts.map((context) => (
                      <SelectItem key={context} value={context}>
                        {context}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedTech} onValueChange={(value) => setFilter('tech', value)}>
                  <SelectTrigger size="sm" className="w-full sm:w-64" aria-label="Filtrer par technologie">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Toutes les technologies</SelectItem>
                    {technologies.map((tech) => (
                      <SelectItem key={tech} value={tech}>
                        <TechName name={tech} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                spacing={2}
                value={selectedCategory}
                onValueChange={(value) => setFilter('categorie', value || ALL)}
                className="flex-wrap"
                aria-label="Filtrer par catégorie"
              >
                <ToggleGroupItem value={ALL}>Toutes</ToggleGroupItem>
                {categories.map((category) => (
                  <ToggleGroupItem key={category} value={category}>
                    {category}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <p className="mt-6 font-mono text-xs text-muted-foreground">
              {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''}
            </p>

            {filteredProjects.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">Aucun projet ne correspond à ces filtres.</p>
                {hasFilters && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setSearchParams({}, { replace: true })}>
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  );
}

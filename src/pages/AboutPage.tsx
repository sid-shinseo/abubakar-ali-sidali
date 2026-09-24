import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';
import { ExperienceDialog } from '@/components/ExperienceDialog';
import { PageIntro } from '@/components/PageIntro';
import { Section } from '@/components/Section';
import { SiteLayout } from '@/components/SiteLayout';
import { TechIcon } from '@/components/TechIcon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAboutMe } from '@/hooks/useAboutMe';
import { useCertifications } from '@/hooks/useCertifications';
import { useExperiences } from '@/hooks/useExperiences';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProjects } from '@/hooks/useProjects';
import { certificationStatusLabel } from '@/lib/certifications';
import type { Experience } from '@/types';

interface TimelineProps {
  items: Experience[];
  emptyLabel: string;
  projectCount: (experienceId: string) => number;
  onOpen: (item: Experience) => void;
}

function Timeline({ items, emptyLabel, projectCount, onOpen }: TimelineProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ol className="grid gap-4">
      {items.map((item) => {
        const count = projectCount(item.id);
        const content = (
          <>
            <p className="font-mono text-xs leading-6 text-muted-foreground">{item.period}</p>
            <div>
              <h3 className="font-medium transition-colors group-hover:text-primary">{item.title}</h3>
              {(item.company || item.location) && (
                <p className="mt-0.5 text-sm text-muted-foreground">{[item.company, item.location].filter(Boolean).join(' · ')}</p>
              )}
              {item.description && <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-foreground/80">{item.description}</p>}
              {count > 0 && (
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  <FolderKanban className="size-3.5" aria-hidden />
                  Voir {count > 1 ? `les ${count} projets réalisés` : 'le projet réalisé'}
                </p>
              )}
            </div>
          </>
        );
        const cardClass =
          'surface group grid w-full gap-2 p-5 text-left transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-card-hover sm:p-6 md:grid-cols-[10rem_1fr] md:gap-8';

        return (
          <li key={item.id}>
            {/* Clickable only when there are projects to show. */}
            {count > 0 ? (
              <button type="button" onClick={() => onOpen(item)} className={`${cardClass} cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring`}>
                {content}
              </button>
            ) : (
              <div className={cardClass}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function AboutPage() {
  const { aboutMe, loading: aboutLoading, error: aboutError } = useAboutMe();
  const { experiences, loading: expLoading, error: expError } = useExperiences();
  const { certifications } = useCertifications();
  const { projects } = useProjects();
  const [openExperience, setOpenExperience] = useState<Experience | null>(null);
  usePageTitle('Parcours');

  const experienceItems = experiences.filter((item) => item.type === 'experience');
  const educationItems = experiences.filter((item) => item.type === 'education');
  const projectsOf = (experienceId: string) => projects.filter((project) => project.experience_id === experienceId);
  const projectCount = (experienceId: string) => projectsOf(experienceId).length;

  return (
    <SiteLayout>
      <div className="container-shell py-12 sm:py-16">
        <PageIntro title="Parcours">
          {aboutLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : aboutError ? (
            <span className="text-destructive">Erreur : {aboutError}</span>
          ) : (
            <>
              {aboutMe?.title && <p className="text-foreground/80">{aboutMe.title}</p>}
              {aboutMe?.bio && <p className="mt-4">{aboutMe.bio}</p>}
            </>
          )}
        </PageIntro>
      </div>

      {expError ? (
        <div className="container-shell pb-14">
          <Alert variant="destructive">
            <AlertDescription>Impossible de charger le parcours : {expError}</AlertDescription>
          </Alert>
        </div>
      ) : expLoading ? (
        <div className="container-shell pb-14">
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <>
          <Section title="Expérience professionnelle">
            <Timeline items={experienceItems} emptyLabel="Aucune expérience renseignée." projectCount={projectCount} onOpen={setOpenExperience} />
          </Section>
          <Section title="Formation">
            <Timeline items={educationItems} emptyLabel="Aucune formation renseignée." projectCount={projectCount} onOpen={setOpenExperience} />
          </Section>
        </>
      )}

      {/* Hidden until at least one certification is added in the admin. */}
      {certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="grid gap-4 sm:grid-cols-2">
            {certifications.map((cert) => (
              <li key={cert.id} className="surface group transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-card-hover flex items-start gap-4 p-5">
                <TechIcon name={`${cert.name} ${cert.issuer ?? ''}`} className="mt-0.5 size-5" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium transition-colors group-hover:text-primary">{cert.name}</h3>
                    <Badge
                      variant="outline"
                      className={cert.status === 'obtenue' ? 'border-primary/50 text-primary' : 'text-muted-foreground'}
                    >
                      {certificationStatusLabel(cert.status)}
                    </Badge>
                  </div>
                  {(cert.issuer || cert.date_label) && (
                    <p className="mt-1 text-sm text-muted-foreground">{[cert.issuer, cert.date_label].filter(Boolean).join(' · ')}</p>
                  )}
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
                    >
                      Vérifier le certificat
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <ExperienceDialog
        experience={openExperience}
        projects={openExperience ? projectsOf(openExperience.id) : []}
        onClose={() => setOpenExperience(null)}
      />

      <Section title="Et ensuite">
        <p className="max-w-2xl leading-7 text-muted-foreground">
          Le détail de mes compétences techniques est sur la page dédiée. Pour une proposition d'alternance, le plus simple est de m'écrire.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link to="/skills">Voir les compétences</Link>
          </Button>
          <Button asChild>
            <Link to="/contact">Me contacter</Link>
          </Button>
        </div>
      </Section>
    </SiteLayout>
  );
}

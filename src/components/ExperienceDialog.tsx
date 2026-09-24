import { Link } from 'react-router-dom';
import { TechName } from '@/components/TechIcon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Experience, Project } from '@/types';

interface ExperienceDialogProps {
  experience: Experience | null;
  projects: Project[];
  onClose: () => void;
}

/** Details of an experience or training, with the projects carried out during it. Open when `experience` is set. */
export function ExperienceDialog({ experience, projects, onClose }: ExperienceDialogProps) {
  return (
    <Dialog open={experience !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {experience && (
          <>
            <DialogHeader className="text-left">
              <p className="font-mono text-xs text-muted-foreground">{experience.period}</p>
              <DialogTitle className="text-xl">{experience.title}</DialogTitle>
              <DialogDescription>{[experience.company, experience.location].filter(Boolean).join(' · ')}</DialogDescription>
            </DialogHeader>

            {experience.description && (
              <p className="whitespace-pre-line text-sm leading-6 text-foreground/80">{experience.description}</p>
            )}

            <section>
              <h3 className="font-medium">
                Projets réalisés
                <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">{projects.length}</span>
              </h3>
              <ul className="mt-3 grid gap-3">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      to={`/projets/${project.slug}`}
                      className="surface group flex gap-4 p-3 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-card-hover"
                    >
                      <div className="hidden aspect-[16/9] w-32 shrink-0 overflow-hidden rounded-md border bg-muted sm:block">
                        {project.cover_image_url && <img src={project.cover_image_url} alt="" loading="lazy" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 font-mono text-xs text-muted-foreground">
                          {project.category && <span>{project.category}</span>}
                          {project.period && <span>{project.period}</span>}
                        </div>
                        <p className="mt-1 font-medium transition-colors group-hover:text-primary">{project.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{project.description}</p>
                        {project.tech_stack.length > 0 && (
                          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                            {project.tech_stack.slice(0, 4).map((tech) => (
                              <li key={tech}>
                                <TechName name={tech} iconClassName="size-3" />
                              </li>
                            ))}
                            {project.tech_stack.length > 4 && <li>+{project.tech_stack.length - 4}</li>}
                          </ul>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

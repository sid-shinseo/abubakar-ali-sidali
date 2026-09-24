import { Link } from 'react-router-dom';
import { TechName } from '@/components/TechIcon';
import type { Project } from '@/types';

const MAX_TECH = 6;

export function ProjectCard({ project }: { project: Project }) {
  const extraTech = project.tech_stack.length - MAX_TECH;

  return (
    <Link
      to={`/projets/${project.slug}`}
      className="group flex flex-col surface overflow-hidden transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-card-hover"
    >
      <div className="aspect-[16/9] border-b bg-muted">
        {project.cover_image_url ? (
          <img src={project.cover_image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
            {project.category ?? 'Projet'}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          {project.category && <span>{project.category}</span>}
          {project.period && <span>{project.period}</span>}
        </div>
        <h3 className="mt-1.5 font-medium transition-colors group-hover:text-primary">{project.title}</h3>
        {project.context && <p className="mt-1 text-xs text-primary/90">{project.context}</p>}
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{project.description}</p>
        {project.tech_stack.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 font-mono text-xs text-muted-foreground">
            {project.tech_stack.slice(0, MAX_TECH).map((tech) => (
              <li key={tech}>
                <TechName name={tech} iconClassName="size-3" />
              </li>
            ))}
            {extraTech > 0 && <li>+{extraTech}</li>}
          </ul>
        )}
      </div>
    </Link>
  );
}

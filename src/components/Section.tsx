import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SectionProps {
  title: string;
  link?: { to: string; label: string };
  children: ReactNode;
}

export function Section({ title, link, children }: SectionProps) {
  return (
    <section className="container-shell py-12">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {link && (
          <Link to={link.to} className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

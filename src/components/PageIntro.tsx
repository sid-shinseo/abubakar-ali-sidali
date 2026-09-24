import type { ReactNode } from 'react';

interface PageIntroProps {
  title: string;
  children?: ReactNode;
}

export function PageIntro({ title, children }: PageIntroProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {children && <div className="mt-4 max-w-2xl leading-7 text-muted-foreground">{children}</div>}
    </div>
  );
}

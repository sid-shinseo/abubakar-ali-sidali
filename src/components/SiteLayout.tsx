import type { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { SocialIconLinks } from '@/components/SocialLinks';
import { profile } from '@/lib/profile';

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="container-shell flex flex-col gap-3 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <div className="flex items-center gap-3">
            <a href={`mailto:${profile.email}`} className="font-mono text-xs transition-colors hover:text-foreground">
              {profile.email}
            </a>
            <SocialIconLinks />
          </div>
        </div>
      </footer>
    </div>
  );
}

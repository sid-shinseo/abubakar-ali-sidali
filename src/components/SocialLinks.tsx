import { siGithub } from 'simple-icons';
import { profile } from '@/lib/profile';
import { cn } from '@/lib/utils';

// LinkedIn's logo was removed from Simple Icons at LinkedIn's request, so its path is inlined.
const linkedinPath =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';

const socialLinks = [
  { name: 'LinkedIn', href: profile.linkedin, handle: profile.linkedinLabel, path: linkedinPath },
  { name: 'GitHub', href: profile.github, handle: profile.githubLabel, path: siGithub.path },
];

function SocialIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('size-4 shrink-0 fill-current', className)}>
      <path d={path} />
    </svg>
  );
}

/** Icon-only links (footer). */
export function SocialIconLinks({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          title={link.name}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <SocialIcon path={link.path} />
        </a>
      ))}
    </div>
  );
}

/** Links with their handle, for the contact details list. */
export function SocialDetailLinks() {
  return (
    <>
      {socialLinks.map((link) => (
        <div key={link.name}>
          <dt className="font-mono text-xs text-muted-foreground">{link.name}</dt>
          <dd className="mt-1">
            <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
              <SocialIcon path={link.path} className="text-muted-foreground" />
              {link.handle}
            </a>
          </dd>
        </div>
      ))}
    </>
  );
}

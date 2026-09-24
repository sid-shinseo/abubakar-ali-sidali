import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { profile } from '@/lib/profile';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/about', label: 'Parcours' },
  { to: '/skills', label: 'Compétences' },
  { to: '/projets', label: 'Projets' },
  { to: '/contact', label: 'Contact' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn('transition-colors hover:text-foreground', isActive ? 'text-foreground' : 'text-muted-foreground');

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { session } = useAuth();
  const links = session.isAuthenticated ? [...navLinks, { to: '/admin', label: 'Admin' }] : navLinks;

  return (
    <header className="border-b">
      <div className="container-shell flex h-16 items-center justify-between">
        <Link to="/" className="font-medium tracking-tight">
          {profile.name}
        </Link>

        <div className="flex items-center gap-2 md:gap-5">
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <ThemeToggle className="text-muted-foreground hover:text-foreground" />

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Ouvrir le menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetHeader>
              <SheetTitle className="text-left">{profile.name}</SheetTitle>
              <SheetDescription className="sr-only">Navigation du site</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col px-4">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setMobileMenuOpen(false)}>
                  <span className="block py-2.5 text-sm">{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        </div>
      </div>
    </header>
  );
}

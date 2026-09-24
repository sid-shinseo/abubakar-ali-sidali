import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Briefcase,
  Cpu,
  ExternalLink,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  UserRound,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { profile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { useAdminData } from './admin-data';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  count?: (data: ReturnType<typeof useAdminData>) => number;
}

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Général',
    items: [{ to: '/admin', label: "Vue d'ensemble", icon: LayoutDashboard }],
  },
  {
    label: 'Contenu du site',
    items: [
      { to: '/admin/projets', label: 'Projets', icon: FolderKanban, count: (d) => d.projects.projects.length },
      { to: '/admin/competences', label: 'Compétences', icon: Cpu, count: (d) => d.skills.skills.length },
      { to: '/admin/parcours', label: 'Parcours', icon: Briefcase, count: (d) => d.experiences.experiences.length },
      { to: '/admin/certifications', label: 'Certifications', icon: Award, count: (d) => d.certifications.certifications.length },
      { to: '/admin/presentation', label: 'Présentation', icon: UserRound },
    ],
  },
  {
    label: 'Échanges',
    items: [{ to: '/admin/messages', label: 'Messages', icon: Inbox, count: (d) => d.messages.messages.filter((m) => !m.read).length }],
  },
];

const allItems = navGroups.flatMap((group) => group.items);

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function AdminSidebar() {
  const data = useAdminData();
  const { session } = useAuth();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const currentPath = useLocation().pathname.replace(/\/$/, '');

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin" onClick={closeOnMobile}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/20 font-mono text-xs font-medium text-primary">
                  {initials(profile.name)}
                </span>
                <span className="grid leading-tight">
                  <span className="truncate text-sm font-medium">{profile.name}</span>
                  <span className="truncate text-xs text-muted-foreground">Administration</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const count = item.count?.(data);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={currentPath === item.to} tooltip={item.label}>
                        <NavLink to={item.to} end onClick={closeOnMobile}>
                          <item.icon />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                      {count !== undefined && count > 0 && (
                        <SidebarMenuBadge className={item.to === '/admin/messages' ? 'rounded-full bg-primary/20 text-primary' : undefined}>
                          {count}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Voir le site">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink />
                <span>Voir le site</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Déconnexion" onClick={() => void handleLogout()}>
              <LogOut />
              <span className="grid leading-tight">
                <span>Déconnexion</span>
                {session.user?.email && <span className="truncate text-xs text-muted-foreground">{session.user.email}</span>}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AdminLayout() {
  const { pathname } = useLocation();
  const current = allItems.find((item) => item.to === pathname.replace(/\/$/, ''));
  usePageTitle(current && current.to !== '/admin' ? `${current.label} · Admin` : 'Administration');

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {current && current.to !== '/admin' ? (
                  <BreadcrumbLink asChild>
                    <Link to="/admin">Administration</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>Administration</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {current && current.to !== '/admin' && (
                <>
                  <BreadcrumbSeparator>/</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{current.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <ThemeToggle className="ml-auto" />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <a href="/" target="_blank" rel="noreferrer">
              Voir le site
            </a>
          </Button>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

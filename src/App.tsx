import { lazy, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SiteLayout } from '@/components/SiteLayout';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePageTitle } from '@/hooks/usePageTitle';
import { HomePage } from '@/pages/HomePage';

// The homepage is in the main bundle (first thing most visitors see); every other page
// is downloaded on demand, and the admin only by the admin.
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const SkillsPage = lazy(() => import('@/pages/SkillsPage').then((m) => ({ default: m.SkillsPage })));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const AdminApp = lazy(() => import('@/pages/admin/AdminApp').then((m) => ({ default: m.AdminApp })));

function NotFoundPage() {
  usePageTitle('Page introuvable');

  return (
    <SiteLayout>
      <div className="container-shell py-24">
        <p className="font-mono text-xs text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="mt-3 text-muted-foreground">Cette adresse ne correspond à aucune page du site.</p>
        <Button asChild variant="outline" className="mt-8">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}

function App() {
  return (
    <TooltipProvider delayDuration={150}>
      {/* The fallback is empty on purpose: chunks are small, a spinner would only flash. */}
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/projets" element={<ProjectsPage />} />
          <Route path="/projets/:slug" element={<ProjectDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}

export default App;

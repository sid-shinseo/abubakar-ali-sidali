import { Navigate, Route, Routes } from 'react-router-dom';
import { AboutPage } from './AboutPage';
import { AdminDataContext, useAdminDataValue } from './admin-data';
import { AdminLayout } from './AdminLayout';
import { CertificationsPage } from './CertificationsPage';
import { ExperiencesPage } from './ExperiencesPage';
import { MessagesPage } from './MessagesPage';
import { OverviewPage } from './OverviewPage';
import { ProjectsPage } from './ProjectsPage';
import { SkillsPage } from './SkillsPage';

/** Everything under /admin. Loaded lazily from App so visitors never download it. */
export function AdminApp() {
  const data = useAdminDataValue();

  return (
    <AdminDataContext.Provider value={data}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="projets" element={<ProjectsPage />} />
          <Route path="competences" element={<SkillsPage />} />
          <Route path="parcours" element={<ExperiencesPage />} />
          <Route path="certifications" element={<CertificationsPage />} />
          <Route path="presentation" element={<AboutPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminDataContext.Provider>
  );
}

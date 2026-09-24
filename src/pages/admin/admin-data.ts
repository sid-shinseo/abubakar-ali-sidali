import { createContext, useContext } from 'react';
import { useAboutMe } from '@/hooks/useAboutMe';
import { useCertifications } from '@/hooks/useCertifications';
import { useContactMessages } from '@/hooks/useContactMessages';
import { useExperiences } from '@/hooks/useExperiences';
import { useProjects } from '@/hooks/useProjects';
import { useSkills } from '@/hooks/useSkills';

const adminProjectQuery = { includeDrafts: true };

/** Loads every admin collection once, so all admin pages (and the sidebar counters) share the same state. */
export function useAdminDataValue() {
  return {
    projects: useProjects(adminProjectQuery),
    skills: useSkills(),
    experiences: useExperiences(),
    certifications: useCertifications(),
    about: useAboutMe(),
    messages: useContactMessages(),
  };
}

export type AdminData = ReturnType<typeof useAdminDataValue>;

export const AdminDataContext = createContext<AdminData | null>(null);

export function useAdminData(): AdminData {
  const value = useContext(AdminDataContext);
  if (!value) throw new Error('useAdminData must be used inside <AdminApp>');
  return value;
}

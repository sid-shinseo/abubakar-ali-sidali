export interface ProjectImage {
  url: string;
  caption: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description?: string | null;
  cover_image_url?: string | null;
  gallery: ProjectImage[];
  tech_stack: string[];
  link_url?: string | null;
  category?: string | null;
  featured: boolean;
  published: boolean;
  /** Where it was done, e.g. "Stage · Weishaupt" or "BTS SIO · Lycée Camille Sée". */
  context: string | null;
  /** Free text, e.g. "Mai – juin 2025". */
  period: string | null;
  /** BTS SIO competency blocks covered (labels from src/lib/bts.ts). */
  competencies: string[];
  /** Experience or training the project was done during. */
  experience_id: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export type ProjectInput = {
  title: string;
  slug: string;
  description: string;
  long_description?: string | null;
  cover_image_url?: string | null;
  gallery?: ProjectImage[];
  tech_stack: string[];
  link_url?: string | null;
  category?: string | null;
  featured?: boolean;
  published?: boolean;
  context?: string | null;
  period?: string | null;
  competencies?: string[];
  experience_id?: string | null;
  order_index?: number;
};

export type SkillLevel = 'notions' | 'autonome' | 'maitrise';

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  level: SkillLevel;
  order_index: number;
  created_at: string;
}

export type SkillInput = {
  name: string;
  category: string;
  description?: string | null;
  level: SkillLevel;
  order_index?: number;
};

export type ExperienceType = 'experience' | 'education';

export interface Experience {
  id: string;
  title: string;
  company: string | null;
  period: string;
  description: string | null;
  location: string | null;
  type: ExperienceType;
  order_index: number;
  created_at: string;
}

export type ExperienceInput = {
  title: string;
  company?: string | null;
  period: string;
  description?: string | null;
  location?: string | null;
  type: ExperienceType;
  order_index?: number;
};

export type CertificationStatus = 'obtenue' | 'en_cours' | 'prevue';

export interface Certification {
  id: string;
  name: string;
  issuer: string | null;
  status: CertificationStatus;
  date_label: string | null;
  credential_url: string | null;
  order_index: number;
  created_at: string;
}

export type CertificationInput = {
  name: string;
  issuer?: string | null;
  status: CertificationStatus;
  date_label?: string | null;
  credential_url?: string | null;
  order_index?: number;
};

export interface AboutMe {
  id: string;
  bio: string;
  title: string;
  location: string;
  availability_status: string;
  cta_enabled: boolean;
  cta_title: string | null;
  cta_text: string | null;
  cv_path: string | null;
  updated_at: string;
}

export type AboutMeInput = {
  bio: string;
  title: string;
  location: string;
  availability_status: string;
  cta_enabled: boolean;
  cta_title: string | null;
  cta_text: string | null;
  cv_path?: string | null;
};

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

export type ContactMessageInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export interface AuthSession {
  user: {
    id: string;
    email?: string;
  } | null;
  isAuthenticated: boolean;
}

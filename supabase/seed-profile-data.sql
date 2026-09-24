-- ============================================================
-- PROFIL D'ABUBAKAR ALI SID-ALI
-- Administrateur Systèmes & Réseaux + Développeur Web Passionné
-- ============================================================

-- Vider les tables existantes (garder les contraintes intactes)
truncate table public.contacts cascade;
truncate table public.skills cascade;
truncate table public.experiences cascade;
truncate table public.projects cascade;
truncate table public.certifications cascade;
delete from public.about_me;

-- ============================================================
-- 1. PROFIL GÉNÉRAL (about_me)
-- ============================================================
insert into public.about_me (title, bio, location, availability_status)
values (
  'Diplômé BTS SIO SISR | Étudiant Administrateur d''Infrastructures Sécurisées (AIS)',
  'Diplômé d''un BTS SIO option SISR avec 15,82/20 de moyenne générale (18/20 aux épreuves professionnelles). Passionné par l''administration système, le réseau, la virtualisation et la cybersécurité. En recherche d''une alternance pour préparer le Titre Professionnel Administrateur d''Infrastructures Sécurisées (AIS). Sur mon temps libre, je suis passionné par l''écosystème web moderne et la conteneurisation (React, Tailwind, Docker).',
  'Colmar, France (Disponible en Alsace)',
  'En recherche active (CDI / alternance)'
)
on conflict do nothing;

-- ============================================================
-- 2. COMPÉTENCES - CATEGORY A: SYSTÈMES, RÉSEAUX & SÉCURITÉ (SISR)
-- ============================================================
insert into public.skills (name, category, description, level, order_index)
values
  ('Linux (Debian, Alpine)', 'Systèmes & Virtualisation', 'Administration Linux, gestion de conteneurs, déploiement de services', 'maitrise', 1),
  ('Windows Server', 'Systèmes & Virtualisation', 'Active Directory, GPO, services réseau Windows', 'maitrise', 2),
  ('VMware ESXi', 'Systèmes & Virtualisation', 'Hyperviseur type 1, gestion de VM, clustering', 'maitrise', 3),
  ('Proxmox VE', 'Systèmes & Virtualisation', 'Infrastructure de virtualisation open-source', 'maitrise', 4),
  ('Docker', 'Systèmes & Virtualisation', 'Conteneurisation, Docker Compose, registries privées', 'maitrise', 5),
  
  ('Routing & Switching (Cisco)', 'Réseau & Sécurité', 'Configuration routeurs/commutateurs, VLAN, spanning-tree', 'maitrise', 6),
  ('Pare-feu pfSense', 'Réseau & Sécurité', 'Firewall, NAT, filtrage, règles de sécurité', 'maitrise', 7),
  ('VPN & Tunneling', 'Réseau & Sécurité', 'OpenVPN, WireGuard, IPSec', 'maitrise', 8),
  ('Segmentation VLAN', 'Réseau & Sécurité', 'Architecture réseau segmentée, isolation trafic', 'maitrise', 9),
  ('PKI & OpenSSL', 'Réseau & Sécurité', 'Certificats numériques, chaînes de confiance, chiffrement', 'maitrise', 10),
  
  ('Active Directory', 'Administration & Services', 'Gestion des utilisateurs, groupes, GPO, authentification', 'maitrise', 11),
  ('DNS & DHCP', 'Administration & Services', 'Configuration serveurs DNS, allocation DHCP, zones', 'maitrise', 12),
  ('SSH & Services réseau', 'Administration & Services', 'Gestion distante sécurisée, protocoles réseau', 'maitrise', 13),
  ('Monitoring & Logs', 'Administration & Services', 'Supervision infrastructure, collecte de logs, alertes', 'maitrise', 14),
  ('Self-hosting & Infra', 'Administration & Services', 'Déploiement infrastructure personnelle, services open-source', 'maitrise', 15),
  
  ('Bash Scripting', 'Outils & Scripting', 'Scripts d''administration, automatisation Linux', 'maitrise', 16),
  ('PowerShell', 'Outils & Scripting', 'Scripting Windows, automatisation administrative', 'maitrise', 17),
  ('Git & GitHub', 'Outils & Scripting', 'Gestion de versions, workflows, collaboration', 'maitrise', 18),
  ('VCDS & Tooling', 'Outils & Scripting', 'Outils spécialisés diagnostics réseau/système', 'autonome', 19);

-- ============================================================
-- 3. COMPÉTENCES - CATEGORY B: DÉVELOPPEMENT WEB & DEVOPS
-- ============================================================
insert into public.skills (name, category, description, level, order_index)
values
  ('React.js & TypeScript', 'Frontend & Web', 'SPAs modernes, hooks, gestion d''état, TypeScript strict', 'maitrise', 20),
  ('JavaScript ES6+', 'Frontend & Web', 'Langage natif, async/await, DOM manipulation', 'maitrise', 21),
  ('HTML5', 'Frontend & Web', 'Sémantique, accessibilité, structure moderne', 'maitrise', 22),
  ('CSS3 & Tailwind', 'Frontend & Web', 'Responsive design, Tailwind CSS, animations', 'maitrise', 23),
  
  ('Supabase', 'Backend & BDD Cloud', 'PostgreSQL cloud, authentification, storage, real-time', 'autonome', 24),
  ('Firebase', 'Backend & BDD Cloud', 'Firestore, Auth, Cloud Functions', 'autonome', 25),
  ('PostgreSQL', 'Backend & BDD Cloud', 'Requêtes SQL, indexes, transactions, relations', 'maitrise', 26),
  
  ('Docker & Compose', 'Conteneurisation & DevOps', 'Dockerfiles, compose stacks, déploiement', 'maitrise', 27),
  ('GitHub Workflows', 'Conteneurisation & DevOps', 'CI/CD, automatisation, tests', 'maitrise', 28);

-- ============================================================
-- 4. FORMATIONS & DIPLÔMES
-- ============================================================
insert into public.experiences (title, company, period, description, location, type, order_index)
values
  ('BTS Services Informatiques aux Organisations - Option SISR',
   'Lycée Camille Sée',
   '2024 - 2026',
   'Obtenu avec 15,82/20 de moyenne générale (18/20 aux épreuves professionnelles). Spécialisation en administration de systèmes, réseaux, virtualisation et sécurité.',
   'Colmar, France',
   'education',
   1),
  
  ('BTS Comptabilité et Gestion',
   'Lycée Camille Sée',
   '2022 - 2024',
   null,
   'Colmar, France',
   'education',
   2),
  
  ('BAC Professionnel Métiers du Commerce et de la Vente',
   'Lycée Martin Schongauer',
   '2019 - 2022',
   null,
   'Colmar, France',
   'education',
   3);

-- ============================================================
-- 5. EXPÉRIENCES PROFESSIONNELLES
-- ============================================================
insert into public.experiences (title, company, period, description, location, type, order_index)
values
  ('Hôte de Caisse - Job étudiant',
   'Castorama',
   'Septembre 2025 - Actuel',
   'Gestion de caisse, relation client, rigueur et travail d''équipe.',
   'Colmar, France',
   'experience',
   1),
  
  ('Stagiaire Administrateur Systèmes & Réseaux',
   'Greta',
   '02 Mars 2026 - 10 Avril 2026',
   'Stage pratique en infrastructure informatique, déploiement d''outils réseau et assistance aux utilisateurs.',
   'Colmar, France',
   'experience',
   2),
  
  ('Stagiaire Informatique & Réseau',
   'Weishaupt',
   '26 Mai 2025 - 27 Juillet 2025',
   'Déploiement de postes de travail, gestion de parc, brassage réseau et suivi informatique.',
   'Colmar, France',
   'experience',
   3),
  
  ('Stagiaire Informatique',
   'Cmexpert',
   'Novembre 2024 - Décembre 2024',
   'Premier stage de découverte et support réseau/système.',
   'Colmar, France',
   'experience',
   4);

-- ============================================================
-- 6. PROJETS PROFESSIONNELS / PERSONNELS
-- ============================================================
insert into public.projects (title, slug, description, long_description, category, tech_stack, cover_image_url, link_url, featured, order_index)
values
  ('Infrastructure Proxmox & Docker Compose',
   'infra-proxmox-docker',
   'Stack de virtualisation complète avec Proxmox et services Docker',
   'Déploiement d''une infrastructure complète de virtualisation avec Proxmox VE, intégration de services Docker (Nginx, PostgreSQL, services applicatifs). Gestion de ressources, réseaux virtuels et haute disponibilité.',
   'Système & Infrastructure',
   ARRAY['Proxmox', 'Docker', 'Docker Compose', 'Linux', 'Networking'],
   null,
   null,
   true,
   1),
  
  ('Laboratoire pfSense & Cybersécurité',
   'lab-pfsense-security',
   'Environnement de test réseau avec pare-feu et sécurité',
   'Configuration d''un environnement de laboratoire complet avec pfSense comme pare-feu central, intégration de services (DNS/DHCP), segmentation VLAN et tests de sécurité réseau.',
   'Réseau & Sécurité',
   ARRAY['pfSense', 'Networking', 'Security', 'VLAN'],
   null,
   null,
   true,
   2),
  
  ('Portfolio Personnel - React & Supabase',
   'portfolio-react-supabase',
   'Site portfolio avec gestion dynamique de contenu via Supabase',
   'Développement d''un portfolio moderne utilisant React + TypeScript, Tailwind CSS et une base de données Supabase comme CMS. Authentification sécurisée et gestion administrative centralisée.',
   'Développement Web',
   ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Git'],
   null,
   'https://github.com',
   true,
   3);

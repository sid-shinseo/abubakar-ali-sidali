-- Schema for the portfolio. Safe to re-run: every object is created idempotently,
-- and the "Migrations" section upgrades a database created with an older version.
-- Profile content lives in seed-profile-data.sql.

create extension if not exists pgcrypto with schema extensions;

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  long_description text,
  cover_image_url text,
  gallery jsonb not null default '[]'::jsonb,
  tech_stack text[] not null default '{}',
  link_url text,
  category text not null default 'Autre',
  featured boolean not null default false,
  published boolean not null default true,
  context text,
  period text,
  competencies text[] not null default '{}',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Autre',
  description text,
  level text not null default 'autonome',
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text,
  period text not null,
  description text,
  location text,
  type text not null check (type in ('experience', 'education')),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text,
  status text not null default 'obtenue' check (status in ('obtenue', 'en_cours', 'prevue')),
  date_label text,
  credential_url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.about_me (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  bio text not null,
  location text not null default 'Colmar, France',
  availability_status text not null default 'Disponible',
  cta_enabled boolean not null default true,
  cta_title text,
  cta_text text,
  cv_path text,
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Migrations (for databases created with an older schema)
-- ============================================================

alter table public.projects add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists published boolean not null default true;
alter table public.projects add column if not exists context text;
alter table public.projects add column if not exists period text;
alter table public.projects add column if not exists competencies text[] not null default '{}';
-- Experience or training the project was done during (shown in its pop-up on the Parcours page).
alter table public.projects add column if not exists experience_id uuid references public.experiences(id) on delete set null;

alter table public.about_me add column if not exists cta_enabled boolean not null default true;
alter table public.about_me add column if not exists cta_title text;
alter table public.about_me add column if not exists cta_text text;
alter table public.about_me add column if not exists cv_path text;

alter table public.skills add column if not exists order_index integer not null default 0;
alter table public.skills add column if not exists level text;

-- Percentages (0-100) become levels: notions / autonome / maitrise.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'skills' and column_name = 'level_percentage'
  ) then
    update public.skills
    set level = case
      when level_percentage >= 85 then 'maitrise'
      when level_percentage >= 60 then 'autonome'
      else 'notions'
    end
    where level is null;
    alter table public.skills drop column level_percentage;
  end if;
end $$;

update public.skills set level = 'autonome' where level is null;
alter table public.skills alter column level set default 'autonome';
alter table public.skills alter column level set not null;
alter table public.skills drop constraint if exists skills_level_check;
alter table public.skills add constraint skills_level_check check (level in ('notions', 'autonome', 'maitrise'));

-- The emoji icon column is no longer used (logos are resolved from the skill name).
alter table public.skills drop column if exists icon;

-- ============================================================
-- Contact form protection
-- ============================================================

-- Length limits ("not valid" keeps any older rows, but applies to every new message).
alter table public.contacts drop constraint if exists contacts_name_length;
alter table public.contacts add constraint contacts_name_length check (char_length(name) between 1 and 100) not valid;
alter table public.contacts drop constraint if exists contacts_email_format;
alter table public.contacts add constraint contacts_email_format
  check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') not valid;
alter table public.contacts drop constraint if exists contacts_subject_length;
alter table public.contacts add constraint contacts_subject_length check (char_length(subject) between 1 and 150) not valid;
alter table public.contacts drop constraint if exists contacts_message_length;
alter table public.contacts add constraint contacts_message_length check (char_length(message) between 10 and 5000) not valid;

-- Sender IP, stored only as a salted hash (unreadable) to rate-limit per visitor.
alter table public.contacts add column if not exists ip_hash text;

-- Private schema: not exposed by the Supabase API, only reachable from SQL and security definer functions.
create schema if not exists private;
revoke all on schema private from anon, authenticated;

create table if not exists private.app_secrets (
  key text primary key,
  value text not null
);
-- Random salt generated once per database: without it, an IP hash could be reversed by brute force.
insert into private.app_secrets (key, value)
values ('contact_ip_salt', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;

-- Anti-spam checks + server-side defaults. Runs as the table owner so it can count rows
-- anonymous visitors cannot read. Applies to every insert, including direct API calls that skip the form.
create or replace function public.contacts_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  headers json;
  client_ip text;
begin
  -- 1. Content: spam is usually stuffed with links.
  if (
    select count(*) from regexp_matches(new.name || ' ' || new.subject || ' ' || new.message, 'https?://|www\.', 'gi')
  ) > 3 then
    raise exception 'Votre message contient trop de liens. Retirez-en quelques-uns et réessayez.' using errcode = 'P0001';
  end if;

  -- 2. Per visitor: the API gives the request headers; the first address of x-forwarded-for is the sender.
  headers := nullif(current_setting('request.headers', true), '')::json;
  client_ip := trim(split_part(coalesce(headers ->> 'x-forwarded-for', headers ->> 'x-real-ip', ''), ',', 1));

  if client_ip <> '' then
    new.ip_hash := encode(
      extensions.digest(client_ip || (select value from private.app_secrets where key = 'contact_ip_salt'), 'sha256'),
      'hex'
    );

    if (
      select count(*) from public.contacts
      where ip_hash = new.ip_hash and created_at > now() - interval '1 hour'
    ) >= 3 then
      raise exception 'Vous avez déjà envoyé plusieurs messages. Réessayez dans une heure.' using errcode = 'P0001';
    end if;

    if (
      select count(*) from public.contacts
      where ip_hash = new.ip_hash and created_at > now() - interval '1 day'
    ) >= 10 then
      raise exception 'Limite de messages atteinte pour aujourd''hui. Réessayez demain.' using errcode = 'P0001';
    end if;
  else
    new.ip_hash := null;
  end if;

  -- 3. Per email address (catches the same sender changing network).
  if (
    select count(*) from public.contacts
    where lower(email) = lower(new.email) and created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'Trop de messages envoyés depuis cette adresse. Réessayez dans quelques minutes.' using errcode = 'P0001';
  end if;

  -- 4. Global safety net, whatever the sender.
  if (select count(*) from public.contacts where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Trop de messages reçus en peu de temps. Réessayez plus tard.' using errcode = 'P0001';
  end if;

  -- Visitors cannot choose these values.
  new.read := false;
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists trg_contacts_before_insert on public.contacts;
create trigger trg_contacts_before_insert
before insert on public.contacts
for each row execute procedure public.contacts_before_insert();

-- ============================================================
-- RLS
-- ============================================================

alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.certifications enable row level security;
alter table public.about_me enable row level security;
alter table public.contacts enable row level security;

-- ============================================================
-- updated_at triggers
-- ============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_about_me_updated_at on public.about_me;
create trigger trg_about_me_updated_at
before update on public.about_me
for each row execute procedure public.set_updated_at();

-- ============================================================
-- Policies: public read, writes for authenticated users.
-- NOTE: "authenticated" means any Supabase account, so disable public
-- sign-ups in Authentication > Providers > Email.
-- ============================================================

-- projects: drafts (published = false) are only visible when logged in
drop policy if exists "Projects are viewable by everyone" on public.projects;
create policy "Projects are viewable by everyone"
on public.projects for select
using (published or auth.uid() is not null);

drop policy if exists "Projects are editable by authenticated users" on public.projects;
create policy "Projects are editable by authenticated users"
on public.projects for insert
with check (auth.uid() is not null);

drop policy if exists "Projects can be updated by authenticated users" on public.projects;
create policy "Projects can be updated by authenticated users"
on public.projects for update
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "Projects can be deleted by authenticated users" on public.projects;
create policy "Projects can be deleted by authenticated users"
on public.projects for delete
using (auth.uid() is not null);

-- skills
drop policy if exists "Skills are viewable by everyone" on public.skills;
create policy "Skills are viewable by everyone"
on public.skills for select
using (true);

drop policy if exists "Skills are editable by authenticated users" on public.skills;
create policy "Skills are editable by authenticated users"
on public.skills for insert
with check (auth.uid() is not null);

drop policy if exists "Skills can be updated by authenticated users" on public.skills;
create policy "Skills can be updated by authenticated users"
on public.skills for update
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "Skills can be deleted by authenticated users" on public.skills;
create policy "Skills can be deleted by authenticated users"
on public.skills for delete
using (auth.uid() is not null);

-- experiences
drop policy if exists "Experiences are viewable by everyone" on public.experiences;
create policy "Experiences are viewable by everyone"
on public.experiences for select
using (true);

drop policy if exists "Experiences are editable by authenticated users" on public.experiences;
create policy "Experiences are editable by authenticated users"
on public.experiences for insert
with check (auth.uid() is not null);

drop policy if exists "Experiences can be updated by authenticated users" on public.experiences;
create policy "Experiences can be updated by authenticated users"
on public.experiences for update
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "Experiences can be deleted by authenticated users" on public.experiences;
create policy "Experiences can be deleted by authenticated users"
on public.experiences for delete
using (auth.uid() is not null);

-- certifications
drop policy if exists "Certifications are viewable by everyone" on public.certifications;
create policy "Certifications are viewable by everyone"
on public.certifications for select
using (true);

drop policy if exists "Certifications are editable by authenticated users" on public.certifications;
create policy "Certifications are editable by authenticated users"
on public.certifications for insert
with check (auth.uid() is not null);

drop policy if exists "Certifications can be updated by authenticated users" on public.certifications;
create policy "Certifications can be updated by authenticated users"
on public.certifications for update
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "Certifications can be deleted by authenticated users" on public.certifications;
create policy "Certifications can be deleted by authenticated users"
on public.certifications for delete
using (auth.uid() is not null);

-- about_me
drop policy if exists "About section is viewable by everyone" on public.about_me;
create policy "About section is viewable by everyone"
on public.about_me for select
using (true);

drop policy if exists "About section is editable by authenticated users" on public.about_me;
create policy "About section is editable by authenticated users"
on public.about_me for insert
with check (auth.uid() is not null);

drop policy if exists "About section can be updated by authenticated users" on public.about_me;
create policy "About section can be updated by authenticated users"
on public.about_me for update
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "About section can be deleted by authenticated users" on public.about_me;
create policy "About section can be deleted by authenticated users"
on public.about_me for delete
using (auth.uid() is not null);

-- contacts: anyone can send, only the admin can read/manage
drop policy if exists "Contacts are insertable by everyone" on public.contacts;
create policy "Contacts are insertable by everyone"
on public.contacts for insert
with check (true);

drop policy if exists "Contacts are readable by authenticated users" on public.contacts;
create policy "Contacts are readable by authenticated users"
on public.contacts for select
using (auth.uid() is not null);

drop policy if exists "Contacts can be updated by authenticated users" on public.contacts;
create policy "Contacts can be updated by authenticated users"
on public.contacts for update
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "Contacts can be deleted by authenticated users" on public.contacts;
create policy "Contacts can be deleted by authenticated users"
on public.contacts for delete
using (auth.uid() is not null);

-- ============================================================
-- Storage
--   project-covers: project covers and diagrams (images, SVG included)
--   documents: the downloadable CV (PDF)
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-covers', 'project-covers', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', true, 10485760, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Project covers are viewable by everyone" on storage.objects;
drop policy if exists "Project covers are uploadable by authenticated users" on storage.objects;
drop policy if exists "Project covers can be updated by authenticated users" on storage.objects;
drop policy if exists "Project covers can be deleted by authenticated users" on storage.objects;

drop policy if exists "Portfolio files are viewable by everyone" on storage.objects;
create policy "Portfolio files are viewable by everyone"
on storage.objects for select
using (bucket_id in ('project-covers', 'documents'));

drop policy if exists "Portfolio files are uploadable by authenticated users" on storage.objects;
create policy "Portfolio files are uploadable by authenticated users"
on storage.objects for insert
with check (bucket_id in ('project-covers', 'documents') and auth.uid() is not null);

drop policy if exists "Portfolio files can be updated by authenticated users" on storage.objects;
create policy "Portfolio files can be updated by authenticated users"
on storage.objects for update
using (bucket_id in ('project-covers', 'documents') and auth.uid() is not null);

drop policy if exists "Portfolio files can be deleted by authenticated users" on storage.objects;
create policy "Portfolio files can be deleted by authenticated users"
on storage.objects for delete
using (bucket_id in ('project-covers', 'documents') and auth.uid() is not null);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_projects_featured_order on public.projects(featured, order_index);
create index if not exists idx_projects_category on public.projects(category);
create index if not exists idx_projects_experience on public.projects(experience_id);
create index if not exists idx_skills_category on public.skills(category);
create index if not exists idx_experiences_type_order on public.experiences(type, order_index);
create index if not exists idx_certifications_order on public.certifications(order_index);
create index if not exists idx_contacts_created_at on public.contacts(created_at desc);
create index if not exists idx_contacts_email_created_at on public.contacts(lower(email), created_at desc);
create index if not exists idx_contacts_ip_created_at on public.contacts(ip_hash, created_at desc);

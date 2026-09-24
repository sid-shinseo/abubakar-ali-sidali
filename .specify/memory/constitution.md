# Portfolio Constitution

**Version**: 1.1.0 | **Ratified**: 2026-08-16 | **Last Amended**: 2026-09-23

## Core Principles

### I. Strict Type Safety & Clean Architecture
Every component, utility, hook, and database response must be fully typed using TypeScript. The use of `any` is strictly prohibited. The project must maintain a modular separation of concerns between UI components (`src/components`, shadcn/ui primitives in `src/components/ui`), pages (`src/pages`, admin screens in `src/pages/admin`), data hooks (`src/hooks`, built on the generic `useTable`), and external services (`src/lib/supabase.ts`, `src/lib/storage.ts`). Authentication state is read through the `useAuth` hook; admin screens share their data through the admin data context (`src/pages/admin/admin-data.ts`).

### II. Authentication & Admin Security
The `/admin` routes, along with all content creation, modification, and deletion mechanisms, must be strictly protected behind authentication using Supabase Auth. Unauthenticated visitors attempting to access protected routes must be redirected to `/login`. Row Level Security policies in `supabase/portfolio-schema.sql` are the real protection; public sign-ups must stay disabled in Supabase. Environment variables must be loaded via Vite's secure environment handling, and secret keys must never be exposed to the browser.

### III. Dynamic CRUD & Storage Persistence
Adding, updating, reordering, or deleting portfolio content must be performed through the `/admin` interface and persisted directly in the Supabase PostgreSQL database without requiring code modifications or redeployment. Projects can be kept as drafts until published. Images are compressed in the browser (WebP, 1920 px max) before being uploaded to Supabase Storage and served via public URLs; files that are no longer referenced are deleted from storage. The schema file must stay idempotent so it can be re-run safely.

### IV. User Experience & Responsive Design
The application must feature a mobile-first, responsive design with dark mode enabled by default using Tailwind CSS and shadcn/ui. The visual style stays sober: no emojis, no arrow characters in links, soft shadows, a single muted violet accent; technologies show their official logo or a matching generic icon. All asynchronous operations (data fetching, authentication, uploads) must include visual feedback such as loading indicators and actionable error states.

## Governance

### Modification Protocol
Any changes to these core principles require an explicit update to this constitution file using the `/speckit-constitution` command before implementing related tasks.

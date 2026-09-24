# Portfolio · Abubakar Ali Sid-Ali

Portfolio d'un administrateur systèmes, réseaux et sécurité (BTS SIO option SISR), en recherche d'alternance pour le Titre Professionnel Administrateur d'Infrastructures Sécurisées (AIS).

**Site : [sidali-abubakar.vercel.app](https://sidali-abubakar.vercel.app)**

Le contenu (projets, compétences, parcours, certifications, présentation, CV) est entièrement modifiable depuis un espace d'administration, sans toucher au code.

## Fonctionnalités

**Site public**
- Accueil, parcours, compétences, projets et contact
- Projets filtrables par catégorie, cadre (stage, formation) et technologie, avec schémas d'infrastructure et compétences BTS SIO mobilisées
- Parcours interactif : chaque expérience ou formation ouvre la liste des projets réalisés pendant celle-ci
- Logos officiels des technologies ([Simple Icons](https://simpleicons.org)), niveaux de compétence expliqués au survol
- CV téléchargeable, formulaire de contact protégé contre le spam (champ piège, limites en base, limitation de débit)
- Aperçu pour LinkedIn, sitemap, thème sombre, responsive

**Administration** (`/admin`, protégée par Supabase Auth)
- Tableau de bord : chiffres clés, derniers messages, contenu à compléter
- Gestion des projets (brouillons, galerie de schémas, images compressées en WebP dans le navigateur), des compétences, du parcours, des certifications et de la présentation
- Ordre d'affichage par glisser-déposer
- Boîte de réception des messages, notification par email (Supabase Edge Function + Resend)

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · shadcn/ui · Supabase (PostgreSQL, Auth, Storage, Edge Functions) · Vercel

## Démarrer en local

Prérequis : Node.js 20.19 ou plus récent.

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés Supabase
npm run dev                  # http://localhost:5173
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Vérification TypeScript et build de production dans `dist/` |
| `npm run lint` | ESLint |
| `npm run brand` | Régénère le favicon et l'image d'aperçu (`public/`) |
| `npm run projects` | Régénère les couvertures, schémas et scripts SQL des projets BTS |

## Structure

```
src/
  components/        composants du site (ui/ = composants shadcn)
  hooks/             accès aux données (useTable générique + un hook par table)
  lib/               Supabase, stockage, logos, profil, utilitaires
  pages/             pages publiques
  pages/admin/       espace d'administration
supabase/
  portfolio-schema.sql            schéma, sécurité (RLS), stockage : relançable sans risque
  projects-bts-sio.sql            import des projets BTS SIO (généré)
  link-projects-experiences.sql   liaison projets / parcours (généré)
  functions/notify-contact/       Edge Function d'email à chaque message
scripts/             génération des images et des scripts SQL
public/              favicon, image d'aperçu, couvertures et schémas des projets
```

La mise en place complète (base de données, GitHub, Vercel, emails, statistiques) est décrite dans [SETUP.md](SETUP.md).

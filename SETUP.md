# Mise en place et mise en ligne

Guide de référence pour installer, publier et maintenir le portfolio. Les commandes sont pour **PowerShell**, lancées depuis le dossier du projet :

```powershell
cd D:\Projets-Web\portfolio
```

## Avancement

- [x] 1. Base de données Supabase
- [x] 2. Compte administrateur
- [ ] 3. Test en local
- [ ] 4. Dépôt GitHub
- [ ] 5. Vercel et adresse du site
- [ ] 6. Contenu à finaliser dans l'admin
- [x] 7. Email à chaque nouveau message (Resend)
- [ ] 8. Statistiques de visite (optionnel)

> Après la mise à jour anti-spam, relancer une fois `supabase/portfolio-schema.sql` (étape 1.1).

---

## 1. Base de données Supabase

### 1.1 Scripts SQL

Dans Supabase > **SQL Editor**, coller puis exécuter chaque fichier, **dans cet ordre** :

| Ordre | Fichier | Rôle | Relançable |
|---|---|---|---|
| 1 | `supabase/portfolio-schema.sql` | Tables, sécurité (RLS), stockage, protections anti-spam du formulaire. | Oui, sans risque |
| 2 | `supabase/projects-bts-sio.sql` | Remplace les projets par ceux du BTS SIO (garde « Portfolio Personnel - React & Supabase »). | **Non** : écrase les projets modifiés depuis l'admin |
| 3 | `supabase/link-projects-experiences.sql` | Relie chaque projet à son expérience ou sa formation, puis affiche un tableau de contrôle. | Oui |

`portfolio-schema.sql` est à relancer à chaque fois qu'il est modifié : il met la base à jour sans toucher au contenu.

> `supabase/seed-profile-data.sql` **vide toutes les tables** avant de les remplir : ne l'exécuter que pour repartir de zéro.

### 1.2 Fermer les inscriptions

Supabase > **Authentication > Sign In / Providers > Email** : désactiver **Allow new users to sign up**. Sans ça, n'importe qui peut créer un compte et modifier le site.

## 2. Compte administrateur

Supabase > **Authentication > Users > Add user > Create new user**, avec ton email et un mot de passe solide, en cochant **Auto Confirm User**. C'est ce compte qui se connecte sur `/login`.

## 3. Test en local

### 3.1 Fichier `.env.local`

Il contient l'adresse et la clé publique de la base Supabase. Il reste sur ton PC et n'est **jamais envoyé sur GitHub**.

- S'il existe déjà : rien à faire.
- Sinon (nouveau PC, projet récupéré depuis GitHub) : `Copy-Item .env.example .env.local`, puis y coller les valeurs de Supabase > **Project Settings > API** (Project URL et clé `anon public`).

### 3.2 Lancer le site

```powershell
npm install
npm run dev
```

Ouvrir http://localhost:5173, vérifier les pages, puis `/login` et l'admin. Arrêter le serveur avec **Ctrl+C**.

> Erreur « l'exécution de scripts est désactivée sur ce système » : c'est un réglage de Windows. Lancer une fois `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, répondre `O`, puis recommencer.

### 3.3 Vérifier avant de publier

```powershell
npm run lint
npm run build
```

Les deux doivent se terminer sans erreur.

## 4. Dépôt GitHub

### 4.1 Installer Git (une seule fois)

Installer Git depuis [git-scm.com/download/win](https://git-scm.com/download/win) (options par défaut), **fermer puis rouvrir VS Code**, puis :

```powershell
git --version
git config --global user.name "Sid-Ali Abubakar Ali"
git config --global user.email "128588839+sid-shinseo@users.noreply.github.com"
```

C'est l'adresse anonyme fournie par GitHub pour le compte [sid-shinseo](https://github.com/sid-shinseo) (visible dans GitHub > **Settings > Emails**) : elle relie les commits à ton profil sans révéler ton vrai email. Avec une adresse privée, GitHub refuse le `push` (erreur `GH007`). L'email de contact affiché sur le site reste `sidali.abubakarali@gmail.com`.

### 4.2 Créer le dépôt

Sur [github.com/new](https://github.com/new) : nom `abubakar-ali-sidali`, **Public**, **ne rien cocher** (ni README, ni .gitignore, ni licence).

### 4.3 Premier envoi

```powershell
git init -b main
git add .
git status
```

Dans la liste affichée, vérifier que **`.env.local`, `node_modules`, `dist` et `supabase/.temp` n'apparaissent pas**. Puis :

```powershell
git commit -m "Portfolio : refonte complète (React, Supabase, shadcn/ui)"
git remote add origin https://github.com/sid-shinseo/abubakar-ali-sidali.git
git push -u origin main
```

Au premier `push`, une fenêtre de connexion GitHub s'ouvre : se connecter dans le navigateur.

### 4.4 Mises à jour suivantes

```powershell
git add .
git commit -m "Description courte de la modification"
git push
```

Une fois Vercel branché (étape 5), chaque `push` met le site en ligne automatiquement.

## 5. Vercel et adresse du site

Objectif : **réutiliser le projet Vercel existant** pour que l'ancienne adresse `portfolio-abubakar-ali-sidali.vercel.app` (tableau de synthèse E6, CV) continue de fonctionner, et passer à l'adresse courte `sidali-abubakar.vercel.app`.

### 5.1 Brancher le nouveau dépôt

Vercel > ton projet actuel > **Settings > Git** > **Disconnect**, puis **Connect Git Repository** > `sid-shinseo/abubakar-ali-sidali`.

Le nom du dépôt GitHub ne change pas l'adresse du site : elle vient du nom du projet Vercel et des domaines ajoutés (étape 5.4).

Si ça pose problème : **Add New > Project** > importer `abubakar-ali-sidali` (Vercel détecte Vite tout seul). Le nom de projet proposé devient l'adresse par défaut : tu peux le changer à ce moment-là. Puis faire l'étape 5.4 sur ce nouveau projet.

### 5.2 Réglages de build

- **Settings > Build and Deployment** : Framework **Vite**, Build Command `npm run build`, Output Directory `dist`.
- **Settings > General** : Node.js Version **22.x**.

### 5.3 Variables d'environnement

**Settings > Environment Variables**, cocher Production, Preview et Development :

| Nom | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | la même que dans `.env.local` |
| `VITE_SUPABASE_ANON_KEY` | la même que dans `.env.local` |
| `VITE_SITE_URL` | `https://sidali-abubakar.vercel.app` |
| `VITE_UMAMI_SCRIPT_URL`, `VITE_UMAMI_WEBSITE_ID` | étape 8 (optionnel) |

Puis **Deployments** > dernier déploiement > **⋯ > Redeploy** : les variables ne s'appliquent qu'aux nouveaux déploiements.

### 5.4 Adresses

**Settings > Domains** :
1. **Add Domain** : `sidali-abubakar.vercel.app`. S'il est pris, choisir une variante et mettre la même dans `VITE_SITE_URL`.
2. Sur l'ancienne adresse `portfolio-abubakar-ali-sidali.vercel.app` : **Edit** > **Redirect to** `sidali-abubakar.vercel.app` (308).

Les deux adresses mènent au site ; seule la nouvelle s'affiche. `vercel.json` évite les erreurs 404 quand on rafraîchit une page comme `/projets`.

### 5.5 Vérifications

- Parcourir le site sur ordinateur et téléphone, tester `/login`.
- Envoyer un message depuis la page Contact et vérifier l'email reçu.
- `https://sidali-abubakar.vercel.app/sitemap.xml` doit lister les pages et les projets.
- Aperçu LinkedIn : [Post Inspector](https://www.linkedin.com/post-inspector/) avec l'adresse du site.
- Google : [Search Console](https://search.google.com/search-console) > ajouter le site > **Sitemaps** > `sitemap.xml`.

## 6. Contenu à finaliser dans l'admin

- **Présentation** : déposer le CV en PDF, vérifier titre, bio, disponibilité et encadré de recherche.
- **Compétences** : répartir honnêtement les niveaux (Notions, Autonome, Maîtrise).
- **Projets** : relire les textes, remplacer les schémas par les tiens si besoin (bouton « Remplacer »).
- **Parcours** : vérifier que les expériences et formations correspondent au CV.
- **Certifications** : ajouter le CCNA avec le statut « Prévue » ou « En préparation ».

La **Vue d'ensemble** de l'admin liste ce qui reste à compléter.

## 7. Email à chaque nouveau message (Resend)

Déjà en place. Cette section sert à le refaire (nouveau projet Supabase, changement de clé).

**Comment ça marche** : un message est enregistré dans la table `contacts` → le **webhook** Supabase appelle la fonction **`notify-contact`** (`supabase/functions/notify-contact/index.ts`) → la fonction envoie l'email via **Resend**. Au-delà de 20 messages en 24 heures, un seul email d'alerte est envoyé puis les notifications s'arrêtent (les messages restent dans l'admin).

`<ref>` = identifiant du projet Supabase, visible dans son adresse `https://<ref>.supabase.co`.

1. [Resend](https://resend.com) : compte créé **avec l'adresse qui reçoit les notifications**, puis **API Keys > Create API Key** (Sending access).
2. Déployer la fonction :

   ```powershell
   npx supabase login
   npx supabase functions deploy notify-contact --project-ref <ref> --no-verify-jwt
   ```

3. Générer un secret de webhook :

   ```powershell
   [guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
   ```

4. Enregistrer les réglages (à taper soi-même, ne jamais mettre ces valeurs dans un fichier du projet) :

   ```powershell
   npx supabase secrets set --project-ref <ref> RESEND_API_KEY=<cle-resend> NOTIFY_EMAIL=sidali.abubakarali@gmail.com WEBHOOK_SECRET=<secret>
   npx supabase secrets list --project-ref <ref>
   ```

5. Supabase > **Integrations** (icône des quatre carrés) > **Database Webhooks** > **Create a new hook** :
   - Table `contacts`, événement **Insert** uniquement
   - Type **Supabase Edge Functions**, fonction `notify-contact`, méthode POST
   - HTTP Headers : garder `Content-type: application/json`, **Add header** `x-webhook-secret` = le secret de l'étape 3
6. Tester depuis la page Contact. En cas de problème : **Edge Functions > notify-contact > Logs**.

**Changer uniquement la clé Resend** : `npx supabase secrets set --project-ref <ref> RESEND_API_KEY=<nouvelle-cle>` (pas besoin de redéployer).

**Changer le secret du webhook** : relancer `secrets set` avec un nouveau `WEBHOOK_SECRET`, puis mettre la même valeur dans l'en-tête du webhook.

## 8. Statistiques de visite (optionnel)

1. Compte gratuit sur [cloud.umami.is](https://cloud.umami.is) > **Add website** avec l'adresse du site.
2. Sur Vercel : `VITE_UMAMI_WEBSITE_ID` = le **Website ID**, `VITE_UMAMI_SCRIPT_URL` = `https://cloud.umami.is/script.js`, puis **Redeploy**.

Sans cookie ni bandeau de consentement. Les pages `/admin` et `/login` ne sont jamais comptées.

---

## Annexe A : protections du formulaire de contact

Appliquées par la base, même si quelqu'un contourne le formulaire :

| Protection | Limite |
|---|---|
| Par visiteur (IP enregistrée sous forme d'empreinte illisible) | 3 messages par heure, 10 par jour |
| Par adresse email | 3 messages toutes les 10 minutes |
| Global | 30 messages par heure |
| Liens | Message refusé au-delà de 3 liens |
| Longueurs | Nom 100, sujet 150, message 10 à 5000 caractères |

Côté formulaire : champ piège invisible et délai minimum de 3 secondes contre les robots simples. Côté email : 20 notifications maximum par 24 heures.

## Annexe B : ce qui ne va jamais sur GitHub

Exclus par `.gitignore` : `.env.local` (clés Supabase), `node_modules`, `dist`, `supabase/.temp` (fichiers du CLI Supabase), `.vscode`, `.continue`.

Les secrets (clé Resend, secret du webhook) sont stockés **dans Supabase** avec `supabase secrets set`, jamais dans les fichiers. La clé `anon` de Supabase est publique par conception : la sécurité repose sur les règles RLS de `portfolio-schema.sql`.

## Annexe C : régénérer les images

| Commande | Quand |
|---|---|
| `npm run brand` | Changement de nom, de titre ou de couleurs : favicon et image d'aperçu LinkedIn. |
| `npm run projects` | Modification de `scripts/generate-bts-projects.mjs` : couvertures, schémas et scripts SQL des projets. |

Ensuite : `git add .`, `git commit -m "…"`, `git push`.

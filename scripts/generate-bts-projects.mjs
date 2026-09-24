// Generates the BTS SIO projects from a single source of truth:
//   - public/projects/<slug>.png          cover of each project
//   - public/projects/ap1-schema.png, ap2-schema.png   network diagrams (redrawn from the E6 sheets)
//   - supabase/projects-bts-sio.sql       replaces the projects in the database (keeps the portfolio project)
// Run with: npm run projects
//
// Content comes from the E6 "fiches de réalisation" and the synthesis table.
// Credentials and the candidate number from those documents are deliberately NOT published.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import * as simpleIcons from 'simple-icons';
import { btsCompetencies } from '../src/lib/bts.ts';

const [PATRIMOINE, INCIDENTS, , PROJET, SERVICE, DEV_PRO] = btsCompetencies;

const KEPT_PROJECT_SLUG = 'portfolio-react-supabase';

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const CTX_AP = 'BTS SIO · Atelier de professionnalisation';
const CTX_BTS = 'BTS SIO · Lycée Camille Sée';
const CTX_WEISHAUPT = 'Stage · Weishaupt';
const CTX_GRETA = 'Stage · GRETA Alsace Sud';

const CAT_INFRA = 'Infrastructure & virtualisation';
const CAT_NET = 'Réseau & sécurité';
const CAT_SERVICES = 'Services & automatisation';
const CAT_SUPERVISION = 'Supervision & parc';
const CAT_SUPPORT = 'Déploiement & support';
const CAT_WEB = 'Veille & web';

/** cover: logos (Simple Icons slug, "windows") or generic icons ("icon:<lucide name>"), plus a keyword line. */
const projects = [
  {
    slug: 'ap1-infrastructure-haute-disponibilite-socodevl',
    title: 'Infrastructure multisite haute disponibilité (SoCoDevl)',
    category: CAT_INFRA,
    context: `${CTX_AP} n°1 · en équipe`,
    period: 'Sept. – déc. 2025',
    featured: true,
    description:
      "Refonte complète du SI d'une entreprise : pare-feu pfSense redondants (CARP), Active Directory, stockage TrueNAS RAID-Z1, GPO, GLPI, déploiement Clonezilla, supervision Zabbix et site distant relié en VPN.",
    longDescription: `Atelier de professionnalisation n°1 du BTS SIO, mené en équipe avec Manuel Montoya sur 12 semaines (tableau Kanban Trello et diagramme de Gantt). L'entreprise SoCoDevl disposait d'un système d'information obsolète et fragmenté : il fallait garantir la haute disponibilité des accès, centraliser les données, industrialiser le parc et tout superviser.

Haute disponibilité réseau
Deux pare-feu pfSense partagent une adresse IP virtuelle CARP (192.168.1.254). pfsync réplique la table d'états et XMLRPC les règles de filtrage : si le pare-feu principal tombe, le secours reprend le trafic en moins d'une seconde, sans coupure pour les utilisateurs.

Identités et stockage
Contrôleur de domaine Windows Server 2022 (AD DS, DNS, DHCP) pour le domaine socodevi.fr. NAS TrueNAS SCALE en RAID-Z1, joint à l'Active Directory, avec des partages SMB et des ACL qui séparent un dossier commun des dossiers personnels.

Industrialisation du parc
Unités d'organisation et GPO : installation silencieuse de Firefox depuis un partage masqué, fond d'écran imposé, restrictions du panneau de configuration et lecteurs réseau montés selon l'utilisateur. Image master Windows 10 capturée puis redéployée avec Clonezilla : un poste est livré en moins de 15 minutes au lieu de plusieurs heures.

Parc et helpdesk
GLPI 10 sur Debian (LAMP) relié à l'Active Directory. L'agent GLPI est empaqueté en MSI et déployé par GPO : l'inventaire matériel et logiciel de tout le parc remonte automatiquement.

Cloud hybride, supervision et ToIP
Pont de niveau 2 OpenVPN (mode TAP) vers un site distant VMware ESXi / vCenter, supervision Zabbix (processeur, mémoire, disque, état CARP) et téléphonie sur IP avec Asterisk.`,
    techStack: ['pfSense', 'Windows Server 2022', 'Active Directory', 'TrueNAS', 'GLPI', 'Clonezilla', 'OpenVPN', 'VMware ESXi', 'Zabbix', 'Asterisk', 'Debian'],
    competencies: [PATRIMOINE, INCIDENTS, PROJET, SERVICE],
    cover: { logos: ['pfsense', 'windows', 'truenas', 'openvpn'], keywords: 'CARP · AD DS · RAID-Z1 · GPO · GLPI · Zabbix' },
    gallery: [{ file: 'ap1-schema', caption: 'Topologie de l’infrastructure SoCoDevl : pare-feu redondants, services du LAN et site distant.' }],
  },
  {
    slug: 'ap2-infrastructure-byod-securisee',
    title: 'Infrastructure BYOD sécurisée (SIO-Formations)',
    category: CAT_NET,
    context: `${CTX_AP} n°2 · seul`,
    period: 'Janv. – mai 2026',
    featured: true,
    description:
      'Accès réseau pour appareils personnels : zones pfSense étanches, portail captif authentifié par RADIUS (NPS) sur l’Active Directory, Nextcloud et messagerie en DMZ, supervision Zabbix 7.4.',
    longDescription: `Atelier de professionnalisation n°2 du BTS SIO, réalisé seul. L'organisme accueille des stagiaires et des formateurs avec leurs propres appareils (BYOD), qui ne peuvent pas rejoindre le domaine. Il fallait isoler l'environnement d'administration, authentifier nominativement chaque utilisateur avant tout accès à Internet (obligation légale de traçabilité) et fournir des outils collaboratifs.

Segmentation et filtrage
pfSense découpe le réseau en zones étanches : LAN d'administration (192.168.2.0/24), DMZ pour les services exposés, Wi-Fi BYOD (10.0.0.0/24) et WAN. Le Wi-Fi n'a accès qu'au web (HTTP/HTTPS) ; la DMZ n'ouvre vers le LAN que les flux nécessaires, comme LDAP (TCP 389).

Authentification des utilisateurs
Active Directory avec unités d'organisation et groupes (élèves, formateurs). Rôle NPS en serveur RADIUS, avec des stratégies d'accès selon le groupe. Portail captif pfSense adossé à RADIUS : toute connexion Wi-Fi est redirigée vers une authentification nominative, avec délais d'inactivité et de session.

Services collaboratifs
Nextcloud sur Debian (LAMP, MariaDB) synchronisé avec l'Active Directory via LDAP, droits liés aux groupes. Messagerie hMailServer sur le LAN et webmail Roundcube en DMZ.

Supervision
Zabbix 7.4 sur Debian 13 : agents sur les serveurs Windows et Linux (processeur, mémoire, services, espace disque, Apache), SNMP sur pfSense (bande passante, table d'états, interfaces) et tableau de bord qui isole les alertes de sévérité moyenne ou plus.`,
    techStack: ['pfSense', 'Windows Server 2022', 'Active Directory', 'NPS / RADIUS', 'Nextcloud', 'MariaDB', 'hMailServer', 'Roundcube', 'Zabbix', 'Debian'],
    competencies: [PATRIMOINE, PROJET, SERVICE],
    cover: { logos: ['pfsense', 'windows', 'nextcloud', 'debian'], keywords: 'Portail captif · RADIUS · LDAP · DMZ · Zabbix' },
    gallery: [{ file: 'ap2-schema', caption: 'Topologie de l’infrastructure SIO-Formations : trois zones isolées par pfSense.' }],
  },
  {
    slug: 'infrastructure-vsphere-ha',
    title: 'Infrastructure de virtualisation vSphere HA',
    category: CAT_INFRA,
    context: CTX_GRETA,
    period: 'Mars 2026',
    featured: true,
    description:
      "Modernisation de serveurs : mise à jour des firmwares via iDRAC et iLO, grappe RAID 5 de 30 disques SAS, installation d'ESXi et de vCenter (VCSA), tests de basculement.",
    longDescription: `Stage de deuxième année au GRETA Alsace Sud (Colmar).

Remise à niveau du matériel
Mise à jour des firmwares des serveurs depuis les consoles iDRAC et iLO, puis création d'une grappe RAID 5 de 30 disques SAS.

Virtualisation
Installation des hyperviseurs VMware ESXi et déploiement de vCenter (VCSA) pour administrer un cluster vSphere en haute disponibilité, avec schéma réseau à l'appui.

Validation
Tests de basculement pour vérifier la reprise des machines virtuelles en cas de perte d'un hôte.`,
    techStack: ['VMware ESXi', 'vCenter', 'RAID 5', 'iDRAC', 'iLO'],
    competencies: [PATRIMOINE, PROJET, SERVICE],
    cover: { logos: ['icon:boxes', 'dell', 'hp', 'icon:hard-drive'], keywords: 'ESXi · vCenter · HA · RAID 5 · 30 disques SAS' },
  },
  {
    slug: 'deploiement-parc-weishaupt',
    title: 'Déploiement et migration de plus de 200 postes',
    category: CAT_SUPPORT,
    context: CTX_WEISHAUPT,
    period: 'Mai – juin 2025',
    featured: true,
    description:
      'Masterisation et installation de plus de 200 PC (Windows, Office 365, VPN GlobalProtect, MFA), inventaire du parc, support utilisateurs et brassage réseau.',
    longDescription: `Stage de première année chez Weishaupt (Colmar).

Déploiement
Masterisation et configuration de plus de 200 postes de travail, transfert des données utilisateurs, installation d'Office 365 et de PDF24, configuration du VPN Palo Alto GlobalProtect avec authentification multifacteur.

Gestion du parc
Tableau Excel de suivi du déploiement, étiquetage du matériel et inventaire des bornes Wi-Fi Cisco (numéros de série et adresses MAC).

Support
Assistance de proximité et à distance avec TeamViewer, résolution d'incidents sur les écrans et les logiciels.

Réseau
Brassage des câbles en baie pour les postes de travail, les imprimantes et les bornes Wi-Fi.

Autonomie
Pendant une semaine, gestion seul du flux de déploiement (2 postes par jour), en coordination avec le support central en Allemagne.`,
    techStack: ['Windows', 'Office 365', 'GlobalProtect', 'MFA', 'TeamViewer', 'Cisco', 'Excel'],
    competencies: [PATRIMOINE, INCIDENTS, PROJET, SERVICE, DEV_PRO],
    cover: { logos: ['windows', 'paloaltonetworks', 'teamviewer', 'cisco'], keywords: '200+ postes · Office 365 · GlobalProtect · MFA' },
  },
  {
    slug: 'acces-distants-rustdesk',
    title: 'Sécurisation des accès distants avec RustDesk',
    category: CAT_NET,
    context: CTX_GRETA,
    period: 'Mars – avr. 2026',
    description:
      'Prise en main à distance auto-hébergée : serveur RustDesk sous Alpine Linux déployé avec Docker Compose, autorité de certification interne et chiffrement SSL/TLS.',
    longDescription: `Stage de deuxième année au GRETA Alsace Sud.

Solution souveraine
Mise en place d'une solution de contrôle à distance auto-hébergée, pour ne plus dépendre d'un service tiers : serveur RustDesk sous Alpine Linux, déployé avec Docker Compose.

Sécurisation
Création d'une autorité de certification racine (Root CA), émission de certificats SSL/TLS et clés Ed25519.

Livrable
Guide utilisateur pour l'installation et la connexion des postes clients.`,
    techStack: ['RustDesk', 'Alpine Linux', 'Docker', 'Root CA', 'SSL/TLS'],
    competencies: [INCIDENTS, PROJET, SERVICE],
    cover: { logos: ['rustdesk', 'alpinelinux', 'docker', 'icon:key-round'], keywords: 'Docker Compose · Root CA · SSL/TLS · Ed25519' },
  },
  {
    slug: 'maintenance-proxmox',
    title: "Maintenance et audit d'une infrastructure Proxmox",
    category: CAT_INFRA,
    context: CTX_GRETA,
    period: 'Mars 2026',
    description:
      "Remise en état d'un hôte Proxmox VE : passage au noyau 6.8, correction des dépôts, tunnel SSH chiffré pour contourner un blocage réseau et configuration d'un VPN Proton.",
    longDescription: `Stage de deuxième année au GRETA Alsace Sud.

Maintenance
Audit d'un hôte Proxmox VE, mise à jour vers le noyau 6.8 et correction des dépôts de paquets.

Réseau
Mise en place d'un tunnel SSH chiffré pour contourner un blocage réseau, et configuration d'un VPN Proton.`,
    techStack: ['Proxmox VE', 'Debian', 'SSH', 'Proton VPN'],
    competencies: [PATRIMOINE, INCIDENTS],
    cover: { logos: ['proxmox', 'debian', 'icon:terminal', 'protonvpn'], keywords: 'Noyau 6.8 · Dépôts · Tunnel SSH · VPN' },
  },
  {
    slug: 'segmentation-reseau-physique',
    title: 'Segmentation et brassage réseau physique',
    category: CAT_NET,
    context: CTX_GRETA,
    period: 'Mars 2026',
    description: 'Installation de commutateurs et de routeurs, configuration en console (PuTTY) du NAT/PAT et mise en place d’un plan de VLAN.',
    longDescription: `Stage de deuxième année au GRETA Alsace Sud.

Installation
Mise en place physique des commutateurs et des routeurs, et brassage.

Configuration
Configuration en ligne de commande via PuTTY : traduction d'adresses (NAT/PAT) et découpage du réseau selon un plan de VLAN.`,
    techStack: ['VLAN', 'NAT/PAT', 'PuTTY', 'Brassage'],
    competencies: [PATRIMOINE, SERVICE],
    cover: { logos: ['icon:network', 'icon:cable', 'icon:terminal'], keywords: 'Switchs · Routeurs · NAT/PAT · Plan de VLAN' },
  },
  {
    slug: 'simulation-rancongiciel-sauvegarde',
    title: "Simulation d'attaque par rançongiciel et sauvegarde",
    category: CAT_NET,
    context: CTX_BTS,
    period: 'Janv. – févr. 2026',
    description: "Mise en situation d'une attaque par rançongiciel pour éprouver la sauvegarde : UrBackup, stockage TrueNAS et plan de reprise d'activité.",
    longDescription: `Projet en formation au BTS SIO.

Mise en situation
Simulation d'une attaque par rançongiciel pour éprouver la stratégie de sauvegarde.

Sauvegarde et reprise
Sauvegardes avec UrBackup, stockage sur TrueNAS et rédaction d'un plan de reprise d'activité (PRA).`,
    techStack: ['TrueNAS', 'UrBackup', 'PRA'],
    competencies: [PATRIMOINE],
    cover: { logos: ['icon:shield-alert', 'truenas', 'icon:database-backup'], keywords: 'Rançongiciel · UrBackup · TrueNAS · PRA' },
  },
  {
    slug: 'supervision-audit-zabbix-nmap',
    title: 'Supervision et audit de sécurité (Zabbix, Nmap)',
    category: CAT_SUPERVISION,
    context: CTX_BTS,
    period: 'Oct. – nov. 2025',
    description: 'Tableaux de bord de supervision Zabbix, scans de vulnérabilités avec Nmap et tests d’intrusion.',
    longDescription: `Projet en formation au BTS SIO.

Supervision
Création de tableaux de bord Zabbix pour suivre l'état des équipements.

Audit
Scans de vulnérabilités avec Nmap et tests d'intrusion pour vérifier l'exposition des services.`,
    techStack: ['Zabbix', 'Nmap'],
    competencies: [PATRIMOINE, INCIDENTS],
    cover: { logos: ['icon:activity', 'icon:radar'], keywords: 'Tableaux de bord · Scans · Tests d’intrusion' },
  },
  {
    slug: 'telephonie-ip-asterisk',
    title: 'Téléphonie sur IP et qualité de service',
    category: CAT_SERVICES,
    context: CTX_BTS,
    period: 'Nov. 2025',
    description: 'Mise en place d’un serveur de téléphonie sur IP (Asterisk, 3CX) et priorisation des flux voix (QoS).',
    longDescription: `Projet en formation au BTS SIO.

Téléphonie
Installation et configuration d'un serveur de téléphonie sur IP avec Asterisk et 3CX.

Qualité de service
Priorisation des flux voix sur le réseau.`,
    techStack: ['Asterisk', '3CX', 'QoS'],
    competencies: [SERVICE],
    cover: { logos: ['asterisk', 'icon:phone'], keywords: 'ToIP · Asterisk · 3CX · QoS' },
  },
  {
    slug: 'deploiement-application-web',
    title: "Déploiement d'une application web en pré-production",
    category: CAT_SERVICES,
    context: CTX_BTS,
    period: 'Nov. 2025 – janv. 2026',
    description: 'Cahier des charges technique puis installation d’un environnement Apache et SQL pour la pré-production d’une application web.',
    longDescription: `Projet en formation au BTS SIO, mené en mode projet.

Cadrage
Rédaction du cahier des charges technique de l'environnement cible.

Mise en œuvre
Installation du serveur web Apache et de la base de données SQL pour la pré-production de l'application.`,
    techStack: ['Apache', 'SQL'],
    competencies: [PROJET, SERVICE],
    cover: { logos: ['apache', 'icon:database'], keywords: 'Cahier des charges · Apache · SQL' },
  },
  {
    slug: 'gestion-parc-glpi-ocs',
    title: 'Gestion du patrimoine avec GLPI et OCS',
    category: CAT_SUPERVISION,
    context: CTX_BTS,
    period: 'Avr. – mai 2025',
    description: 'Inventaire matériel avec GLPI 10 et OCS Inventory, liaison à l’annuaire LDAP et gestion des tickets d’incident.',
    longDescription: `Projet en formation au BTS SIO.

Inventaire
Inventaire matériel avec GLPI 10 et OCS Inventory.

Annuaire
Liaison LDAP pour importer les utilisateurs.

Helpdesk
Gestion des tickets d'incident.`,
    techStack: ['GLPI', 'OCS Inventory', 'LDAP'],
    competencies: [PATRIMOINE, INCIDENTS],
    cover: { logos: ['icon:clipboard-list', 'icon:users'], keywords: 'GLPI 10 · OCS · LDAP · Tickets' },
  },
  {
    slug: 'securite-perimetrique-pfsense',
    title: 'Sécurité périmétrique et pare-feu (pfSense, IPFire)',
    category: CAT_NET,
    context: CTX_BTS,
    period: 'Janv. – mars 2025',
    description: 'Configuration de pare-feu pfSense et IPFire : filtrage des flux, zone démilitarisée (DMZ) et portail captif.',
    longDescription: `Projet en formation au BTS SIO.

Mise en place de pare-feu pfSense et IPFire : règles de filtrage des flux, création d'une DMZ pour les services exposés et portail captif.`,
    techStack: ['pfSense', 'IPFire', 'DMZ', 'Portail captif'],
    competencies: [SERVICE],
    cover: { logos: ['pfsense', 'icon:shield'], keywords: 'Filtrage · DMZ · Portail captif' },
  },
  {
    slug: 'automatisation-powershell',
    title: "Automatisation des tâches d'administration",
    category: CAT_SERVICES,
    context: CTX_BTS,
    period: 'Janv. – févr. 2025',
    description: 'Scripts PowerShell et fichiers Batch avec menus pour automatiser les tâches d’administration.',
    longDescription: `Projet en formation au BTS SIO.

Écriture de scripts PowerShell complexes et de fichiers Batch proposant des menus, pour automatiser les tâches d'administration récurrentes.`,
    techStack: ['PowerShell', 'Batch', 'Windows Server'],
    competencies: [PATRIMOINE, SERVICE],
    cover: { logos: ['windows', 'icon:square-terminal'], keywords: 'PowerShell · Batch · Menus' },
  },
  {
    slug: 'services-domaine-active-directory',
    title: 'Services de domaine Active Directory',
    category: CAT_SERVICES,
    context: CTX_BTS,
    period: 'Nov. – déc. 2024',
    description: 'Contrôleur de domaine Windows Server, stratégies de groupe pour les lecteurs réseau et scripts de connexion.',
    longDescription: `Projet en formation au BTS SIO.

Installation d'un contrôleur de domaine Active Directory, stratégies de groupe (GPO) pour les lecteurs réseau et scripts de connexion.`,
    techStack: ['Windows Server', 'Active Directory', 'GPO'],
    competencies: [PATRIMOINE, SERVICE],
    cover: { logos: ['windows', 'icon:users'], keywords: 'Contrôleur de domaine · GPO · Scripts' },
  },
  {
    slug: 'veille-debian-alpine',
    title: 'Veille : Debian ou Alpine Linux pour un serveur ?',
    category: CAT_WEB,
    context: CTX_GRETA,
    period: 'Mars – avr. 2026',
    description: 'Étude comparative de Debian et d’Alpine Linux comme systèmes serveur, appuyée par des installations en bare metal.',
    longDescription: `Veille technologique pendant le stage au GRETA Alsace Sud.

Comparaison de Debian et d'Alpine Linux pour un usage serveur, avec des installations en bare metal pour appuyer l'étude sur des tests réels.`,
    techStack: ['Debian', 'Alpine Linux'],
    competencies: [DEV_PRO],
    cover: { logos: ['debian', 'alpinelinux'], keywords: 'Étude comparative · Bare metal' },
  },
];

// The existing portfolio project is kept: only its metadata and cover are updated.
const keptProject = {
  slug: KEPT_PROJECT_SLUG,
  category: CAT_WEB,
  context: CTX_BTS,
  period: 'Mai 2025 – janv. 2026',
  techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vite'],
  competencies: [DEV_PRO],
  cover: { logos: ['react', 'typescript', 'tailwindcss', 'supabase'], keywords: 'Portfolio · Administration · Veille' },
};

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

const dark = { bg: '#17161c', box: '#1f1d26', boxStroke: '#2f2c38', text: '#ebeaf0', muted: '#9e9da9', primary: '#af9ee4' };
const light = { bg: '#fbfaff', node: '#ffffff', stroke: '#d8d4e6', text: '#1b1a20', muted: '#5f5b70', line: '#8a85a0', primary: '#6d5bb8', zone: '#f3f0fb' };
const sans = "'Segoe UI', Arial, sans-serif";
const mono = "Consolas, 'Courier New', monospace";

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const windowsLogo = { hex: '0078D4', path: 'M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z' };
// Logos filling their whole square look heavier: same optical correction as the site (src/lib/tech-icons.ts).
const fullSquare = new Set(['windows', 'pfsense', 'git', 'github', 'typescript', 'javascript', 'css']);

function brandIcon(slug) {
  if (slug === 'windows') return windowsLogo;
  const icon = Object.values(simpleIcons).find((item) => item?.slug === slug);
  if (!icon) throw new Error(`Unknown Simple Icons slug: ${slug}`);
  return icon;
}

/** Brand colour, lifted toward white when too dark for the dark cover (same rule as the site). */
function readableHex(hex) {
  const channels = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [r, g, b] = channels.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  if (0.2126 * r + 0.7152 * g + 0.0722 * b >= 0.12) return `#${hex}`;
  const mixed = channels.map((c) => Math.round(c * 0.45 + 235 * 0.55));
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function lucideInner(name) {
  const svg = readFileSync(`node_modules/lucide-static/icons/${name}.svg`, 'utf8');
  return svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>'));
}

/** Draws a logo or generic icon in a size×size square whose top-left corner is (x, y). */
function drawIcon(key, x, y, size, iconColor) {
  if (key.startsWith('icon:')) {
    const scale = (size / 24) * 0.85;
    const offset = (size - 24 * scale) / 2;
    return `<g transform="translate(${x + offset} ${y + offset}) scale(${scale})" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${lucideInner(key.slice(5))}</g>`;
  }
  const icon = brandIcon(key);
  const factor = fullSquare.has(key) ? 0.8 : 1;
  const scale = (size / 24) * factor;
  const offset = (size - 24 * scale) / 2;
  return `<g transform="translate(${x + offset} ${y + offset}) scale(${scale})"><path d="${icon.path}" fill="${readableHex(icon.hex)}"/></g>`;
}

function render(svg, width) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: true, defaultFontFamily: 'Segoe UI' } })
    .render()
    .asPng();
}

// ---------------------------------------------------------------------------
// Covers (1280 × 720)
// ---------------------------------------------------------------------------

function coverSvg({ cover, category }) {
  const W = 1280;
  const H = 720;
  const box = 150;
  const gap = 36;
  const total = cover.logos.length * box + (cover.logos.length - 1) * gap;
  const startX = (W - total) / 2;
  const boxY = 215;

  const boxes = cover.logos
    .map((key, index) => {
      const x = startX + index * (box + gap);
      return `<rect x="${x}" y="${boxY}" width="${box}" height="${box}" rx="30" fill="${dark.box}" stroke="${dark.boxStroke}" stroke-width="2"/>
  ${drawIcon(key, x + 37, boxY + 37, 76, dark.primary)}`;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#ffffff" fill-opacity="0.05"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${dark.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <text x="64" y="86" font-family="${mono}" font-size="26" fill="${dark.muted}">${esc(category)}</text>
  ${boxes}
  <text x="${W / 2}" y="${boxY + box + 110}" text-anchor="middle" font-family="${mono}" font-size="30" fill="${dark.text}" fill-opacity="0.8">${esc(cover.keywords)}</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// Network diagrams (light, like technical documentation)
// ---------------------------------------------------------------------------

function node(x, y, w, h, title, lines = [], { accent = false } = {}) {
  const body = lines
    .map((line, i) => `<text x="${x + 18}" y="${y + 62 + i * 22}" font-family="${mono}" font-size="16" fill="${light.muted}">${esc(line)}</text>`)
    .join('');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${light.node}" stroke="${accent ? light.primary : light.stroke}" stroke-width="${accent ? 2.5 : 1.5}"/>
  <text x="${x + 18}" y="${y + 36}" font-family="${sans}" font-size="20" font-weight="600" fill="${light.text}">${esc(title)}</text>${body}`;
}

const line = (x1, y1, x2, y2, { dashed = false, color = light.line } = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2"${dashed ? ' stroke-dasharray="8 6"' : ''}/>`;

const label = (x, y, text, { anchor = 'middle', color = light.muted, size = 15 } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${mono}" font-size="${size}" fill="${color}">${esc(text)}</text>`;

function zone(x, y, w, h, title) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${light.zone}" stroke="${light.stroke}" stroke-width="1.5" stroke-dasharray="10 7"/>
  <text x="${x + 20}" y="${y + 34}" font-family="${sans}" font-size="18" font-weight="600" fill="${light.primary}">${esc(title)}</text>`;
}

function header(title, subtitle) {
  return `<text x="60" y="70" font-family="${sans}" font-size="30" font-weight="700" fill="${light.text}">${esc(title)}</text>
  ${label(60, 104, subtitle, { anchor: 'start', size: 17 })}`;
}

function ap1Svg() {
  const W = 1600;
  const H = 1120;
  const trunkX = 800;
  const rows = [560, 690, 820, 950];
  const left = [
    ['SRV-WIN2022', ['192.168.1.10', 'AD DS · DNS · DHCP · GPO']],
    ['SRV-ToIP', ['192.168.1.20', 'Asterisk']],
    ['SRV-Zabbix', ['192.168.1.16', 'Supervision SNMP / agents']],
    ['Poste Windows 11', ['DHCP']],
  ];
  const right = [
    ['SRV-GLPI', ['192.168.1.17', 'Debian · LAMP · GLPI 10']],
    ['SRV-TrueNAS', ['192.168.1.30', 'RAID-Z1 · SMB · ACL AD']],
    ['Poste Windows 10', ['DHCP · agent GLPI']],
    ['Windows 10 Clonezilla', ['Déploiement de l’image master']],
  ];
  const nodeW = 340;
  const nodeH = 100;

  const branches = rows
    .map((y, i) => {
      const mid = y + nodeH / 2;
      return `${line(trunkX, mid, 420 + nodeW, mid)}${line(trunkX, mid, 860, mid)}
  ${node(420, y, nodeW, nodeH, left[i][0], left[i][1])}
  ${node(860, y, nodeW, nodeH, right[i][0], right[i][1])}`;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${light.bg}"/>
  ${header('Infrastructure SoCoDevl', 'Pare-feu redondants (CARP), services centralisés et site distant')}

  ${line(800, 196, 580, 250)}${line(800, 196, 1020, 250)}
  ${label(640, 222, 'WAN (DHCP)')}${label(960, 222, 'WAN (DHCP)')}
  ${node(690, 140, 220, 56, 'Internet')}

  ${node(430, 250, 300, 110, 'pfSense MAIN', ['192.168.1.253', 'Maître CARP'], { accent: true })}
  ${node(870, 250, 300, 110, 'pfSense BACKUP', ['192.168.1.252', 'Secours CARP'], { accent: true })}
  ${line(730, 290, 870, 290, { dashed: true, color: light.primary })}
  ${label(800, 280, 'pfsync', { color: light.primary })}${label(800, 316, 'XMLRPC', { color: light.primary })}

  ${line(580, 360, 700, 420)}${line(1020, 360, 900, 420)}
  <rect x="640" y="420" width="320" height="52" rx="26" fill="${light.primary}" fill-opacity="0.12" stroke="${light.primary}" stroke-width="1.5"/>
  ${label(800, 452, 'IP virtuelle CARP 192.168.1.254', { color: light.primary, size: 16 })}

  ${zone(390, 500, 840, 590, 'LAN 192.168.1.0/24 · domaine socodevi.fr')}
  ${line(trunkX, 472, trunkX, 1060)}
  ${branches}

  ${node(1270, 250, 290, 110, 'Site distant', ['VMware ESXi', 'vCenter (vSphere)'])}
  ${line(1170, 330, 1270, 330, { dashed: true, color: light.primary })}
  ${label(1220, 298, 'OpenVPN', { color: light.primary })}${label(1220, 318, 'mode TAP', { color: light.primary })}
</svg>`;
}

function ap2Svg() {
  const W = 1600;
  const H = 950;
  const zones = [
    { x: 60, title: 'LAN Admin 192.168.2.0/24' },
    { x: 560, title: 'Wi-Fi BYOD 10.0.0.0/24' },
    { x: 1060, title: 'DMZ 172.20.0.0/24' },
  ];
  const zoneW = 480;
  const zoneY = 430;
  const nodeX = (i) => zones[i].x + 40;
  const nodeW = 400;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${light.bg}"/>
  ${header('Infrastructure SIO-Formations', 'Accès BYOD authentifiés, zones isolées par pfSense')}

  ${node(690, 140, 220, 56, 'Internet')}
  ${line(800, 196, 800, 250)}
  ${node(620, 250, 360, 100, 'pfSense', ['Filtrage inter-zones', 'Portail captif (Wi-Fi)'], { accent: true })}
  ${zones.map((z) => line(800, 350, z.x + zoneW / 2, zoneY)).join('')}

  ${zones.map((z) => zone(z.x, zoneY, zoneW, 360, z.title)).join('\n  ')}

  ${node(nodeX(0), 490, nodeW, 122, 'SRV-WIN2022', ['192.168.2.10', 'AD DS · DNS · DHCP', 'NPS / RADIUS'])}
  ${node(nodeX(0), 640, nodeW, 100, 'hMailServer', ['Messagerie SMTP / IMAP'])}

  ${node(nodeX(1), 490, nodeW, 100, 'Portail captif', ['Authentification RADIUS'], { accent: true })}
  ${node(nodeX(1), 640, nodeW, 100, 'Équipements BYOD', ['Web uniquement (HTTP/HTTPS)'])}

  ${node(nodeX(2), 490, nodeW, 100, 'SRV-Zabbix', ['172.20.0.20', 'Zabbix 7.4 · Debian 13'])}
  ${node(nodeX(2), 640, nodeW, 122, 'SRV-Nextcloud', ['172.20.0.50', 'LAMP · Nextcloud', 'Webmail Roundcube'])}

  ${label(60, 850, 'Flux autorisés', { anchor: 'start', color: light.text, size: 17 })}
  ${label(60, 880, 'Wi-Fi vers WAN : HTTP/HTTPS · Portail captif vers NPS : RADIUS · DMZ vers LAN : LDAP (TCP 389), messagerie', { anchor: 'start' })}
  ${label(60, 906, 'Zabbix vers les équipements : agent (TCP 10050), SNMP (UDP 161)', { anchor: 'start' })}
</svg>`;
}

// ---------------------------------------------------------------------------
// SQL
// ---------------------------------------------------------------------------

const sqlText = (value) => (value === null || value === undefined ? 'null' : `'${String(value).replace(/'/g, "''")}'`);
const sqlArray = (values) => `array[${values.map(sqlText).join(', ')}]::text[]`;
const imageUrl = (file) => `/projects/${file}.png`;

function projectRow(project, index) {
  const gallery = (project.gallery ?? []).map((image) => ({ url: imageUrl(image.file), caption: image.caption }));
  return `(
  ${sqlText(project.title)},
  ${sqlText(project.slug)},
  ${sqlText(project.description)},
  ${sqlText(project.longDescription)},
  ${sqlText(imageUrl(project.slug))},
  ${sqlText(JSON.stringify(gallery))}::jsonb,
  ${sqlArray(project.techStack)},
  ${sqlText(project.category)},
  ${project.featured ? 'true' : 'false'},
  true,
  ${sqlText(project.context)},
  ${sqlText(project.period)},
  ${sqlArray(project.competencies)},
  ${index + 1}
)`;
}

// Links projects to the experience / training they belong to, matched by name so it works whatever the ids are.
// Only fills projects that are not linked yet, so a choice made later in the admin is never overwritten.
const linkRules = [
  { context: `${CTX_GRETA}%`, experience: "type = 'experience' and company ilike '%greta%'" },
  { context: `${CTX_WEISHAUPT}%`, experience: "type = 'experience' and company ilike '%weishaupt%'" },
  { context: 'BTS SIO%', experience: "type = 'education' and (title ilike '%SIO%' or title ilike '%services informatiques%')" },
];

function buildLinkSql() {
  return linkRules
    .map(
      (rule) => `update public.projects
set experience_id = (select id from public.experiences where ${rule.experience} order by order_index limit 1)
where context like ${sqlText(rule.context)} and experience_id is null;`,
    )
    .join('\n\n');
}

function buildSql() {
  return `-- Generated by scripts/generate-bts-projects.mjs. Do not edit by hand: change the script and run "npm run projects".
-- Run in Supabase > SQL Editor, AFTER portfolio-schema.sql (it needs the context / period / competencies columns).
-- Replaces every project except "${KEPT_PROJECT_SLUG}", which is kept and only gets its metadata updated.

begin;

delete from public.projects where slug <> ${sqlText(KEPT_PROJECT_SLUG)};

insert into public.projects
  (title, slug, description, long_description, cover_image_url, gallery, tech_stack, category, featured, published, context, period, competencies, order_index)
values
${projects.map(projectRow).join(',\n')};

update public.projects set
  category = ${sqlText(keptProject.category)},
  context = ${sqlText(keptProject.context)},
  period = ${sqlText(keptProject.period)},
  tech_stack = ${sqlArray(keptProject.techStack)},
  competencies = ${sqlArray(keptProject.competencies)},
  cover_image_url = ${sqlText(imageUrl(keptProject.slug))},
  featured = false,
  order_index = ${projects.length + 1}
where slug = ${sqlText(KEPT_PROJECT_SLUG)};

-- Link each project to its experience / training (Parcours page pop-ups).
${buildLinkSql()}

commit;
`;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

mkdirSync('public/projects', { recursive: true });

for (const project of [...projects, keptProject]) {
  const category = project.category;
  writeFileSync(`public/projects/${project.slug}.png`, render(coverSvg({ cover: project.cover, category }), 1280));
  console.log(`  public/projects/${project.slug}.png`);
}

writeFileSync('public/projects/ap1-schema.png', render(ap1Svg(), 2400));
writeFileSync('public/projects/ap2-schema.png', render(ap2Svg(), 2400));
console.log('  public/projects/ap1-schema.png\n  public/projects/ap2-schema.png');

writeFileSync('supabase/projects-bts-sio.sql', buildSql());
console.log('  supabase/projects-bts-sio.sql');

writeFileSync(
  'supabase/link-projects-experiences.sql',
  `-- Generated by scripts/generate-bts-projects.mjs.
-- Links the existing projects to their experience / training, without touching anything else.
-- Run in Supabase > SQL Editor after portfolio-schema.sql. Safe to re-run.

${buildLinkSql()}

-- Check: every project and the experience it is linked to (empty = not linked).
select p.title as projet, e.title as experience_ou_formation
from public.projects p
left join public.experiences e on e.id = p.experience_id
order by p.order_index;
`,
);
console.log('  supabase/link-projects-experiences.sql');

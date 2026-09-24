import {
  Activity,
  Award,
  Box,
  Boxes,
  ClipboardList,
  Cloud,
  Database,
  DatabaseBackup,
  FileText,
  Globe,
  HardDrive,
  KeyRound,
  Lock,
  type LucideIcon,
  Mail,
  Network,
  Newspaper,
  Phone,
  Radar,
  Server,
  Sheet,
  Shield,
  ShieldCheck,
  SquareTerminal,
  Terminal,
  Users,
  Wifi,
  Wrench,
} from 'lucide-react';
import {
  siAlpinelinux,
  siAnsible,
  siApache,
  siAsterisk,
  siDell,
  siFirefox,
  siHp,
  siMariadb,
  siNextcloud,
  siPhp,
  siProtonvpn,
  siRoundcube,
  siRustdesk,
  siTeamviewer,
  siTrello,
  siTruenas,
  siCisco,
  siComptia,
  siFortinet,
  siHackthebox,
  siPaloaltonetworks,
  siRedhat,
  siRootme,
  siTryhackme,
  siCss,
  siDebian,
  siDocker,
  siFirebase,
  siGit,
  siGithub,
  siGithubactions,
  siGnubash,
  siGrafana,
  siHtml5,
  siJavascript,
  siKubernetes,
  siLinux,
  siMysql,
  siNginx,
  siNodedotjs,
  siOpenvpn,
  siPfsense,
  siPostgresql,
  siPrometheus,
  siProxmox,
  siPython,
  siReact,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siUbuntu,
  siVite,
  siWireguard,
} from 'simple-icons';

export interface TechIcon {
  title: string;
  hex: string;
  path: string;
  /** Optical correction: logos filling their whole square look heavier than the others. */
  scale?: number;
}

const fullSquare = (icon: TechIcon): TechIcon => ({ ...icon, scale: 0.8 });

// Not in Simple Icons (removed at Microsoft's request): the four-pane Windows logo.
const windowsIcon: TechIcon = {
  scale: 0.8,
  title: 'Windows',
  hex: '0078D4',
  path: 'M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z',
};

// Keys are normalized (lowercase, no accents, words separated by single spaces).
const aliases: Record<string, TechIcon> = {
  linux: siLinux,
  debian: siDebian,
  alpine: siAlpinelinux,
  ubuntu: siUbuntu,
  windows: windowsIcon,
  proxmox: siProxmox,
  docker: siDocker,
  kubernetes: siKubernetes,
  cisco: siCisco,
  ccna: siCisco,
  netacad: siCisco,
  'palo alto': siPaloaltonetworks,
  globalprotect: siPaloaltonetworks,
  fortinet: siFortinet,
  fortigate: siFortinet,
  'red hat': siRedhat,
  rhcsa: siRedhat,
  comptia: siComptia,
  tryhackme: siTryhackme,
  'root me': siRootme,
  rootme: siRootme,
  'hack the box': siHackthebox,
  hackthebox: siHackthebox,
  pfsense: fullSquare(siPfsense),
  openvpn: siOpenvpn,
  wireguard: siWireguard,
  bash: siGnubash,
  ansible: siAnsible,
  grafana: siGrafana,
  prometheus: siPrometheus,
  nginx: siNginx,
  apache: siApache,
  git: fullSquare(siGit),
  github: fullSquare(siGithub),
  'github actions': fullSquare(siGithubactions),
  'github workflows': fullSquare(siGithubactions),
  react: siReact,
  typescript: fullSquare(siTypescript),
  javascript: fullSquare(siJavascript),
  html: siHtml5,
  html5: siHtml5,
  css: fullSquare(siCss),
  css3: fullSquare(siCss),
  tailwind: siTailwindcss,
  'tailwind css': siTailwindcss,
  vite: siVite,
  node: siNodedotjs,
  nodejs: siNodedotjs,
  python: siPython,
  supabase: siSupabase,
  firebase: siFirebase,
  postgresql: siPostgresql,
  postgres: siPostgresql,
  mysql: siMysql,
  mariadb: siMariadb,
  php: siPhp,
  truenas: siTruenas,
  nextcloud: siNextcloud,
  roundcube: siRoundcube,
  asterisk: siAsterisk,
  teamviewer: siTeamviewer,
  rustdesk: siRustdesk,
  'proton vpn': siProtonvpn,
  protonvpn: siProtonvpn,
  dell: siDell,
  idrac: siDell,
  hp: siHp,
  ilo: siHp,
  firefox: siFirefox,
  trello: siTrello,
};

// Concepts without a brand logo get a generic icon, so every item in a list carries one.
const conceptAliases: Record<string, LucideIcon> = {
  vlan: Network,
  segmentation: Network,
  networking: Network,
  reseau: Network,
  routing: Network,
  switching: Network,
  vpn: Lock,
  tunneling: Lock,
  ipsec: Lock,
  dns: Globe,
  dhcp: Globe,
  ssh: Terminal,
  powershell: SquareTerminal,
  scripting: SquareTerminal,
  script: SquareTerminal,
  monitoring: Activity,
  logs: Activity,
  supervision: Activity,
  'self hosting': Server,
  infra: Server,
  infrastructure: Server,
  homelab: Server,
  serveur: Server,
  virtualisation: Boxes,
  // VMware and OpenSSL only have flat text logos, unreadable in a small square.
  vmware: Boxes,
  esxi: Boxes,
  vcenter: Boxes,
  vsphere: Boxes,
  openssl: KeyRound,
  security: Shield,
  securite: Shield,
  firewall: Shield,
  'pare feu': Shield,
  pki: KeyRound,
  anssi: Shield,
  secnumacademie: Shield,
  certification: Award,
  certificats: KeyRound,
  ssl: KeyRound,
  tls: KeyRound,
  'active directory': Users,
  ldap: Users,
  gpo: Users,
  vcds: Wrench,
  tooling: Wrench,
  outils: Wrench,
  diagnostic: Wrench,
  cloud: Cloud,
  database: Database,
  bdd: Database,
  sql: Database,
  zabbix: Activity,
  nmap: Radar,
  audit: Radar,
  glpi: ClipboardList,
  ocs: ClipboardList,
  inventaire: ClipboardList,
  clonezilla: HardDrive,
  raid: HardDrive,
  stockage: HardDrive,
  nas: HardDrive,
  urbackup: DatabaseBackup,
  sauvegarde: DatabaseBackup,
  pra: DatabaseBackup,
  backup: DatabaseBackup,
  toip: Phone,
  voip: Phone,
  '3cx': Phone,
  qos: Phone,
  excel: Sheet,
  'office 365': FileText,
  'microsoft 365': FileText,
  pdf24: FileText,
  putty: Terminal,
  batch: SquareTerminal,
  ipfire: Shield,
  'portail captif': Shield,
  radius: KeyRound,
  nps: KeyRound,
  mfa: ShieldCheck,
  'root ca': KeyRound,
  hmailserver: Mail,
  messagerie: Mail,
  smtp: Mail,
  wifi: Wifi,
  'wi fi': Wifi,
  carp: Network,
  nat: Network,
  brassage: Network,
  veille: Newspaper,
  lamp: Server,
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Returns the alias value found earliest in the name ("Routing & Switching (Cisco)").
 * On a tie, the longer alias wins ("github actions" over "github").
 */
function findBest<T>(name: string, table: Record<string, T>): T | null {
  const haystack = ` ${normalize(name)} `;
  let best: { value: T; position: number; length: number } | null = null;

  for (const [key, value] of Object.entries(table)) {
    const position = haystack.indexOf(` ${key} `);
    if (position === -1) continue;
    if (!best || position < best.position || (position === best.position && key.length > best.length)) {
      best = { value, position, length: key.length };
    }
  }

  return best?.value ?? null;
}

export type ResolvedIcon = { kind: 'brand'; icon: TechIcon } | { kind: 'concept'; icon: LucideIcon };

const cache = new Map<string, ResolvedIcon>();

/**
 * Icon for a technology or skill name: its official logo when one exists,
 * otherwise a generic icon matching the concept (or a neutral default).
 */
export function resolveTechIcon(name: string): ResolvedIcon {
  const cached = cache.get(name);
  if (cached) return cached;

  const brand = findBest(name, aliases);
  const result: ResolvedIcon = brand
    ? { kind: 'brand', icon: brand }
    : { kind: 'concept', icon: findBest(name, conceptAliases) ?? Box };

  cache.set(name, result);
  return result;
}

/** Brand colour, lifted toward the text colour when it is too dark to read on the dark background. */
export function techIconColor(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.12 ? `color-mix(in oklch, #${hex} 45%, var(--foreground))` : `#${hex}`;
}

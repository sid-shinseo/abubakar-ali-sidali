// Generates the favicon set and the social preview image (LinkedIn, etc.) into public/.
// Run with: npm run brand   (only needed when the name, title or colours change)
import { writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const colors = {
  background: '#0c0c0f',
  card: '#17161c',
  border: '#29282f',
  foreground: '#ebeaf0',
  muted: '#9e9da9',
  primary: '#af9ee4', // oklch(0.74 0.1 295), same as --primary
  primaryForeground: '#171322',
};

const escapeXml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const content = Object.fromEntries(
  Object.entries({
    initials: 'SA',
    name: 'Abubakar Ali Sid-Ali',
    title: 'Administrateur systèmes, réseaux & sécurité',
    status: "En recherche d'alternance · Titre Pro AIS",
    stack: 'Windows Server · Linux · VMware · Proxmox · pfSense · Cisco',
    location: 'Colmar, Alsace',
  }).map(([key, value]) => [key, escapeXml(value)]),
);

const sans = "'Segoe UI', 'IBM Plex Sans', Arial, sans-serif";
const mono = "Consolas, 'IBM Plex Mono', monospace";

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${colors.primary}"/>
  <text x="32" y="41.5" text-anchor="middle" font-family="${mono}" font-size="27" font-weight="700" letter-spacing="-1" fill="${colors.primaryForeground}">${content.initials}</text>
</svg>
`;

const ogImage = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${colors.background}"/>
  <rect x="40" y="40" width="1120" height="550" rx="20" fill="${colors.card}" stroke="${colors.border}" stroke-width="2"/>
  <rect x="40" y="40" width="8" height="550" rx="4" fill="${colors.primary}"/>

  <rect x="110" y="104" width="64" height="64" rx="14" fill="${colors.primary}"/>
  <text x="142" y="146" text-anchor="middle" font-family="${mono}" font-size="27" font-weight="700" fill="${colors.primaryForeground}">${content.initials}</text>
  <text x="196" y="145" font-family="${mono}" font-size="24" fill="${colors.muted}">Portfolio</text>

  <text x="110" y="290" font-family="${sans}" font-size="76" font-weight="600" fill="${colors.foreground}">${content.name}</text>
  <text x="110" y="350" font-family="${sans}" font-size="36" fill="${colors.foreground}" fill-opacity="0.82">${content.title}</text>

  <rect x="110" y="392" width="545" height="52" rx="26" fill="${colors.primary}" fill-opacity="0.16"/>
  <circle cx="140" cy="418" r="7" fill="${colors.primary}"/>
  <text x="160" y="427" font-family="${sans}" font-size="25" font-weight="600" fill="${colors.primary}">${content.status}</text>

  <text x="110" y="530" font-family="${mono}" font-size="23" fill="${colors.muted}">${content.stack}</text>
  <text x="1090" y="530" text-anchor="end" font-family="${mono}" font-size="23" fill="${colors.muted}">${content.location}</text>
</svg>
`;

function renderPng(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true, defaultFontFamily: 'Segoe UI' },
  });
  return resvg.render().asPng();
}

const outputs = [
  ['public/favicon.svg', favicon],
  ['public/favicon-32.png', renderPng(favicon, 32)],
  ['public/apple-touch-icon.png', renderPng(favicon, 180)],
  ['public/icon-512.png', renderPng(favicon, 512)],
  ['public/og-image.png', renderPng(ogImage, 1200)],
];

for (const [file, data] of outputs) {
  writeFileSync(file, data);
  console.log(`  ${file}`);
}

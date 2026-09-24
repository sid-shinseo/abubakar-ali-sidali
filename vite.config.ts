import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const publicRoutes = ['/', '/about', '/skills', '/projets', '/contact'];

/**
 * - Fills %SITE_URL% in index.html (canonical, Open Graph), or drops those lines when VITE_SITE_URL is missing.
 * - On build, writes sitemap.xml (static pages + published projects read from Supabase) and robots.txt.
 */
function seo(env: Record<string, string>): Plugin {
  const siteUrl = env.VITE_SITE_URL?.replace(/\/$/, '');

  return {
    name: 'portfolio-seo',
    transformIndexHtml(html) {
      return siteUrl ? html.replaceAll('%SITE_URL%', siteUrl) : html.replace(/^.*%SITE_URL%.*\r?\n/gm, '');
    },
    async generateBundle() {
      if (!siteUrl) {
        this.warn('VITE_SITE_URL is not set: sitemap.xml, robots.txt and link previews are skipped.');
        return;
      }

      const entries = publicRoutes.map((route) => ({ loc: `${siteUrl}${route === '/' ? '/' : route}`, lastmod: null as string | null }));
      try {
        const response = await fetch(
          `${env.VITE_SUPABASE_URL}/rest/v1/projects?select=slug,updated_at&published=eq.true&order=order_index.asc`,
          { headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` } },
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const projects = (await response.json()) as Array<{ slug: string; updated_at: string }>;
        for (const project of projects) {
          entries.push({ loc: `${siteUrl}/projets/${encodeURIComponent(project.slug)}`, lastmod: project.updated_at.slice(0, 10) });
        }
      } catch (error) {
        this.warn(`Projects not added to the sitemap (${String(error)}).`);
      }

      const urls = entries
        .map(({ loc, lastmod }) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
        .join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nDisallow: /admin\nDisallow: /login\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'VITE_');

  return {
    plugins: [react(), tailwindcss(), seo(env)],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
  };
});

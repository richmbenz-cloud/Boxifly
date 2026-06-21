// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.boxifly.pe";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const today = new Date().toISOString().split("T")[0];

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
  { path: "/inicio", changefreq: "weekly", priority: "1.0", lastmod: today },
  { path: "/personas", changefreq: "monthly", priority: "0.9", lastmod: today },
  { path: "/personal-shopper", changefreq: "monthly", priority: "0.9", lastmod: today },
  { path: "/personal-shopper/landing", changefreq: "monthly", priority: "0.8" },
  { path: "/viajeros", changefreq: "monthly", priority: "0.9", lastmod: today },
  { path: "/viajeros/cliente", changefreq: "monthly", priority: "0.7" },
  { path: "/viajeros/viajero", changefreq: "monthly", priority: "0.7" },
  { path: "/viajeros/legales", changefreq: "yearly", priority: "0.3" },
  { path: "/cotizador", changefreq: "monthly", priority: "0.8" },
  { path: "/tariffs", changefreq: "monthly", priority: "0.7" },
  { path: "/restricted-products", changefreq: "monthly", priority: "0.6" },
  { path: "/como-comprar-en-usa", changefreq: "monthly", priority: "0.8" },
  { path: "/tiendas-en-usa", changefreq: "monthly", priority: "0.7" },
  { path: "/tipos-de-entrega", changefreq: "monthly", priority: "0.6" },
  { path: "/empresas", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/nosotros", changefreq: "monthly", priority: "0.6" },
  { path: "/contacto", changefreq: "monthly", priority: "0.6" },
  { path: "/afiliados", changefreq: "monthly", priority: "0.6" },
  { path: "/boxifly-puntos", changefreq: "monthly", priority: "0.7" },
  { path: "/guias-de-compras", changefreq: "monthly", priority: "0.6" },
  { path: "/ganadores-de-concursos", changefreq: "monthly", priority: "0.4" },
  { path: "/atencion-por-whatsapp", changefreq: "yearly", priority: "0.4" },
  { path: "/centro-de-ayuda", changefreq: "monthly", priority: "0.6" },
  { path: "/preguntas-frecuentes", changefreq: "monthly", priority: "0.7" },
  { path: "/terminos-y-condiciones", changefreq: "yearly", priority: "0.3" },
  { path: "/politica-privacidad", changefreq: "yearly", priority: "0.3" },
  { path: "/politica-cambios-devoluciones", changefreq: "yearly", priority: "0.3" },
  { path: "/libro-de-reclamaciones", changefreq: "yearly", priority: "0.3" },
  { path: "/legales", changefreq: "yearly", priority: "0.3" },
  { path: "/iniciar-sesion", changefreq: "monthly", priority: "0.8" },
  { path: "/registrarse", changefreq: "monthly", priority: "0.8" }
];

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path === "/" ? "" : e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);

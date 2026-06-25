import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getAllProperties, propertySlug } from "@/lib/properties";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = [
          { path: "/", priority: "1.0", changefreq: "daily" as const },
          { path: "/rent", priority: "0.9", changefreq: "daily" as const },
          { path: "/packages", priority: "0.8", changefreq: "monthly" as const },
          { path: "/about", priority: "0.6", changefreq: "monthly" as const },
          { path: "/contact", priority: "0.6", changefreq: "monthly" as const },
          { path: "/list", priority: "0.7", changefreq: "weekly" as const },
        ];
        const propertyPaths = getAllProperties().map((p) => ({
          path: `/property/${propertySlug(p)}`,
          changefreq: "weekly" as const,
          priority: "0.8",
        }));
        const all = [...staticPaths, ...propertyPaths];
        const urls = all.map(
          (e) =>
            `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});

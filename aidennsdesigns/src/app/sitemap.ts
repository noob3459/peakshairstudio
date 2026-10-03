import type { MetadataRoute } from "next";
import { query } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await query<{ slug: string; updated_at: string }>("select slug, updated_at from pages where status = 'published'");
  const projects = await query<{ slug: string; updated_at: string }>("select slug, updated_at from projects where status = 'published'");
  return [
    ...pages.map((p) => ({ url: p.slug === "home" ? SITE_URL : `${SITE_URL}/${p.slug}`, lastModified: new Date(p.updated_at) })),
    ...projects.map((p) => ({ url: `${SITE_URL}/work/${p.slug}`, lastModified: new Date(p.updated_at) })),
  ];
}

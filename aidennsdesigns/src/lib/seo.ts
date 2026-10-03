import type { Metadata } from "next";
import type { PageContent } from "./content";
import type { SiteSettings } from "./content";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function pageMetadata(c: PageContent, path: string, s: SiteSettings): Metadata {
  const title = c.seoTitle || `${c.title} — AidennsDesigns`;
  const description = c.seoDescription || s.defaultDescription;
  const img = c.shareImage ?? s.defaultShareImage;
  return {
    title, description,
    alternates: { canonical: path },
    openGraph: {
      title, description, url: path, siteName: "AidennsDesigns", type: "website",
      images: img ? [{ url: `/media/${img.id}`, width: img.w, height: img.h, alt: img.alt }] : undefined,
    },
    twitter: { card: img ? "summary_large_image" : "summary", title, description, images: img ? [`/media/${img.id}`] : undefined },
  };
}

import "server-only";
import { query } from "./db";
import { cleanImg, type Img, type PageContent, type SiteSettings } from "./content";
import { SEED_SETTINGS } from "./seed";

export type Status = "draft" | "published";
export type PageRow = {
  id: string; slug: string; status: Status; draft: PageContent; published: PageContent | null;
  updatedAt: string; publishedAt: string | null;
};
export type Project = {
  id: string; slug: string; name: string; summary: string; details: string; services: string[];
  kind: "client" | "concept"; clientConfirmed: boolean; cover: Img | null; gallery: Img[];
  liveUrl: string; status: Status; sortOrder: number; updatedAt: string;
};
export type Testimonial = {
  id: string; quote: string; person: string; business: string; role: string; image: Img | null;
  status: Status; sortOrder: number; updatedAt: string;
};

const iso = (d: any) => (d ? new Date(d).toISOString() : "");
const SMALL_BUSINESS_COPY = /\bsmall[\s-]+business(es)?\b/gi;
function updateBusinessLanguage<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(SMALL_BUSINESS_COPY, (match, plural: string | undefined) => {
      const replacement = plural ? "businesses" : "business";
      if (match === match.toUpperCase()) return replacement.toUpperCase();
      if (match[0] === match[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
      return replacement;
    }) as T;
  }
  if (Array.isArray(value)) return value.map(updateBusinessLanguage) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, updateBusinessLanguage(item)])) as T;
  }
  return value;
}
const toPage = (r: any): PageRow => ({
  id: r.id, slug: r.slug, status: r.status, draft: updateBusinessLanguage(r.draft), published: updateBusinessLanguage(r.published),
  updatedAt: iso(r.updated_at), publishedAt: r.published_at ? iso(r.published_at) : null,
});
const toProject = (r: any): Project => updateBusinessLanguage({
  id: r.id, slug: r.slug, name: r.name, summary: r.summary, details: r.details, services: r.services ?? [],
  kind: r.kind, clientConfirmed: r.client_confirmed, cover: r.cover ?? null, gallery: r.gallery ?? [],
  liveUrl: r.live_url, status: r.status, sortOrder: r.sort_order, updatedAt: iso(r.updated_at),
});
const toTestimonial = (r: any): Testimonial => updateBusinessLanguage({
  id: r.id, quote: r.quote, person: r.person, business: r.business, role: r.role, image: r.image ?? null,
  status: r.status, sortOrder: r.sort_order, updatedAt: iso(r.updated_at),
});

// ---- settings ----
export async function getSettings(): Promise<SiteSettings> {
  const rows = await query<{ value: Partial<SiteSettings> }>("select value from settings where key = 'site'");
  return updateBusinessLanguage({ ...SEED_SETTINGS, ...(rows[0]?.value ?? {}) });
}

// ---- pages ----
export async function getPublishedPage(slug: string) {
  const rows = await query("select * from pages where slug = $1 and status = 'published'", [slug]);
  const p = rows[0] ? toPage(rows[0]) : null;
  return p?.published ? { id: p.id, slug: p.slug, content: p.published } : null;
}
export const listPages = async () => (await query("select * from pages order by (slug = 'home') desc, created_at")).map(toPage);
export async function getPage(id: string) {
  const rows = await query("select * from pages where id = $1", [id]);
  return rows[0] ? toPage(rows[0]) : null;
}

// ---- projects ----
export async function getPublishedProjects(limit?: number) {
  const rows = await query(
    `select * from projects where status = 'published' order by sort_order, created_at ${limit ? "limit " + Number(limit) : ""}`,
  );
  return rows.map(toProject);
}
export async function getPublishedProject(slug: string) {
  const rows = await query("select * from projects where slug = $1 and status = 'published'", [slug]);
  return rows[0] ? toProject(rows[0]) : null;
}
export const listProjects = async () => (await query("select * from projects order by sort_order, created_at")).map(toProject);
export async function getProject(id: string) {
  const rows = await query("select * from projects where id = $1", [id]);
  return rows[0] ? toProject(rows[0]) : null;
}

// ---- testimonials ----
export async function getPublishedTestimonials(limit?: number) {
  const rows = await query(
    `select * from testimonials where status = 'published' order by sort_order, created_at ${limit ? "limit " + Number(limit) : ""}`,
  );
  return rows.map(toTestimonial);
}
export const listTestimonials = async () => (await query("select * from testimonials order by sort_order, created_at")).map(toTestimonial);
export async function getTestimonial(id: string) {
  const rows = await query("select * from testimonials where id = $1", [id]);
  return rows[0] ? toTestimonial(rows[0]) : null;
}

// ---- media ----
export type MediaItem = { id: string; filename: string; alt: string; width: number; height: number; bytes: number; createdAt: string };
export async function listMedia(): Promise<MediaItem[]> {
  const rows = await query("select id, filename, alt, width, height, bytes, created_at from media order by created_at desc");
  return rows.map((r: any) => ({ id: r.id, filename: r.filename, alt: r.alt, width: r.width, height: r.height, bytes: r.bytes, createdAt: iso(r.created_at) }));
}
export async function getMedia(id: string) {
  const rows = await query<{ data: Uint8Array; mime: string }>("select data, mime from media where id = $1", [id]);
  return rows[0] ? { data: Buffer.from(rows[0].data), mime: rows[0].mime } : null;
}
export async function mediaUsage(id: string): Promise<string[]> {
  const needle = id.toLowerCase();
  const out: string[] = [];
  const hit = async (label: string, sql: string) => {
    const rows = await query<{ n: string }>(sql, [needle]);
    for (const r of rows) out.push(`${label}: ${r.n}`);
  };
  await hit("Page", "select slug as n from pages where position($1 in draft::text) > 0 or position($1 in coalesce(published::text,'')) > 0");
  await hit("Project", "select name as n from projects where position($1 in coalesce(cover::text,'') || gallery::text) > 0");
  await hit("Testimonial", "select person as n from testimonials where position($1 in coalesce(image::text,'')) > 0");
  await hit("Settings", "select key as n from settings where position($1 in value::text) > 0");
  return out;
}

// ---- revisions ----
export async function listRevisions(entity: string, entityId: string) {
  const rows = await query("select id, label, created_at from revisions where entity = $1 and entity_id = $2 order by created_at desc limit 20", [entity, entityId]);
  return rows.map((r: any) => ({ id: r.id as string, label: r.label as string, createdAt: iso(r.created_at) }));
}
export async function addRevision(entity: string, entityId: string, label: string, data: unknown) {
  await query("insert into revisions (entity, entity_id, label, data) values ($1,$2,$3,$4::jsonb)", [entity, entityId, label, JSON.stringify(data)]);
  await query(
    `delete from revisions where entity = $1 and entity_id = $2 and id not in
       (select id from revisions where entity = $1 and entity_id = $2 order by created_at desc limit 30)`,
    [entity, entityId],
  );
}
export async function getRevision(id: string) {
  const rows = await query<{ entity: string; entity_id: string; data: any }>("select entity, entity_id, data from revisions where id = $1", [id]);
  return rows[0] ?? null;
}

// ---- inquiries ----
export async function listInquiries() {
  const rows = await query("select * from inquiries order by created_at desc");
  return rows.map((r: any) => ({
    id: r.id as string, name: r.name as string, business: r.business as string, contact: r.contact as string,
    website: r.website as string, about: r.about as string, goals: r.goals as string, features: r.features as string,
    handled: r.handled as boolean, emailStatus: r.email_status as string, createdAt: iso(r.created_at),
  }));
}

export async function dashboardCounts() {
  const c = async (sql: string) => Number((await query<{ n: string }>(sql))[0].n);
  return {
    pagesPublished: await c("select count(*) n from pages where status='published'"),
    pagesDraft: await c("select count(*) n from pages where status='draft'"),
    projectsPublished: await c("select count(*) n from projects where status='published'"),
    projectsDraft: await c("select count(*) n from projects where status='draft'"),
    testimonialsPublished: await c("select count(*) n from testimonials where status='published'"),
    testimonialsDraft: await c("select count(*) n from testimonials where status='draft'"),
    media: await c("select count(*) n from media"),
    inquiriesNew: await c("select count(*) n from inquiries where handled = false"),
  };
}

export { cleanImg };

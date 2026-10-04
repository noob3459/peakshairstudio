import "server-only";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { SEED_PAGES, SEED_PROJECTS, SEED_SETTINGS } from "./seed";

type Row = Record<string, any>;
type Runner = {
  query: (sql: string, params?: unknown[]) => Promise<Row[]>;
  exec: (sql: string) => Promise<void>;
};

const TERMS_MIGRATION = "aidenns-designs-white-wordmark-v4-2026-10";

function refreshBrand(value: any, key = ""): any {
  if (typeof value === "string") {
    if (["href", "url", "liveUrl", "tutoringUrl", "slug", "id"].includes(key) || /^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
    return value.replace(/AidennsDesigns/g, "Aidenn's Designs");
  }
  if (Array.isArray(value)) return value.map((item) => refreshBrand(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, refreshBrand(v, k)]));
  }
  return value;
}

function refreshSeededTerms(slug: string, raw: any, seeded: any): any {
  if (!raw || !seeded || !Array.isArray(raw.sections)) return refreshBrand(raw);
  const canonical = seeded.sections as any[];
  const replacement = (section: any) => {
    if (section.type === "pricing") {
      return canonical.find((candidate) => candidate.type === "pricing" && (candidate.anchor || "") === (section.anchor || ""));
    }
    if (section.type === "text" && ["domains", "hosting-access", "limits"].includes(section.anchor)) {
      return canonical.find((candidate) => candidate.type === "text" && candidate.anchor === section.anchor);
    }
    if (slug === "about" && section.type === "text" && /what aidenn(?:s|'s)\s*designs does/i.test(section.heading || "")) {
      return canonical.find((candidate) => candidate.type === "text" && /what aidenn's designs does/i.test(candidate.heading || ""));
    }
    if (slug === "home" && section.type === "services") {
      return canonical.find((candidate) => candidate.type === "services");
    }
    if (slug === "home" && section.type === "hero" && section.variant === "home") {
      return canonical.find((candidate) => candidate.type === "hero" && candidate.variant === "home");
    }
    if ((slug === "home" || slug === "about") && section.type === "features") {
      return canonical.find((candidate) => candidate.type === "features");
    }
    if (slug === "process" && section.type === "process") {
      return canonical.find((candidate) => candidate.type === "process");
    }
    if (section.type === "faq") {
      return canonical.find((candidate) => candidate.type === "faq");
    }
    return undefined;
  };
  const sections = raw.sections.map((section: any) => {
    const template = replacement(section);
    if (!template) return section;
    if (section.type === "faq") {
      const oldItems = Array.isArray(section.items) ? section.items : [];
      const newItems = [...oldItems];
      const matches = (oldQuestion: string, nextQuestion: string) => {
        if (/domain is included/i.test(nextQuestion)) return /domain is included/i.test(oldQuestion);
        if (/who owns my domain/i.test(nextQuestion)) return /who owns my domain/i.test(oldQuestion);
        if (/what happens if i cancel/i.test(nextQuestion)) return /what happens if i cancel/i.test(oldQuestion);
        if (/how much does a website cost/i.test(nextQuestion)) return /how much does a website cost/i.test(oldQuestion);
        if (/can i buy my website/i.test(nextQuestion)) return /can i buy my website/i.test(oldQuestion);
        if (/can i change my care plan/i.test(nextQuestion)) return /can i change .*plan/i.test(oldQuestion);
        if (/what do the care plans include/i.test(nextQuestion)) return /care plans include/i.test(oldQuestion);
        if (/what is a .*set of revisions/i.test(nextQuestion)) return /set of revisions/i.test(oldQuestion);
        return oldQuestion === nextQuestion;
      };
      for (const item of template.items ?? []) {
        const index = newItems.findIndex((current: any) => matches(current.question ?? "", item.question ?? ""));
        if (index >= 0) newItems[index] = { ...newItems[index], ...item };
        else newItems.push(item);
      }
      return { ...section, eyebrow: template.eyebrow, heading: template.heading, items: newItems };
    }
    if (section.type === "process") {
      const steps = Array.isArray(section.steps) ? section.steps : [];
      const domain = template.steps?.find((step: any) => step.title === "Domain");
      const updatedSteps = steps.map((step: any) => step.title === "Domain" && domain ? { ...step, ...domain } : step);
      return { ...section, steps: updatedSteps };
    }
    if (section.type === "features" && (slug === "home" || slug === "about")) {
      const items = (section.items ?? []).map((item: any) => {
        const target = template.items?.find((candidate: any) =>
          /domain|approval before domain/i.test(item.title ?? "") && /domain|approval before domain/i.test(candidate.title ?? ""),
        );
        return target ? { ...item, ...target } : item;
      });
      return { ...section, items };
    }
    if (slug === "home" && section.type === "services") {
      const items = (section.items ?? []).map((item: any) => {
        const target = template.items?.find((candidate: any) => {
          const title = String(item.title ?? "").toLowerCase();
          return title.includes("website design") && String(candidate.title).toLowerCase().includes("website design")
            || title.includes("hosting") && String(candidate.title).toLowerCase().includes("hosting")
            || title.includes("domain") && String(candidate.title).toLowerCase().includes("domain");
        });
        return target ? { ...item, body: target.body } : item;
      });
      return { ...section, items };
    }
    return { ...template, id: section.id };
  });

  if (slug === "services" && !sections.some((section: any) => section.type === "pricing" && section.anchor === "print-design")) {
    const extra = canonical.find((section) => section.type === "pricing" && section.anchor === "print-design");
    if (extra) {
      const primary = sections.findIndex((section: any) => section.type === "pricing" && section.anchor === "pricing");
      sections.splice(primary >= 0 ? primary + 1 : sections.length, 0, { ...extra, id: randomUUID() });
    }
  }

  let refreshed = { ...raw, sections };
  if (slug === "home" && /\$500 one-time build/i.test(String(raw.seoDescription ?? ""))) {
    refreshed = { ...refreshed, seoTitle: seeded.seoTitle, seoDescription: seeded.seoDescription };
  } else if (slug === "services" && /Website design for \$500 one time/i.test(String(raw.seoDescription ?? ""))) {
    refreshed = { ...refreshed, seoTitle: seeded.seoTitle, seoDescription: seeded.seoDescription };
  } else if (/AidennsDesigns/.test(JSON.stringify(raw))) {
    refreshed = { ...refreshed, seoTitle: refreshBrand(raw.seoTitle), seoDescription: refreshBrand(raw.seoDescription) };
  }
  return refreshBrand(refreshed);
}

const SCHEMA = `
create table if not exists meta (key text primary key, value text not null);
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft','published')),
  draft jsonb not null,
  published jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text not null default '',
  details text not null default '',
  services jsonb not null default '[]',
  kind text not null default 'concept' check (kind in ('concept','client')),
  client_confirmed boolean not null default false,
  cover jsonb,
  gallery jsonb not null default '[]',
  live_url text not null default '',
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  person text not null,
  business text not null default '',
  role text not null default '',
  image jsonb,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  data bytea not null,
  mime text not null,
  width int not null,
  height int not null,
  bytes int not null,
  filename text not null default '',
  alt text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists revisions (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  entity_id text not null,
  label text not null default '',
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists revisions_lookup on revisions (entity, entity_id, created_at desc);
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business text not null default '',
  contact text not null,
  website text not null default '',
  about text not null,
  goals text not null,
  features text not null default '',
  handled boolean not null default false,
  email_status text not null default 'not_configured',
  created_at timestamptz not null default now()
);
create table if not exists rate_limits (
  key text primary key,
  count int not null,
  window_start timestamptz not null default now()
);
`;

const g = globalThis as unknown as { __db?: Promise<Runner>; __ready?: Promise<void> };

async function connect(): Promise<Runner> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = new Pool({ connectionString: url, max: 3 });
    return {
      query: async (sql, params) => (await pool.query(sql, params as any[])).rows,
      exec: async (sql) => {
        await pool.query(sql);
      },
    };
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }
  // Local development only: embedded Postgres persisted in .data/
  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdirSync } = await import("node:fs");
  mkdirSync(".data", { recursive: true });
  const pg = new PGlite(".data/pglite");
  await pg.waitReady;
  return {
    query: async (sql, params) => (await pg.query(sql, params as any[])).rows as Row[],
    exec: async (sql) => {
      await pg.exec(sql);
    },
  };
}

function runner(): Promise<Runner> {
  return (g.__db ??= connect().catch((e) => {
    g.__db = undefined;
    throw e;
  }));
}

async function migrate(r: Runner) {
  await r.exec(SCHEMA);
  const done = await r.query("select 1 from meta where key = 'seeded'");
  if (!done.length) {
    for (const p of SEED_PAGES) {
      await r.query(
        `insert into pages (slug, status, draft, published, published_at)
         values ($1, 'published', $2::jsonb, $2::jsonb, now()) on conflict (slug) do nothing`,
        [p.slug, JSON.stringify(p.content)],
      );
    }
    await r.query(
      `insert into settings (key, value) values ('site', $1::jsonb) on conflict (key) do nothing`,
      [JSON.stringify(SEED_SETTINGS)],
    );
    await r.query(`insert into meta (key, value) values ('seeded', '1') on conflict (key) do nothing`);
  }

  // Refresh the owner-approved digital-design pricing and public contact details in seeded site content.
  // Only the affected sections are refreshed; unrelated page content and owner-added FAQ items stay intact.
  const termsDone = await r.query("select 1 from meta where key = $1", [TERMS_MIGRATION]);
  if (!termsDone.length) {
    const defaults = new Map(SEED_PAGES.map((page) => [page.slug, page.content]));
    const pages = await r.query("select id, slug, draft, published from pages");
    for (const row of pages) {
      const seeded = defaults.get(row.slug);
      const draft = refreshSeededTerms(row.slug, row.draft, seeded);
      const published = row.published ? refreshSeededTerms(row.slug, row.published, seeded) : null;
      await r.query("update pages set draft = $1::jsonb, published = $2::jsonb where id = $3", [
        JSON.stringify(draft), published ? JSON.stringify(published) : null, row.id,
      ]);
    }
    const settingsRows = await r.query("select value from settings where key = 'site'");
    if (settingsRows[0]) {
      const site = refreshBrand(settingsRows[0].value);
      site.contactEmail = SEED_SETTINGS.contactEmail;
      site.contactPhone = SEED_SETTINGS.contactPhone;
      site.footerBlurb = SEED_SETTINGS.footerBlurb;
      if (/\$500 one-time build/i.test(String(site.defaultDescription ?? ""))) {
        site.defaultDescription = SEED_SETTINGS.defaultDescription;
      }
      await r.query("update settings set value = $1::jsonb where key = 'site'", [JSON.stringify(site)]);
    }
    await r.query("insert into meta (key, value) values ($1, '1') on conflict (key) do nothing", [TERMS_MIGRATION]);
  }

  // Keep the requested starter portfolio available in fresh and already initialized databases.
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  for (const p of SEED_PROJECTS) {
    const image = await readFile(join(process.cwd(), "public", "projects", p.filename));
    await r.query(
      `insert into media (id, data, mime, width, height, bytes, filename, alt)
       values ($1,$2,'image/webp',$3,$4,$5,$6,$7) on conflict (id) do nothing`,
      [p.cover.id, image, p.cover.w, p.cover.h, image.byteLength, p.filename, p.cover.alt],
    );
    await r.query(
      `insert into projects (id, slug, name, summary, details, services, kind, client_confirmed, cover, gallery, live_url, status, sort_order)
       values ($1,$2,$3,$4,$5,$6::jsonb,'client',true,$7::jsonb,'[]'::jsonb,$8,'published',$9)
       on conflict (slug) do nothing`,
      [p.id, p.slug, p.name, p.summary, p.details, JSON.stringify(p.services), JSON.stringify(p.cover), p.liveUrl, p === SEED_PROJECTS[0] ? 0 : 1],
    );
  }
}

export async function query<T = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
  const r = await runner();
  g.__ready ??= migrate(r).catch((e) => {
    g.__ready = undefined;
    throw e;
  });
  await g.__ready;
  return (await r.query(sql, params)) as T[];
}

/** Fixed-window counter. Returns the count within the current window, including this hit. */
export async function hitRateLimit(key: string, windowSeconds: number): Promise<number> {
  const rows = await query<{ count: number }>(
    `insert into rate_limits (key, count, window_start) values ($1, 1, now())
     on conflict (key) do update set
       count = case when rate_limits.window_start < now() - make_interval(secs => $2::double precision) then 1 else rate_limits.count + 1 end,
       window_start = case when rate_limits.window_start < now() - make_interval(secs => $2::double precision) then now() else rate_limits.window_start end
     returning count`,
    [key, windowSeconds],
  );
  return Number(rows[0].count);
}

export async function clearRateLimit(key: string) {
  await query("delete from rate_limits where key = $1", [key]);
}

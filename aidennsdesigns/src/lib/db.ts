import "server-only";
import { Pool } from "pg";
import { SEED_PAGES, SEED_PROJECTS, SEED_SETTINGS } from "./seed";

type Row = Record<string, any>;
type Runner = {
  query: (sql: string, params?: unknown[]) => Promise<Row[]>;
  exec: (sql: string) => Promise<void>;
};

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

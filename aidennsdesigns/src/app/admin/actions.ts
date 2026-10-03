"use server";
import { query } from "@/lib/db";
import { endSession, requireOwner } from "@/lib/auth";
import {
  RESERVED_SLUGS, cleanImg, cleanPageContent, cleanSettings, isSlug, isUuid, normalizeHref, isExternal,
  type ContentError, type Img, type PageContent, type SiteSettings,
} from "@/lib/content";
import { addRevision, getMedia, getRevision, getPage, getSettings, mediaUsage } from "@/lib/data";
import { redirect } from "next/navigation";

export type Result = { ok: boolean; errors?: ContentError[]; message?: string; id?: string; savedAt?: string; status?: string };
const bad = (message: string, path = ""): Result => ({ ok: false, errors: [{ path, message }], message });
const errs = (errors: ContentError[]): Result => ({ ok: false, errors, message: errors[0]?.message });
const now = () => new Date().toISOString();
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "");

export async function signOut() {
  await requireOwner();
  await endSession();
  redirect("/admin/login");
}

// ---------------- pages ----------------

export async function savePage(input: { id: string | null; slug: string; content: unknown; publish: boolean }): Promise<Result> {
  await requireOwner();
  const existing = input.id && isUuid(input.id) ? await getPage(input.id) : null;
  if (input.id && !existing) return bad("This page no longer exists.");
  const isHome = existing?.slug === "home";
  const slug = isHome ? "home" : str(input.slug, 60).toLowerCase();

  const errors: ContentError[] = [];
  if (!slug) errors.push({ path: "slug", message: "URL slug is required." });
  else if (!isSlug(slug)) errors.push({ path: "slug", message: "URL slug can only use lowercase letters, numbers and single hyphens." });
  else if (!isHome && (RESERVED_SLUGS.includes(slug) || slug === "home")) errors.push({ path: "slug", message: `“${slug}” is reserved. Choose another URL slug.` });
  else {
    const dup = await query("select 1 from pages where slug = $1 and id <> $2", [slug, existing?.id ?? "00000000-0000-0000-0000-000000000000"]);
    if (dup.length) errors.push({ path: "slug", message: `Another page already uses the URL “/${slug}”.` });
  }
  const { value, errors: cErrors } = cleanPageContent(input.content, input.publish);
  errors.push(...cErrors);
  if (errors.length) return errs(errors);

  let id = existing?.id;
  if (!existing) {
    const rows = await query<{ id: string }>(
      "insert into pages (slug, status, draft) values ($1, 'draft', $2::jsonb) returning id", [slug, JSON.stringify(value)],
    );
    id = rows[0].id;
  } else {
    await query("update pages set slug = $2, draft = $3::jsonb, updated_at = now() where id = $1", [existing.id, slug, JSON.stringify(value)]);
  }
  if (input.publish) {
    await query("update pages set status = 'published', published = draft, published_at = now() where id = $1", [id]);
    await addRevision("page", id!, `Published “${value.title}”`, value);
  }
  return { ok: true, id, savedAt: now(), status: input.publish ? "published" : existing?.status ?? "draft", message: input.publish ? "Published. The live page is updated." : "Draft saved. The public page has not changed." };
}

export async function unpublishPage(id: string): Promise<Result> {
  await requireOwner();
  const p = isUuid(id) ? await getPage(id) : null;
  if (!p) return bad("Page not found.");
  if (p.slug === "home") return bad("The home page can’t be unpublished. Edit it instead.");
  await query("update pages set status = 'draft', updated_at = now() where id = $1", [id]);
  return { ok: true, id, status: "draft", message: "Unpublished. The page is no longer public." };
}

export async function deletePage(id: string): Promise<Result> {
  await requireOwner();
  const p = isUuid(id) ? await getPage(id) : null;
  if (!p) return bad("Page not found.");
  if (p.slug === "home") return bad("The home page can’t be deleted.");
  await query("delete from pages where id = $1", [id]);
  await query("delete from revisions where entity = 'page' and entity_id = $1", [id]);
  return { ok: true, message: "Page deleted." };
}

// ---------------- revisions (restore = load into the editor, then save/publish) ----------------

export async function loadRevision(revId: string): Promise<{ ok: boolean; entity?: string; data?: unknown; message?: string }> {
  await requireOwner();
  const r = isUuid(revId) ? await getRevision(revId) : null;
  if (!r) return { ok: false, message: "Revision not found." };
  return { ok: true, entity: r.entity, data: r.data };
}

// ---------------- portfolio ----------------

export type ProjectInput = {
  id: string | null; name: string; slug: string; summary: string; details: string; servicesText: string;
  kind: string; clientConfirmed: boolean; cover: Img | null; gallery: Img[]; liveUrl: string;
  mode: "save" | "publish" | "unpublish";
};

export async function saveProject(input: ProjectInput): Promise<Result> {
  await requireOwner();
  const id = input.id && isUuid(input.id) ? input.id : null;
  const publish = input.mode === "publish";
  const name = str(input.name, 120);
  const slug = str(input.slug, 60).toLowerCase();
  const kind = input.kind === "client" ? "client" : "concept";
  const summary = str(input.summary, 300);
  const details = str(input.details, 4000);
  const services = str(input.servicesText, 1200).split("\n").map((s) => s.trim().slice(0, 80)).filter(Boolean).slice(0, 10);
  const cover = cleanImg(input.cover);
  const gallery = (Array.isArray(input.gallery) ? input.gallery.slice(0, 12) : []).map(cleanImg).filter(Boolean) as Img[];
  const liveRaw = str(input.liveUrl, 300);
  const liveUrl = liveRaw ? normalizeHref(liveRaw) : "";

  const e: ContentError[] = [];
  if (!name) e.push({ path: "name", message: "Project name is required." });
  if (!slug) e.push({ path: "slug", message: "URL slug is required." });
  else if (!isSlug(slug)) e.push({ path: "slug", message: "URL slug can only use lowercase letters, numbers and single hyphens." });
  else if ((await query("select 1 from projects where slug = $1 and id <> $2", [slug, id ?? "00000000-0000-0000-0000-000000000000"])).length)
    e.push({ path: "slug", message: `Another project already uses “${slug}”.` });
  if (liveRaw && (!liveUrl || !isExternal(liveUrl))) e.push({ path: "liveUrl", message: "Live site must be a full http(s) address." });
  if (publish) {
    if (!summary) e.push({ path: "summary", message: "Add a short summary before publishing." });
    if (!cover) e.push({ path: "cover", message: "Add a cover image before publishing." });
    else if (!cover.alt) e.push({ path: "cover", message: "Cover image needs alt text." });
    if (gallery.some((g) => !g.alt)) e.push({ path: "gallery", message: "Every gallery image needs alt text." });
    if (kind === "client" && !input.clientConfirmed) e.push({ path: "clientConfirmed", message: "Confirm this is real client work, or switch it to Concept project." });
  }
  if (e.length) return errs(e);

  const confirmed = kind === "client" && !!input.clientConfirmed;
  const vals = [name, slug, summary, details, JSON.stringify(services), kind, confirmed, cover ? JSON.stringify(cover) : null, JSON.stringify(gallery), liveUrl || ""];
  let rowId = id;
  const status = input.mode === "publish" ? "published" : input.mode === "unpublish" ? "draft" : null;
  if (!id) {
    const rows = await query<{ id: string }>(
      `insert into projects (name, slug, summary, details, services, kind, client_confirmed, cover, gallery, live_url, status, sort_order)
       values ($1,$2,$3,$4,$5::jsonb,$6,$7,$8::jsonb,$9::jsonb,$10,$11, coalesce((select max(sort_order)+1 from projects),0)) returning id`,
      [...vals, status ?? "draft"],
    );
    rowId = rows[0].id;
  } else {
    const r = await query(
      `update projects set name=$2, slug=$3, summary=$4, details=$5, services=$6::jsonb, kind=$7, client_confirmed=$8, cover=$9::jsonb,
         gallery=$10::jsonb, live_url=$11, status = coalesce($12, status), updated_at = now() where id=$1 returning id`,
      [id, ...vals, status],
    );
    if (!r.length) return bad("This project no longer exists.");
  }
  const cur = (await query<{ status: string }>("select status from projects where id=$1", [rowId]))[0].status;
  await addRevision("project", rowId!, `${cur === "published" ? "Published" : "Draft"} save of “${name}”`, { name, slug, summary, details, servicesText: services.join("\n"), kind, clientConfirmed: confirmed, cover, gallery, liveUrl });
  const message = input.mode === "publish" ? "Published. The project is live." : input.mode === "unpublish" ? "Unpublished. The project is hidden from the public site." : cur === "published" ? "Saved. Changes are live." : "Draft saved.";
  return { ok: true, id: rowId!, savedAt: now(), status: cur, message };
}

// ---------------- testimonials ----------------

export type TestimonialInput = {
  id: string | null; quote: string; person: string; business: string; role: string; image: Img | null;
  permission: boolean; mode: "save" | "publish" | "unpublish";
};

export async function saveTestimonial(input: TestimonialInput): Promise<Result> {
  await requireOwner();
  const id = input.id && isUuid(input.id) ? input.id : null;
  const quote = str(input.quote, 1200), person = str(input.person, 100), business = str(input.business, 120), role = str(input.role, 100);
  const image = cleanImg(input.image);
  const e: ContentError[] = [];
  if (!quote) e.push({ path: "quote", message: "Testimonial text is required." });
  if (!person) e.push({ path: "person", message: "Add the name or approved attribution to display." });
  if (input.mode === "publish") {
    if (!input.permission) e.push({ path: "permission", message: "Confirm you have permission to publish this testimonial." });
    if (image && !image.alt) e.push({ path: "image", message: "Image needs alt text." });
  }
  if (e.length) return errs(e);
  const status = input.mode === "publish" ? "published" : input.mode === "unpublish" ? "draft" : null;
  let rowId = id;
  if (!id) {
    const rows = await query<{ id: string }>(
      `insert into testimonials (quote, person, business, role, image, status, sort_order)
       values ($1,$2,$3,$4,$5::jsonb,$6, coalesce((select max(sort_order)+1 from testimonials),0)) returning id`,
      [quote, person, business, role, image ? JSON.stringify(image) : null, status ?? "draft"],
    );
    rowId = rows[0].id;
  } else {
    const r = await query(
      `update testimonials set quote=$2, person=$3, business=$4, role=$5, image=$6::jsonb, status = coalesce($7, status), updated_at = now() where id=$1 returning id`,
      [id, quote, person, business, role, image ? JSON.stringify(image) : null, status],
    );
    if (!r.length) return bad("This testimonial no longer exists.");
  }
  const cur = (await query<{ status: string }>("select status from testimonials where id=$1", [rowId]))[0].status;
  await addRevision("testimonial", rowId!, `Save of testimonial from ${person}`, { quote, person, business, role, image });
  const message = input.mode === "publish" ? "Published. The testimonial is public." : input.mode === "unpublish" ? "Unpublished. The testimonial is hidden." : cur === "published" ? "Saved. Changes are live." : "Draft saved.";
  return { ok: true, id: rowId!, savedAt: now(), status: cur, message };
}

// ---------------- ordering / deletion for projects & testimonials ----------------

const TABLES = { project: "projects", testimonial: "testimonials" } as const;

export async function moveItem(entity: keyof typeof TABLES, id: string, dir: -1 | 1): Promise<Result> {
  await requireOwner();
  const t = TABLES[entity];
  if (!t || !isUuid(id)) return bad("Invalid request.");
  const rows = await query<{ id: string }>(`select id from ${t} order by sort_order, created_at`);
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return { ok: true };
  [rows[i], rows[j]] = [rows[j], rows[i]];
  for (let k = 0; k < rows.length; k++) await query(`update ${t} set sort_order = $2 where id = $1`, [rows[k].id, k]);
  return { ok: true };
}

export async function deleteItem(entity: keyof typeof TABLES, id: string): Promise<Result> {
  await requireOwner();
  const t = TABLES[entity];
  if (!t || !isUuid(id)) return bad("Invalid request.");
  await query(`delete from ${t} where id = $1`, [id]);
  await query("delete from revisions where entity = $1 and entity_id = $2", [entity, id]);
  return { ok: true, message: "Deleted." };
}

// ---------------- settings ----------------

export async function saveSettings(partial: Partial<SiteSettings>): Promise<Result> {
  await requireOwner();
  const current = await getSettings();
  const { value, errors } = cleanSettings({ ...current, ...partial });
  if (errors.length) return errs(errors);
  await query(
    `insert into settings (key, value) values ('site', $1::jsonb) on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify(value)],
  );
  await addRevision("settings", "site", "Settings saved", value);
  return { ok: true, savedAt: now(), message: "Saved. Changes are live." };
}

// ---------------- media ----------------

export async function updateMediaAlt(id: string, alt: string): Promise<Result> {
  await requireOwner();
  if (!isUuid(id)) return bad("Invalid image.");
  await query("update media set alt = $2 where id = $1", [id, str(alt, 250)]);
  return { ok: true, message: "Saved." };
}

export async function deleteMedia(id: string): Promise<Result> {
  await requireOwner();
  if (!isUuid(id) || !(await getMedia(id))) return bad("Image not found.");
  const used = await mediaUsage(id);
  if (used.length) return bad(`Still in use, so it was not deleted. Remove it from: ${used.slice(0, 5).join("; ")}.`);
  await query("delete from media where id = $1", [id]);
  return { ok: true, message: "Image deleted." };
}

// ---------------- inquiries ----------------

export async function setInquiryHandled(id: string, handled: boolean): Promise<Result> {
  await requireOwner();
  if (!isUuid(id)) return bad("Invalid request.");
  await query("update inquiries set handled = $2 where id = $1", [id, handled]);
  return { ok: true };
}
export async function deleteInquiry(id: string): Promise<Result> {
  await requireOwner();
  if (!isUuid(id)) return bad("Invalid request.");
  await query("delete from inquiries where id = $1", [id]);
  return { ok: true, message: "Inquiry deleted." };
}

export type { PageContent };

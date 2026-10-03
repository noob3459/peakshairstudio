// Content model shared by the public renderer, the admin editor and server-side validation.
// Section types are a fixed, reviewed set. Owner text is only ever rendered as React text.

export type Link = { label: string; href: string };
export type Img = { id: string; alt: string; w: number; h: number };
export type Section = { id: string; type: SectionType } & Record<string, any>;
export type PageContent = {
  title: string;
  seoTitle: string;
  seoDescription: string;
  shareImage: Img | null;
  sections: Section[];
};
export type ContentError = { path: string; message: string };

export type Field =
  | { kind: "text"; key: string; label: string; max?: number; required?: boolean; help?: string }
  | { kind: "textarea"; key: string; label: string; max?: number; required?: boolean; help?: string; rows?: number }
  | { kind: "link"; key: string; label: string; help?: string }
  | { kind: "image"; key: string; label: string; help?: string }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[] }
  | { kind: "list"; key: string; label: string; itemLabel: string; max: number; fields: Field[] };

export type SectionType =
  | "hero" | "services" | "process" | "projects" | "pricing" | "features"
  | "faq" | "testimonials" | "text" | "image" | "cta" | "tutoring" | "contactForm";

const anchor: Field = {
  kind: "text", key: "anchor", label: "Anchor (optional)", max: 40,
  help: "Lets links jump to this section, e.g. “hosting-access” is reached with /services#hosting-access. Lowercase letters, numbers and hyphens.",
};
const eyebrow: Field = { kind: "text", key: "eyebrow", label: "Small label above heading", max: 60 };

export const SECTION_DEFS: Record<SectionType, { label: string; hint: string; fields: Field[] }> = {
  hero: {
    label: "Hero", hint: "Large opening block with headline and buttons.",
    fields: [
      { kind: "select", key: "variant", label: "Layout", options: [{ value: "home", label: "Home (with image or mockup)" }, { value: "page", label: "Page header (compact)" }] },
      eyebrow,
      { kind: "text", key: "headline", label: "Headline", max: 140, required: true, help: "Wrap a short phrase in *asterisks* for serif italic emphasis." },
      { kind: "textarea", key: "body", label: "Supporting text", max: 500, rows: 3 },
      { kind: "link", key: "primary", label: "Primary button" },
      { kind: "link", key: "secondary", label: "Secondary link" },
      { kind: "image", key: "image", label: "Image (optional)", help: "Home layout shows a designed website mockup when no image is chosen." },
      anchor,
    ],
  },
  services: {
    label: "Services", hint: "Cards describing what you offer.",
    fields: [eyebrow, { kind: "text", key: "heading", label: "Heading", max: 120, required: true }, { kind: "textarea", key: "intro", label: "Intro", max: 600, rows: 2 },
      { kind: "list", key: "items", label: "Cards", itemLabel: "Card", max: 6, fields: [{ kind: "text", key: "title", label: "Title", max: 80, required: true }, { kind: "textarea", key: "body", label: "Text", max: 500, rows: 3 }] }, anchor],
  },
  process: {
    label: "Process steps", hint: "Numbered steps from inquiry to launch.",
    fields: [eyebrow, { kind: "text", key: "heading", label: "Heading", max: 120, required: true }, { kind: "textarea", key: "intro", label: "Intro", max: 600, rows: 2 },
      { kind: "list", key: "steps", label: "Steps", itemLabel: "Step", max: 8, fields: [{ kind: "text", key: "title", label: "Title", max: 80, required: true }, { kind: "textarea", key: "body", label: "Text", max: 600, rows: 3 }] },
      { kind: "link", key: "link", label: "Link (optional)" }, anchor],
  },
  projects: {
    label: "Project grid", hint: "Published portfolio projects, in the order set under Portfolio.",
    fields: [eyebrow, { kind: "text", key: "heading", label: "Heading", max: 120, required: true }, { kind: "textarea", key: "intro", label: "Intro", max: 600, rows: 2 },
      { kind: "select", key: "limit", label: "How many to show", options: [{ value: "3", label: "First 3" }, { value: "6", label: "First 6" }, { value: "all", label: "All published" }] },
      { kind: "link", key: "link", label: "Link (optional)" }, anchor],
  },
  pricing: {
    label: "Pricing", hint: "Pricing cards and terms.",
    fields: [eyebrow, { kind: "text", key: "heading", label: "Heading", max: 120, required: true }, { kind: "textarea", key: "intro", label: "Intro", max: 600, rows: 2 },
      { kind: "list", key: "tiers", label: "Pricing cards", itemLabel: "Card", max: 6, fields: [
        { kind: "text", key: "name", label: "Name", max: 60, required: true }, { kind: "text", key: "price", label: "Price", max: 30, required: true },
        { kind: "text", key: "cadence", label: "Billing note (e.g. one time, per quarter)", max: 40 },
        { kind: "textarea", key: "description", label: "Description", max: 400, rows: 3 },
        { kind: "textarea", key: "features", label: "Included (one per line)", max: 800, rows: 4 }] },
      { kind: "list", key: "notes", label: "Terms callouts", itemLabel: "Callout", max: 6, fields: [{ kind: "text", key: "title", label: "Title", max: 80, required: true }, { kind: "textarea", key: "body", label: "Text", max: 800, rows: 3 }] },
      { kind: "textarea", key: "footnote", label: "Footnote", max: 500, rows: 2 },
      { kind: "link", key: "link", label: "Link (optional)" }, anchor],
  },
  features: {
    label: "Why work with us", hint: "Short list of concrete, supportable points.",
    fields: [eyebrow, { kind: "text", key: "heading", label: "Heading", max: 120, required: true }, { kind: "textarea", key: "intro", label: "Intro", max: 600, rows: 2 },
      { kind: "list", key: "items", label: "Points", itemLabel: "Point", max: 8, fields: [{ kind: "text", key: "title", label: "Title", max: 80, required: true }, { kind: "textarea", key: "body", label: "Text", max: 400, rows: 2 }] }, anchor],
  },
  faq: {
    label: "FAQ", hint: "Questions and answers.",
    fields: [eyebrow, { kind: "text", key: "heading", label: "Heading", max: 120, required: true }, { kind: "textarea", key: "intro", label: "Intro", max: 600, rows: 2 },
      { kind: "list", key: "items", label: "Questions", itemLabel: "Question", max: 30, fields: [{ kind: "text", key: "question", label: "Question", max: 200, required: true }, { kind: "textarea", key: "answer", label: "Answer (blank line = new paragraph)", max: 1500, rows: 4, required: true }] },
      { kind: "link", key: "link", label: "Link (optional)" }, anchor],
  },
  testimonials: {
    label: "Testimonials", hint: "Published testimonials. Hidden entirely when none are published.",
    fields: [eyebrow, { kind: "text", key: "heading", label: "Heading", max: 120, required: true },
      { kind: "select", key: "limit", label: "How many to show", options: [{ value: "3", label: "First 3" }, { value: "6", label: "First 6" }, { value: "all", label: "All published" }] }, anchor],
  },
  text: {
    label: "Text block", hint: "Heading and paragraphs.",
    fields: [eyebrow, { kind: "text", key: "heading", label: "Heading", max: 120 }, { kind: "textarea", key: "body", label: "Text (blank line = new paragraph)", max: 4000, rows: 8 },
      { kind: "select", key: "tone", label: "Style", options: [{ value: "plain", label: "Plain" }, { value: "panel", label: "Highlighted panel" }] },
      { kind: "link", key: "link", label: "Button (optional)" }, anchor],
  },
  image: {
    label: "Image", hint: "A single image with caption.",
    fields: [{ kind: "image", key: "image", label: "Image" }, { kind: "text", key: "caption", label: "Caption", max: 200 }, anchor],
  },
  cta: {
    label: "Call to action", hint: "Closing prompt with buttons.",
    fields: [{ kind: "text", key: "heading", label: "Heading", max: 140, required: true }, { kind: "textarea", key: "body", label: "Text", max: 400, rows: 2 },
      { kind: "link", key: "primary", label: "Primary button" }, { kind: "link", key: "secondary", label: "Secondary link" }, anchor],
  },
  tutoring: {
    label: "Aidenn’s Tutoring cross-link", hint: "Small secondary panel. The destination is set in Site settings.",
    fields: [{ kind: "text", key: "heading", label: "Heading", max: 100, required: true }, { kind: "textarea", key: "body", label: "Text", max: 400, rows: 3 }, { kind: "text", key: "buttonLabel", label: "Button label", max: 40, required: true }],
  },
  contactForm: {
    label: "Request a Website form", hint: "The inquiry form. Submissions appear under Inquiries.",
    fields: [eyebrow, { kind: "text", key: "heading", label: "Heading", max: 120, required: true }, { kind: "textarea", key: "intro", label: "Intro", max: 600, rows: 3 }, anchor],
  },
};

export const SECTION_TYPES = Object.keys(SECTION_DEFS) as SectionType[];

// ---------- links ----------

export function normalizeHref(raw: unknown): string | null {
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v || /[\s\u0000-\u001f\\]/.test(v) || v.length > 500) return null;
  if (v.startsWith("//")) return null;
  if (v.startsWith("/") || v.startsWith("#")) return v;
  if (/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(v)) return v;
  if (/^tel:\+?[0-9().-]{5,25}$/i.test(v)) return v;
  try {
    const u = new URL(v);
    if (u.protocol === "https:" || u.protocol === "http:") {
      const s = u.toString();
      return u.pathname === "/" && !u.search && !u.hash ? s.replace(/\/$/, "") : s;
    }
  } catch {}
  return null;
}
export const isExternal = (href: string) => /^https?:\/\//i.test(href);
export const isSlug = (s: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && s.length <= 60;
export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
export const RESERVED_SLUGS = ["admin", "api", "media", "preview", "sitemap", "robots", "favicon", "login", "_next"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: unknown): s is string => typeof s === "string" && UUID.test(s);

// ---------- cleaning / validation ----------

type Ctx = { errors: ContentError[]; strict: boolean };
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "");

export function cleanImg(v: any): Img | null {
  if (!v || typeof v !== "object" || !isUuid(v.id)) return null;
  const n = (x: unknown) => Math.min(20000, Math.max(1, Math.round(Number(x)) || 1));
  return { id: v.id.toLowerCase(), alt: str(v.alt, 250), w: n(v.w), h: n(v.h) };
}

function cleanField(f: Field, v: any, path: string, ctx: Ctx): any {
  switch (f.kind) {
    case "text":
    case "textarea": {
      const s = str(v, f.max ?? (f.kind === "text" ? 200 : 4000));
      if (f.key === "anchor" && s && !isSlug(s)) ctx.errors.push({ path, message: `${f.label}: use lowercase letters, numbers and hyphens only.` });
      if (f.required && ctx.strict && !s) ctx.errors.push({ path, message: `${f.label} is required.` });
      return s;
    }
    case "select": {
      const ok = f.options.some((o) => o.value === v);
      return ok ? v : f.options[0].value;
    }
    case "link": {
      const label = str(v?.label, 80);
      const rawHref = str(v?.href, 500);
      if (!label && !rawHref) return null;
      const href = normalizeHref(rawHref);
      if (!label) ctx.errors.push({ path, message: `${f.label}: add a label.` });
      if (!href) ctx.errors.push({ path, message: `${f.label}: enter an internal path like /contact, or a full https:// link. Other link types are not allowed.` });
      return { label, href: href ?? rawHref };
    }
    case "image": {
      const img = cleanImg(v);
      if (img && ctx.strict && !img.alt) ctx.errors.push({ path, message: `${f.label}: describe the image in the alt text field.` });
      return img;
    }
    case "list": {
      const arr = Array.isArray(v) ? v.slice(0, f.max) : [];
      return arr.map((item, i) => {
        const out: Record<string, any> = {};
        for (const sub of f.fields) out[sub.key] = cleanField(sub, item?.[sub.key], `${path}.${i}.${sub.key}`, ctx);
        return out;
      });
    }
  }
}

export function cleanSections(input: unknown, ctx: Ctx): Section[] {
  const arr = Array.isArray(input) ? input.slice(0, 40) : [];
  const seen = new Set<string>();
  const out: Section[] = [];
  arr.forEach((raw, i) => {
    const type = raw?.type as SectionType;
    const def = SECTION_DEFS[type];
    if (!def) return;
    let id = typeof raw.id === "string" && /^[a-z0-9-]{4,40}$/i.test(raw.id) ? raw.id : crypto.randomUUID();
    if (seen.has(id)) id = crypto.randomUUID();
    seen.add(id);
    const s: Section = { id, type };
    for (const f of def.fields) s[f.key] = cleanField(f, raw[f.key], `sections.${i}.${f.key}`, ctx);
    out.push(s);
  });
  return out;
}

export function cleanPageContent(input: any, strict: boolean): { value: PageContent; errors: ContentError[] } {
  const ctx: Ctx = { errors: [], strict };
  const title = str(input?.title, 120);
  if (!title) ctx.errors.push({ path: "title", message: "Page title is required." });
  const seoDescription = str(input?.seoDescription, 200);
  const shareImage = cleanImg(input?.shareImage);
  if (shareImage && strict && !shareImage.alt) ctx.errors.push({ path: "shareImage", message: "Social-share image needs alt text." });
  const sections = cleanSections(input?.sections, ctx);
  if (strict && !sections.length) ctx.errors.push({ path: "sections", message: "Add at least one section before publishing." });
  return { value: { title, seoTitle: str(input?.seoTitle, 70), seoDescription, shareImage, sections }, errors: ctx.errors };
}

// ---------- site settings ----------

export type SiteSettings = {
  nav: Link[];
  headerCta: Link;
  footerHeading: string;
  footerBlurb: string;
  footerLinks: Link[];
  contactEmail: string;
  contactPhone: string;
  social: Link[];
  tutoringUrl: string;
  defaultDescription: string;
  defaultShareImage: Img | null;
};

export function cleanSettings(input: any): { value: SiteSettings; errors: ContentError[] } {
  const ctx: Ctx = { errors: [], strict: true };
  const links = (key: string, label: string, max: number) =>
    cleanField({ kind: "list", key, label, itemLabel: label, max, fields: [{ kind: "link", key: "l", label }] } as Field, (Array.isArray(input?.[key]) ? input[key] : []).map((l: any) => ({ l })), key, ctx)
      .map((x: any) => x.l).filter(Boolean) as Link[];
  const one = (key: string, label: string): Link => cleanField({ kind: "link", key, label }, input?.[key], key, ctx) ?? { label: "", href: "" };
  const headerCta = one("headerCta", "Header button");
  if (!headerCta.href) ctx.errors.push({ path: "headerCta", message: "The header button needs a label and destination." });
  const email = str(input?.contactEmail, 200);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) ctx.errors.push({ path: "contactEmail", message: "Enter a valid email address or leave it empty." });
  const phone = str(input?.contactPhone, 40);
  if (phone && !/^\+?[0-9().\s-]{5,25}$/.test(phone)) ctx.errors.push({ path: "contactPhone", message: "Enter a valid phone number or leave it empty." });
  const tutoringUrl = normalizeHref(input?.tutoringUrl);
  if (!tutoringUrl || !isExternal(tutoringUrl)) ctx.errors.push({ path: "tutoringUrl", message: "Tutoring link must be a full https:// address." });
  return {
    value: {
      nav: links("nav", "Navigation link", 8),
      headerCta,
      footerHeading: str(input?.footerHeading, 80),
      footerBlurb: str(input?.footerBlurb, 300),
      footerLinks: links("footerLinks", "Footer link", 12),
      contactEmail: email,
      contactPhone: phone,
      social: links("social", "Social link", 6),
      tutoringUrl: tutoringUrl ?? "https://aidennstutoring.com",
      defaultDescription: str(input?.defaultDescription, 200),
      defaultShareImage: cleanImg(input?.defaultShareImage),
    },
    errors: ctx.errors,
  };
}

export function newSection(type: SectionType): Section {
  const s: Section = { id: crypto.randomUUID(), type };
  for (const f of SECTION_DEFS[type].fields) {
    s[f.key] = f.kind === "list" ? [] : f.kind === "select" ? f.options[0].value : f.kind === "link" || f.kind === "image" ? null : "";
  }
  return s;
}

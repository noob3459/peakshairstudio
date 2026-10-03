"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SECTION_DEFS, SECTION_TYPES, newSection, slugify, type ContentError, type PageContent, type Section, type SectionType } from "@/lib/content";
import { deletePage, loadRevision, savePage, unpublishPage } from "@/app/admin/actions";
import { ConfirmButton, FieldEditor, ImagePicker, Notice, StatusPill, move, useUnsavedGuard } from "./kit";

type Props = {
  id: string | null; slug: string; status: "draft" | "published"; isHome: boolean;
  content: PageContent; hasUnpublished: boolean; revisions: { id: string; label: string; createdAt: string }[];
};

const snapshot = (slug: string, c: PageContent) => JSON.stringify({ slug, c });

export function PageEditor(props: Props) {
  const router = useRouter();
  const [id, setId] = useState(props.id);
  const [slug, setSlug] = useState(props.slug);
  const [slugTouched, setSlugTouched] = useState(!!props.id);
  const [content, setContent] = useState<PageContent>(props.content);
  const [status, setStatus] = useState(props.status);
  const [unpublishedChanges, setUnpublishedChanges] = useState(props.hasUnpublished);
  const [baseline, setBaseline] = useState(snapshot(props.slug, props.content));
  const [errors, setErrors] = useState<ContentError[]>([]);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [addType, setAddType] = useState<SectionType>("text");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const dirty = snapshot(slug, content) !== baseline;
  useUnsavedGuard(dirty);
  const set = (patch: Partial<PageContent>) => setContent((c) => ({ ...c, ...patch }));
  const errFor = (path: string) => errors.filter((e) => e.path === path).map((e) => e.message);
  const setSection = (i: number, patch: Partial<Section>) => set({ sections: content.sections.map((s, k) => (k === i ? { ...s, ...patch } : s)) });

  const run = (publish: boolean) => start(async () => {
    setMsg(null);
    const r = await savePage({ id, slug, content, publish });
    if (!r.ok) { setErrors(r.errors ?? []); setMsg({ kind: "error", text: r.message ?? "Couldn’t save." }); return; }
    setErrors([]);
    setBaseline(snapshot(slug, content));
    setStatus(r.status as "draft" | "published");
    setUnpublishedChanges(!publish && status === "published");
    setMsg({ kind: "ok", text: r.message ?? "Saved." });
    if (!id && r.id) { setId(r.id); router.replace(`/admin/pages/${r.id}`); }
  });

  const restore = (revId: string) => start(async () => {
    const r = await loadRevision(revId);
    if (!r.ok || r.entity !== "page") { setMsg({ kind: "error", text: r.message ?? "Couldn’t load that version." }); return; }
    setContent(r.data as PageContent);
    setMsg({ kind: "ok", text: "Earlier published version loaded into the editor. Review it, then Save draft or Publish." });
  });

  const publicPath = props.isHome ? "/" : `/${slug}`;
  const sectionErrors = useMemo(() => errors.filter((e) => e.path.startsWith("sections.")), [errors]);

  return (
    <div className="ad-editor">
      <div className="ad-toolbar" role="region" aria-label="Page actions">
        <div className="ad-toolbar-info">
          {id && <StatusPill status={status} extra={status === "published" && (unpublishedChanges || dirty) ? "unpublished changes" : undefined} />}
          {dirty ? <span className="ad-dirty">Unsaved changes</span> : id ? <span className="ad-help">All changes saved</span> : null}
        </div>
        <div className="ad-actions">
          {id && <a className="ad-btn" href={`/preview/page/${id}`} target="_blank" rel="noopener noreferrer">Preview draft<span className="sr-only"> (opens in a new tab; shows the last saved draft)</span></a>}
          <button type="button" className="ad-btn" disabled={pending} onClick={() => run(false)}>{pending ? "Saving…" : "Save draft"}</button>
          <button type="button" className="ad-btn ad-primary" disabled={pending} onClick={() => run(true)}>Publish</button>
        </div>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {errors.length > 0 && (
        <Notice kind="error">
          <strong>Please fix:</strong>
          <ul>{errors.map((e, i) => <li key={i}>{e.message}</li>)}</ul>
        </Notice>
      )}
      <p className="ad-help">“Preview draft” shows the last saved draft. Save first to see recent edits. Saving a draft never changes the public page.</p>

      <section className="ad-card" aria-labelledby="pg-set">
        <h2 id="pg-set">Page settings</h2>
        <div className="ad-field"><label htmlFor="pg-title">Page title <span className="ad-req">*</span></label>
          <input id="pg-title" className="ad-input" value={content.title} maxLength={120} aria-invalid={errFor("title").length ? true : undefined}
            onChange={(e) => { set({ title: e.target.value }); if (!slugTouched && !props.isHome) setSlug(slugify(e.target.value)); }} />
          {errFor("title").map((m, i) => <p key={i} className="ad-err">{m}</p>)}</div>
        <div className="ad-field"><label htmlFor="pg-slug">URL slug <span className="ad-req">*</span></label>
          {props.isHome ? <p className="ad-help">This is the home page. It lives at <code>/</code>.</p> : (
            <>
              <div className="ad-prefix"><span aria-hidden="true">/</span>
                <input id="pg-slug" className="ad-input" value={slug} maxLength={60} aria-invalid={errFor("slug").length ? true : undefined} aria-describedby="pg-slug-h"
                  onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase()); }} /></div>
              <p id="pg-slug-h" className="ad-help">Public address: <code>{publicPath}</code>. Changing the slug of a published page moves its URL immediately.</p>
            </>
          )}
          {errFor("slug").map((m, i) => <p key={i} className="ad-err">{m}</p>)}</div>
        <div className="ad-field"><label htmlFor="pg-seot">SEO title</label>
          <input id="pg-seot" className="ad-input" value={content.seoTitle} maxLength={70} onChange={(e) => set({ seoTitle: e.target.value })} />
          <p className="ad-help">Shown in search results and browser tabs. {content.seoTitle.length}/70. Falls back to the page title.</p></div>
        <div className="ad-field"><label htmlFor="pg-seod">SEO description</label>
          <textarea id="pg-seod" className="ad-input" rows={2} value={content.seoDescription} maxLength={200} onChange={(e) => set({ seoDescription: e.target.value })} />
          <p className="ad-help">{content.seoDescription.length}/200. Describe the page accurately.</p></div>
        <ImagePicker label="Social-share image" value={content.shareImage} onChange={(v) => set({ shareImage: v })} help="Shown when the page is shared. Optional." />
      </section>

      <section aria-labelledby="pg-sections">
        <h2 id="pg-sections">Sections</h2>
        {content.sections.length === 0 && <p className="ad-help">No sections yet. Add one below.</p>}
        {content.sections.map((s, i) => {
          const def = SECTION_DEFS[s.type as SectionType];
          const isOpen = open[s.id] ?? false;
          const hasErr = sectionErrors.some((e) => e.path.startsWith(`sections.${i}.`));
          const label = s.heading || s.headline || def.label;
          return (
            <div key={s.id} className={`ad-card ad-section${hasErr ? " has-err" : ""}`}>
              <div className="ad-section-head">
                <button type="button" className="ad-toggle" aria-expanded={isOpen} aria-controls={`sec-${s.id}`} onClick={() => setOpen({ ...open, [s.id]: !isOpen })}>
                  <span className="ad-chev" aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
                  <span><strong>{def.label}</strong><small>{String(label).replace(/\*/g, "").slice(0, 60)}</small></span>
                </button>
                <span className="ad-actions">
                  <button type="button" className="ad-btn" disabled={i === 0} aria-label={`Move section ${i + 1} up`} onClick={() => set({ sections: move(content.sections, i, -1) })}>↑</button>
                  <button type="button" className="ad-btn" disabled={i === content.sections.length - 1} aria-label={`Move section ${i + 1} down`} onClick={() => set({ sections: move(content.sections, i, 1) })}>↓</button>
                  <ConfirmButton label="Remove" confirmText="Remove this section?" confirmLabel="Yes, remove" onConfirm={() => set({ sections: content.sections.filter((_, k) => k !== i) })} />
                </span>
              </div>
              {isOpen && (
                <div id={`sec-${s.id}`} className="ad-section-body">
                  <p className="ad-help">{def.hint}</p>
                  {def.fields.map((f) => (
                    <FieldEditor key={f.key} field={f} value={s[f.key]} onChange={(v) => setSection(i, { [f.key]: v })}
                      errors={errFor(`sections.${i}.${f.key}`).concat(errors.filter((e) => e.path.startsWith(`sections.${i}.${f.key}.`)).map((e) => e.message))} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="ad-card ad-add">
          <label htmlFor="add-type">Add a section</label>
          <div className="ad-actions">
            <select id="add-type" className="ad-input" value={addType} onChange={(e) => setAddType(e.target.value as SectionType)}>
              {SECTION_TYPES.map((t) => <option key={t} value={t}>{SECTION_DEFS[t].label}</option>)}
            </select>
            <button type="button" className="ad-btn" onClick={() => { const n = newSection(addType); set({ sections: [...content.sections, n] }); setOpen({ ...open, [n.id]: true }); }}>Add section</button>
          </div>
          <p className="ad-help">{SECTION_DEFS[addType].hint}</p>
        </div>
      </section>

      {props.revisions.length > 0 && (
        <section className="ad-card" aria-labelledby="pg-rev">
          <h2 id="pg-rev">Published versions</h2>
          <p className="ad-help">Each publish is kept. Loading one puts it in the editor; nothing changes publicly until you Publish.</p>
          <ul className="ad-revs">
            {props.revisions.map((r) => (
              <li key={r.id}><span>{r.label}<small>{new Date(r.createdAt).toLocaleString()}</small></span>
                <button type="button" className="ad-btn" disabled={pending} onClick={() => { if (!dirty || confirm("Replace your unsaved edits with this version?")) restore(r.id); }}>Load into editor</button></li>
            ))}
          </ul>
        </section>
      )}

      {id && !props.isHome && (
        <section className="ad-card ad-danger-zone" aria-labelledby="pg-danger">
          <h2 id="pg-danger">Visibility and deletion</h2>
          <div className="ad-actions">
            {status === "published" && (
              <ConfirmButton label="Unpublish" confirmText="Hide this page from the public?" confirmLabel="Yes, unpublish"
                onConfirm={async () => { const r = await unpublishPage(id); setMsg({ kind: r.ok ? "ok" : "error", text: r.message ?? "" }); if (r.ok) setStatus("draft"); }} />
            )}
            <ConfirmButton label="Delete page" confirmText="Permanently delete this page and its history?"
              onConfirm={async () => { const r = await deletePage(id); if (r.ok) { setBaseline(snapshot(slug, content)); router.push("/admin/pages"); } else setMsg({ kind: "error", text: r.message ?? "" }); }} />
          </div>
        </section>
      )}
    </div>
  );
}

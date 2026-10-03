"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { slugify, type ContentError, type Img } from "@/lib/content";
import { deleteItem, loadRevision, saveProject } from "@/app/admin/actions";
import { ProjectCard } from "@/components/cards";
import { ConfirmButton, ImagePicker, Notice, StatusPill, move, useUnsavedGuard } from "./kit";

export type ProjectForm = {
  name: string; slug: string; summary: string; details: string; servicesText: string;
  kind: "client" | "concept"; clientConfirmed: boolean; cover: Img | null; gallery: Img[]; liveUrl: string;
};

export function ProjectEditor(props: { id: string | null; status: "draft" | "published"; form: ProjectForm; revisions: { id: string; label: string; createdAt: string }[] }) {
  const router = useRouter();
  const [id, setId] = useState(props.id);
  const [f, setF] = useState(props.form);
  const [status, setStatus] = useState(props.status);
  const [base, setBase] = useState(JSON.stringify(props.form));
  const [slugTouched, setSlugTouched] = useState(!!props.id);
  const [errors, setErrors] = useState<ContentError[]>([]);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(f) !== base;
  useUnsavedGuard(dirty);
  const set = (p: Partial<ProjectForm>) => setF((x) => ({ ...x, ...p }));
  const err = (p: string) => errors.filter((e) => e.path === p).map((e, i) => <p key={i} className="ad-err">{e.message}</p>);

  const run = (mode: "save" | "publish" | "unpublish") => start(async () => {
    setMsg(null);
    const r = await saveProject({ id, ...f, mode });
    if (!r.ok) { setErrors(r.errors ?? []); setMsg({ kind: "error", text: r.message ?? "Couldn’t save." }); return; }
    setErrors([]); setBase(JSON.stringify(f)); setStatus(r.status as "draft" | "published");
    setMsg({ kind: "ok", text: r.message ?? "Saved." });
    if (!id && r.id) { setId(r.id); router.replace(`/admin/portfolio/${r.id}`); }
  });

  const client = f.kind === "client" && f.clientConfirmed;
  return (
    <div className="ad-editor">
      <div className="ad-toolbar" role="region" aria-label="Project actions">
        <div className="ad-toolbar-info">{id && <StatusPill status={status} />}{dirty ? <span className="ad-dirty">Unsaved changes</span> : id ? <span className="ad-help">All changes saved</span> : null}</div>
        <div className="ad-actions">
          {id && <a className="ad-btn" href={`/preview/project/${id}`} target="_blank" rel="noopener noreferrer">Preview detail page<span className="sr-only"> (opens in a new tab; shows the last saved version)</span></a>}
          <button type="button" className="ad-btn" disabled={pending} onClick={() => run("save")}>{pending ? "Saving…" : status === "published" ? "Save changes" : "Save draft"}</button>
          {status === "published"
            ? <button type="button" className="ad-btn" disabled={pending} onClick={() => run("unpublish")}>Unpublish</button>
            : <button type="button" className="ad-btn ad-primary" disabled={pending} onClick={() => run("publish")}>Publish</button>}
        </div>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {errors.length > 0 && <Notice kind="error"><strong>Please fix:</strong><ul>{errors.map((e, i) => <li key={i}>{e.message}</li>)}</ul></Notice>}

      <div className="ad-split">
        <div>
          <section className="ad-card">
            <h2>Details</h2>
            <div className="ad-field"><label htmlFor="p-name">Project name <span className="ad-req">*</span></label>
              <input id="p-name" className="ad-input" value={f.name} maxLength={120} onChange={(e) => { set({ name: e.target.value }); if (!slugTouched) set({ slug: slugify(e.target.value) }); }} />{err("name")}</div>
            <div className="ad-field"><label htmlFor="p-slug">URL slug <span className="ad-req">*</span></label>
              <div className="ad-prefix"><span aria-hidden="true">/work/</span><input id="p-slug" className="ad-input" value={f.slug} maxLength={60} onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value.toLowerCase() }); }} /></div>{err("slug")}</div>
            <fieldset className="ad-field ad-kind">
              <legend>Type of project</legend>
              <label className="ad-radio"><input type="radio" name="kind" checked={f.kind === "concept"} onChange={() => set({ kind: "concept", clientConfirmed: false })} /> Concept project <small>Labeled “Concept” everywhere it appears.</small></label>
              <label className="ad-radio"><input type="radio" name="kind" checked={f.kind === "client"} onChange={() => set({ kind: "client" })} /> Client project <small>Only for real, completed client work.</small></label>
              {f.kind === "client" && (
                <label className="ad-check"><input type="checkbox" checked={f.clientConfirmed} onChange={(e) => set({ clientConfirmed: e.target.checked })} /> I confirm this is real client work and I have approval to show it.</label>
              )}
              {err("clientConfirmed")}
            </fieldset>
            <div className="ad-field"><label htmlFor="p-sum">Short summary {status === "published" || <span className="ad-help">(required to publish)</span>}</label>
              <textarea id="p-sum" className="ad-input" rows={2} maxLength={300} value={f.summary} onChange={(e) => set({ summary: e.target.value })} />{err("summary")}</div>
            <div className="ad-field"><label htmlFor="p-det">Project details (blank line = new paragraph)</label>
              <textarea id="p-det" className="ad-input" rows={6} maxLength={4000} value={f.details} onChange={(e) => set({ details: e.target.value })} /></div>
            <div className="ad-field"><label htmlFor="p-svc">Services provided (one per line)</label>
              <textarea id="p-svc" className="ad-input" rows={3} maxLength={1200} value={f.servicesText} onChange={(e) => set({ servicesText: e.target.value })} /></div>
            <div className="ad-field"><label htmlFor="p-url">Live site URL (optional)</label>
              <input id="p-url" className="ad-input" inputMode="url" placeholder="https://" value={f.liveUrl} maxLength={300} onChange={(e) => set({ liveUrl: e.target.value })} />{err("liveUrl")}</div>
          </section>
          <section className="ad-card">
            <h2>Images</h2>
            <ImagePicker label="Cover image (screenshot)" value={f.cover} onChange={(v) => set({ cover: v })} />
            {err("cover")}
            <fieldset className="ad-list"><legend>Gallery</legend>
              {f.gallery.map((g, i) => (
                <div key={g.id + i} className="ad-item">
                  <div className="ad-item-head"><strong>Image {i + 1}</strong>
                    <span className="ad-actions">
                      <button type="button" className="ad-btn" disabled={i === 0} aria-label={`Move gallery image ${i + 1} up`} onClick={() => set({ gallery: move(f.gallery, i, -1) })}>↑</button>
                      <button type="button" className="ad-btn" disabled={i === f.gallery.length - 1} aria-label={`Move gallery image ${i + 1} down`} onClick={() => set({ gallery: move(f.gallery, i, 1) })}>↓</button>
                      <ConfirmButton label="Remove" confirmText="Remove this image?" confirmLabel="Yes, remove" onConfirm={() => set({ gallery: f.gallery.filter((_, k) => k !== i) })} /></span></div>
                  <ImagePicker label="Gallery image" value={g} onChange={(v) => set({ gallery: v ? f.gallery.map((x, k) => (k === i ? v : x)) : f.gallery.filter((_, k) => k !== i) })} />
                </div>
              ))}
              {f.gallery.length < 12 && <GalleryAdd onAdd={(img) => set({ gallery: [...f.gallery, img] })} />}
              {err("gallery")}
            </fieldset>
          </section>
        </div>
        <aside aria-label="Preview">
          <section className="ad-card ad-sticky">
            <h2>Card preview</h2>
            <p className="ad-help">How this appears on the Work page and home page.</p>
            <ProjectCard p={{ name: f.name || "Project name", summary: f.summary, services: f.servicesText.split("\n").map((s) => s.trim()).filter(Boolean), kind: f.kind, clientConfirmed: client, cover: f.cover }} />
          </section>
        </aside>
      </div>

      {props.revisions.length > 0 && (
        <section className="ad-card"><h2>Saved versions</h2>
          <ul className="ad-revs">{props.revisions.map((r) => (
            <li key={r.id}><span>{r.label}<small>{new Date(r.createdAt).toLocaleString()}</small></span>
              <button type="button" className="ad-btn" disabled={pending} onClick={() => start(async () => {
                if (dirty && !confirm("Replace your unsaved edits with this version?")) return;
                const r2 = await loadRevision(r.id);
                if (r2.ok && r2.entity === "project") { setF({ ...(r2.data as ProjectForm) }); setMsg({ kind: "ok", text: "Version loaded. Review it, then save." }); }
              })}>Load into editor</button></li>))}</ul></section>
      )}
      {id && (
        <section className="ad-card ad-danger-zone"><h2>Delete</h2>
          <ConfirmButton label="Delete project" confirmText="Permanently delete this project?" onConfirm={async () => { const r = await deleteItem("project", id); if (r.ok) { setBase(JSON.stringify(f)); router.push("/admin/portfolio"); } }} /></section>
      )}
    </div>
  );
}

function GalleryAdd({ onAdd }: { onAdd: (i: Img) => void }) {
  const [v, setV] = useState<Img | null>(null);
  return <ImagePicker label="Add a gallery image" value={v} onChange={(i) => { if (i) { onAdd(i); setV(null); } }} requireAlt={false} help="After choosing, describe it in the alt text field above." />;
}

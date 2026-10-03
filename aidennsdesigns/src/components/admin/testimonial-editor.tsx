"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContentError, Img } from "@/lib/content";
import { deleteItem, saveTestimonial } from "@/app/admin/actions";
import { TestimonialCard } from "@/components/cards";
import { ConfirmButton, ImagePicker, Notice, StatusPill, useUnsavedGuard } from "./kit";

export type TForm = { quote: string; person: string; business: string; role: string; image: Img | null };

export function TestimonialEditor(props: { id: string | null; status: "draft" | "published"; form: TForm }) {
  const router = useRouter();
  const [id, setId] = useState(props.id);
  const [f, setF] = useState(props.form);
  const [status, setStatus] = useState(props.status);
  const [base, setBase] = useState(JSON.stringify(props.form));
  const [permission, setPermission] = useState(false);
  const [errors, setErrors] = useState<ContentError[]>([]);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(f) !== base;
  useUnsavedGuard(dirty);
  const set = (p: Partial<TForm>) => setF((x) => ({ ...x, ...p }));
  const err = (p: string) => errors.filter((e) => e.path === p).map((e, i) => <p key={i} className="ad-err">{e.message}</p>);

  const run = (mode: "save" | "publish" | "unpublish") => start(async () => {
    setMsg(null);
    const r = await saveTestimonial({ id, ...f, permission: permission || status === "published", mode });
    if (!r.ok) { setErrors(r.errors ?? []); setMsg({ kind: "error", text: r.message ?? "Couldn’t save." }); return; }
    setErrors([]); setBase(JSON.stringify(f)); setStatus(r.status as "draft" | "published"); setMsg({ kind: "ok", text: r.message ?? "Saved." });
    if (!id && r.id) { setId(r.id); router.replace(`/admin/testimonials/${r.id}`); }
  });

  return (
    <div className="ad-editor">
      <div className="ad-toolbar" role="region" aria-label="Testimonial actions">
        <div className="ad-toolbar-info">{id && <StatusPill status={status} />}{dirty ? <span className="ad-dirty">Unsaved changes</span> : id ? <span className="ad-help">All changes saved</span> : null}</div>
        <div className="ad-actions">
          <button type="button" className="ad-btn" disabled={pending} onClick={() => run("save")}>{pending ? "Saving…" : status === "published" ? "Save changes" : "Save draft"}</button>
          {status === "published"
            ? <button type="button" className="ad-btn" disabled={pending} onClick={() => run("unpublish")}>Unpublish</button>
            : <button type="button" className="ad-btn ad-primary" disabled={pending} onClick={() => run("publish")}>Publish</button>}
        </div>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {errors.length > 0 && <Notice kind="error"><strong>Please fix:</strong><ul>{errors.map((e, i) => <li key={i}>{e.message}</li>)}</ul></Notice>}
      <Notice kind="info">Publish only testimonials you have permission to use. Never invent or edit a review to say something the person didn’t say.</Notice>
      <div className="ad-split">
        <div>
          <section className="ad-card">
            <div className="ad-field"><label htmlFor="t-q">Testimonial text <span className="ad-req">*</span></label>
              <textarea id="t-q" className="ad-input" rows={5} maxLength={1200} value={f.quote} onChange={(e) => set({ quote: e.target.value })} />{err("quote")}</div>
            <div className="ad-field"><label htmlFor="t-p">Name or approved attribution <span className="ad-req">*</span></label>
              <input id="t-p" className="ad-input" maxLength={100} value={f.person} onChange={(e) => set({ person: e.target.value })} />{err("person")}</div>
            <div className="ad-row2">
              <div className="ad-field"><label htmlFor="t-b">Business name (if approved)</label><input id="t-b" className="ad-input" maxLength={120} value={f.business} onChange={(e) => set({ business: e.target.value })} /></div>
              <div className="ad-field"><label htmlFor="t-r">Role (optional)</label><input id="t-r" className="ad-input" maxLength={100} value={f.role} onChange={(e) => set({ role: e.target.value })} /></div>
            </div>
            <ImagePicker label="Photo or logo (optional, approved only)" value={f.image} onChange={(v) => set({ image: v })} />{err("image")}
            {status !== "published" && (
              <div className="ad-field"><label className="ad-check"><input type="checkbox" checked={permission} onChange={(e) => setPermission(e.target.checked)} /> I have permission to publish this testimonial.</label>{err("permission")}</div>
            )}
          </section>
        </div>
        <aside aria-label="Preview"><section className="ad-card ad-sticky"><h2>Preview</h2>
          <TestimonialCard t={{ quote: f.quote || "Testimonial text appears here.", person: f.person || "Name", business: f.business, role: f.role, image: f.image }} /></section></aside>
      </div>
      {id && <section className="ad-card ad-danger-zone"><h2>Delete</h2>
        <ConfirmButton label="Delete testimonial" confirmText="Permanently delete this testimonial?" onConfirm={async () => { const r = await deleteItem("testimonial", id); if (r.ok) { setBase(JSON.stringify(f)); router.push("/admin/testimonials"); } }} /></section>}
    </div>
  );
}

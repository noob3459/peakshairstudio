"use client";
import { useState, useTransition } from "react";
import type { ContentError, Link, SiteSettings } from "@/lib/content";
import { saveSettings } from "@/app/admin/actions";
import { ConfirmButton, ImagePicker, LinkInput, Notice, move, useUnsavedGuard } from "./kit";

function LinkList({ label, items, onChange, max }: { label: string; items: Link[]; onChange: (v: Link[]) => void; max: number }) {
  return (
    <fieldset className="ad-list">
      <legend>{label}</legend>
      {items.length === 0 && <p className="ad-help">None.</p>}
      {items.map((l, i) => (
        <div key={i} className="ad-item">
          <div className="ad-item-head"><strong>{i + 1}</strong>
            <span className="ad-actions">
              <button type="button" className="ad-btn" disabled={i === 0} aria-label={`Move link ${i + 1} up`} onClick={() => onChange(move(items, i, -1))}>↑</button>
              <button type="button" className="ad-btn" disabled={i === items.length - 1} aria-label={`Move link ${i + 1} down`} onClick={() => onChange(move(items, i, 1))}>↓</button>
              <ConfirmButton label="Remove" confirmText="Remove this link?" confirmLabel="Yes, remove" onConfirm={() => onChange(items.filter((_, k) => k !== i))} />
            </span></div>
          <LinkInput label={`Link ${i + 1}`} value={l} onChange={(v) => onChange(items.map((x, k) => (k === i ? v ?? { label: "", href: "" } : x)))} />
        </div>
      ))}
      {items.length < max && <button type="button" className="ad-btn" onClick={() => onChange([...items, { label: "", href: "" }])}>+ Add link</button>}
    </fieldset>
  );
}

export function SettingsEditor({ part, initial }: { part: "navigation" | "site"; initial: SiteSettings }) {
  const [s, setS] = useState(initial);
  const [base, setBase] = useState(JSON.stringify(initial));
  const [errors, setErrors] = useState<ContentError[]>([]);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(s) !== base;
  useUnsavedGuard(dirty);
  const set = (p: Partial<SiteSettings>) => setS((x) => ({ ...x, ...p }));
  const err = (p: string) => errors.filter((e) => e.path === p).map((e, i) => <p key={i} className="ad-err">{e.message}</p>);

  const save = () => start(async () => {
    setMsg(null);
    const patch: Partial<SiteSettings> = part === "navigation"
      ? { nav: s.nav, headerCta: s.headerCta, footerHeading: s.footerHeading, footerBlurb: s.footerBlurb, footerLinks: s.footerLinks }
      : { contactEmail: s.contactEmail, contactPhone: s.contactPhone, social: s.social, tutoringUrl: s.tutoringUrl, defaultDescription: s.defaultDescription, defaultShareImage: s.defaultShareImage };
    const r = await saveSettings(patch);
    if (!r.ok) { setErrors(r.errors ?? []); setMsg({ kind: "error", text: r.message ?? "Couldn’t save." }); return; }
    setErrors([]); setBase(JSON.stringify(s)); setMsg({ kind: "ok", text: r.message ?? "Saved." });
  });

  return (
    <div className="ad-editor">
      <div className="ad-toolbar"><div className="ad-toolbar-info">{dirty ? <span className="ad-dirty">Unsaved changes</span> : <span className="ad-help">All changes saved</span>}</div>
        <button type="button" className="ad-btn ad-primary" disabled={pending} onClick={save}>{pending ? "Saving…" : "Save changes"}</button></div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {errors.length > 0 && <Notice kind="error"><strong>Please fix:</strong><ul>{errors.map((e, i) => <li key={i}>{e.message}</li>)}</ul></Notice>}
      <p className="ad-help">Changes here go live as soon as you save.</p>
      {part === "navigation" ? (
        <>
          <section className="ad-card"><h2>Header</h2>
            <LinkInput label="Header button" value={s.headerCta} onChange={(v) => set({ headerCta: v ?? { label: "", href: "" } })} />{err("headerCta")}
            <LinkList label="Navigation links" items={s.nav} onChange={(nav) => set({ nav })} max={8} />{err("nav")}</section>
          <section className="ad-card"><h2>Footer</h2>
            <div className="ad-field"><label htmlFor="f-h">Footer heading</label><input id="f-h" className="ad-input" maxLength={80} value={s.footerHeading} onChange={(e) => set({ footerHeading: e.target.value })} /><p className="ad-help">Wrap a short phrase in *asterisks* for serif italic emphasis.</p></div>
            <div className="ad-field"><label htmlFor="f-b">Footer text</label><input id="f-b" className="ad-input" maxLength={300} value={s.footerBlurb} onChange={(e) => set({ footerBlurb: e.target.value })} /></div>
            <LinkList label="Footer links" items={s.footerLinks} onChange={(footerLinks) => set({ footerLinks })} max={12} />{err("footerLinks")}
            <p className="ad-help">Keep the “Aidenn’s Tutoring” footer link here if you want it shown in the footer. Its address is set under Site settings.</p></section>
        </>
      ) : (
        <>
          <section className="ad-card"><h2>Contact details</h2>
            <p className="ad-help">Leave empty until verified. Anything entered here appears in the footer.</p>
            <div className="ad-row2">
              <div className="ad-field"><label htmlFor="c-e">Contact email</label><input id="c-e" type="email" className="ad-input" maxLength={200} value={s.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />{err("contactEmail")}</div>
              <div className="ad-field"><label htmlFor="c-p">Contact phone</label><input id="c-p" type="tel" className="ad-input" maxLength={40} value={s.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />{err("contactPhone")}</div>
            </div>
            <LinkList label="Social links" items={s.social} onChange={(social) => set({ social })} max={6} /></section>
          <section className="ad-card"><h2>Aidenn’s Tutoring cross-link</h2>
            <div className="ad-field"><label htmlFor="t-u">Destination address</label><input id="t-u" className="ad-input" inputMode="url" maxLength={300} value={s.tutoringUrl} onChange={(e) => set({ tutoringUrl: e.target.value })} />
              <p className="ad-help">Used by the cross-link section and its button. Default: https://aidennstutoring.com. The heading and text are edited in the page section.</p>{err("tutoringUrl")}</div></section>
          <section className="ad-card"><h2>Default search & sharing</h2>
            <div className="ad-field"><label htmlFor="d-d">Default description</label><textarea id="d-d" className="ad-input" rows={2} maxLength={200} value={s.defaultDescription} onChange={(e) => set({ defaultDescription: e.target.value })} />
              <p className="ad-help">Used by pages that don’t set their own SEO description.</p></div>
            <ImagePicker label="Default social-share image" value={s.defaultShareImage} onChange={(v) => set({ defaultShareImage: v })} /></section>
        </>
      )}
    </div>
  );
}

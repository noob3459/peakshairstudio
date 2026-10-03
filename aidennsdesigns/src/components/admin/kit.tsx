"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { isExternal, normalizeHref, type Field, type Img, type Link } from "@/lib/content";
import type { MediaItem } from "@/lib/data";

/** Warns on tab close/reload and on clicks to other in-app links while there are unsaved changes. */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.origin !== location.origin || a.pathname === location.pathname) return;
      if (!confirm("You have unsaved changes. Leave this page and lose them?")) { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", onClick, true); };
  }, [dirty]);
}

export function StatusPill({ status, extra }: { status: string; extra?: string }) {
  return <span className={`pill pill-${status}`}>{status === "published" ? "Published" : "Draft"}{extra ? ` · ${extra}` : ""}</span>;
}

export function Notice({ kind, children }: { kind: "ok" | "error" | "info"; children: ReactNode }) {
  return <div className={`notice notice-${kind}`} role={kind === "error" ? "alert" : "status"}>{children}</div>;
}

/** Two-step inline confirmation for destructive actions. */
export function ConfirmButton({ label, confirmText, confirmLabel = "Yes, delete", onConfirm, disabled }: {
  label: string; confirmText: string; confirmLabel?: string; onConfirm: () => void | Promise<void>; disabled?: boolean;
}) {
  const [asking, setAsking] = useState(false);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (asking) first.current?.focus(); }, [asking]);
  if (!asking) return <button type="button" className="ad-btn ad-danger-ghost" disabled={disabled} onClick={() => setAsking(true)}>{label}</button>;
  return (
    <span className="confirm" role="alertdialog" aria-label={confirmText}>
      <span>{confirmText}</span>
      <button ref={first} type="button" className="ad-btn ad-danger" onClick={async () => { setAsking(false); await onConfirm(); }}>{confirmLabel}</button>
      <button type="button" className="ad-btn" onClick={() => setAsking(false)}>Cancel</button>
    </span>
  );
}

export function linkKind(href: string): { text: string; ok: boolean } {
  if (!href.trim()) return { text: "", ok: true };
  const n = normalizeHref(href);
  if (!n) return { text: "Not allowed. Use /page, #section, or a full https:// link.", ok: false };
  if (isExternal(n)) return { text: "External link (opens in a new tab)", ok: true };
  if (n.startsWith("mailto:") || n.startsWith("tel:")) return { text: "Opens the visitor’s email or phone app", ok: true };
  return { text: "Internal link", ok: true };
}

export function LinkInput({ label, value, onChange, help, error }: { label: string; value: Link | null; onChange: (v: Link | null) => void; help?: string; error?: string }) {
  const id = useId();
  const v = value ?? { label: "", href: "" };
  const kind = linkKind(v.href);
  const set = (patch: Partial<Link>) => { const n = { ...v, ...patch }; onChange(n.label || n.href ? n : null); };
  return (
    <fieldset className="ad-link">
      <legend>{label}</legend>
      <div className="ad-row2">
        <div><label htmlFor={`${id}l`}>Button/link text</label><input id={`${id}l`} className="ad-input" value={v.label} maxLength={80} onChange={(e) => set({ label: e.target.value })} /></div>
        <div><label htmlFor={`${id}h`}>Destination</label><input id={`${id}h`} className="ad-input" value={v.href} maxLength={500} placeholder="/contact or https://…" aria-invalid={!kind.ok || undefined} aria-describedby={`${id}k`} onChange={(e) => set({ href: e.target.value })} /></div>
      </div>
      <p id={`${id}k`} className={kind.ok ? "ad-help" : "ad-err"}>{kind.text || help || "Leave both empty to hide this."}</p>
      {error && <p className="ad-err">{error}</p>}
    </fieldset>
  );
}

// ---------- images ----------

export function ImagePicker({ label, value, onChange, help, requireAlt = true }: { label: string; value: Img | null; onChange: (v: Img | null) => void; help?: string; requireAlt?: boolean }) {
  const id = useId();
  const dlg = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    try {
      const r = await fetch("/api/admin/media", { cache: "no-store" });
      if (!r.ok) throw new Error();
      setItems((await r.json()).items);
    } catch { setError("Couldn’t load your images."); }
  }
  const open = () => { dlg.current?.showModal(); load(); };
  const pick = (m: MediaItem) => { onChange({ id: m.id, alt: value?.id === m.id ? value.alt : m.alt, w: m.width, h: m.height }); dlg.current?.close(); };

  async function upload(file: File | undefined, alt: string) {
    if (!file) return;
    setBusy(true); setError("");
    const fd = new FormData(); fd.set("file", file); fd.set("alt", alt);
    try {
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Upload failed.");
      pick(j.item);
    } catch (e: any) { setError(e.message || "Upload failed."); }
    setBusy(false);
  }

  return (
    <fieldset className="ad-img">
      <legend>{label}</legend>
      {value ? (
        <div className="ad-img-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/media/${value.id}`} alt="" className="ad-thumb" />
          <div className="ad-grow">
            <label htmlFor={`${id}a`}>Alt text — describe the image for people who can’t see it{requireAlt && " (required to publish)"}</label>
            <input id={`${id}a`} className="ad-input" value={value.alt} maxLength={250} onChange={(e) => onChange({ ...value, alt: e.target.value })} />
            <div className="ad-actions">
              <button type="button" className="ad-btn" onClick={open}>Replace</button>
              <button type="button" className="ad-btn ad-danger-ghost" onClick={() => onChange(null)}>Remove from here</button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" className="ad-btn" onClick={open}>Choose or upload image</button>
      )}
      {help && <p className="ad-help">{help}</p>}
      <dialog ref={dlg} className="ad-dialog" aria-labelledby={`${id}t`}>
        <div className="ad-dialog-head"><h2 id={`${id}t`}>Choose an image</h2><button type="button" className="ad-btn" onClick={() => dlg.current?.close()}>Close</button></div>
        <UploadBox busy={busy} onUpload={upload} />
        {error && <Notice kind="error">{error}</Notice>}
        {items === null ? <p className="ad-help">Loading…</p> : items.length === 0 ? <p className="ad-help">No images yet. Upload one above.</p> : (
          <ul className="ad-media-grid">
            {items.map((m) => (
              <li key={m.id}>
                <button type="button" className="ad-media-pick" onClick={() => pick(m)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/media/${m.id}`} alt="" loading="lazy" />
                  <span>{m.filename || "Image"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </dialog>
    </fieldset>
  );
}

export function UploadBox({ busy, onUpload }: { busy: boolean; onUpload: (f: File | undefined, alt: string) => void }) {
  const id = useId();
  const [alt, setAlt] = useState("");
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="ad-upload">
      <div><label htmlFor={`${id}f`}>Upload a JPEG, PNG or WebP (max 4 MB)</label>
        <input id={`${id}f`} ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="ad-input" disabled={busy} /></div>
      <div><label htmlFor={`${id}a`}>Alt text (describe the image)</label>
        <input id={`${id}a`} className="ad-input" value={alt} maxLength={250} onChange={(e) => setAlt(e.target.value)} /></div>
      <button type="button" className="ad-btn ad-primary" disabled={busy} onClick={() => { onUpload(input.current?.files?.[0], alt); setAlt(""); if (input.current) input.current.value = ""; }}>{busy ? "Uploading…" : "Upload"}</button>
    </div>
  );
}

// ---------- schema-driven field editor ----------

export function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const c = arr.slice(); [c[i], c[j]] = [c[j], c[i]]; return c;
}

export function FieldEditor({ field, value, onChange, errors }: { field: Field; value: any; onChange: (v: any) => void; errors?: string[] }) {
  const id = useId();
  const errs = errors?.length ? errors.map((m, i) => <p key={i} className="ad-err" id={`${id}e`}>{m}</p>) : null;
  switch (field.kind) {
    case "text":
      return (<div className="ad-field"><label htmlFor={id}>{field.label}{field.required && <span className="ad-req"> *</span>}</label>
        <input id={id} className="ad-input" value={value ?? ""} maxLength={field.max ?? 200} aria-invalid={errors?.length ? true : undefined} aria-describedby={errs ? `${id}e` : undefined} onChange={(e) => onChange(e.target.value)} />
        {field.help && <p className="ad-help">{field.help}</p>}{errs}</div>);
    case "textarea":
      return (<div className="ad-field"><label htmlFor={id}>{field.label}{field.required && <span className="ad-req"> *</span>}</label>
        <textarea id={id} className="ad-input" rows={field.rows ?? 4} value={value ?? ""} maxLength={field.max ?? 4000} aria-invalid={errors?.length ? true : undefined} aria-describedby={errs ? `${id}e` : undefined} onChange={(e) => onChange(e.target.value)} />
        {field.help && <p className="ad-help">{field.help}</p>}{errs}</div>);
    case "select":
      return (<div className="ad-field"><label htmlFor={id}>{field.label}</label>
        <select id={id} className="ad-input" value={value ?? field.options[0].value} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>);
    case "link":
      return <LinkInput label={field.label} value={value} onChange={onChange} help={field.help} error={errors?.[0]} />;
    case "image":
      return <ImagePicker label={field.label} value={value} onChange={onChange} help={field.help} />;
    case "list": {
      const items: any[] = value ?? [];
      const blank = () => Object.fromEntries(field.fields.map((f) => [f.key, f.kind === "list" ? [] : f.kind === "select" ? f.options[0].value : f.kind === "link" || f.kind === "image" ? null : ""]));
      return (
        <fieldset className="ad-list">
          <legend>{field.label}</legend>
          {items.length === 0 && <p className="ad-help">None yet.</p>}
          {items.map((it, i) => (
            <div key={i} className="ad-item">
              <div className="ad-item-head">
                <strong>{field.itemLabel} {i + 1}</strong>
                <span className="ad-actions">
                  <button type="button" className="ad-btn" disabled={i === 0} aria-label={`Move ${field.itemLabel} ${i + 1} up`} onClick={() => onChange(move(items, i, -1))}>↑</button>
                  <button type="button" className="ad-btn" disabled={i === items.length - 1} aria-label={`Move ${field.itemLabel} ${i + 1} down`} onClick={() => onChange(move(items, i, 1))}>↓</button>
                  <ConfirmButton label="Remove" confirmText={`Remove ${field.itemLabel.toLowerCase()} ${i + 1}?`} confirmLabel="Yes, remove" onConfirm={() => onChange(items.filter((_, k) => k !== i))} />
                </span>
              </div>
              {field.fields.map((f) => (
                <FieldEditor key={f.key} field={f} value={it[f.key]} onChange={(v) => onChange(items.map((x, k) => (k === i ? { ...x, [f.key]: v } : x)))} />
              ))}
            </div>
          ))}
          {items.length < field.max && <button type="button" className="ad-btn" onClick={() => onChange([...items, blank()])}>+ Add {field.itemLabel.toLowerCase()}</button>}
        </fieldset>
      );
    }
  }
}

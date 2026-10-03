"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MediaItem } from "@/lib/data";
import { deleteMedia, updateMediaAlt } from "@/app/admin/actions";
import { ConfirmButton, Notice, UploadBox } from "./kit";

export function MediaManager({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [alts, setAlts] = useState<Record<string, string>>(Object.fromEntries(items.map((m) => [m.id, m.alt])));
  const [, start] = useTransition();

  async function upload(file: File | undefined, alt: string) {
    if (!file) { setMsg({ kind: "error", text: "Choose an image file first." }); return; }
    setBusy(true); setMsg(null);
    const fd = new FormData(); fd.set("file", file); fd.set("alt", alt);
    try {
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Upload failed.");
      setMsg({ kind: "ok", text: "Uploaded." }); router.refresh();
    } catch (e: any) { setMsg({ kind: "error", text: e.message }); }
    setBusy(false);
  }

  return (
    <div className="ad-editor">
      <section className="ad-card"><h2>Upload</h2><UploadBox busy={busy} onUpload={upload} />
        <p className="ad-help">Images are resized to at most 2400 px wide and converted to WebP. Pages deliver smaller sizes automatically.</p></section>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {items.length === 0 ? <div className="ad-empty">No images yet.</div> : (
        <ul className="ad-media-list">
          {items.map((m) => (
            <li key={m.id} className="ad-card ad-media-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/media/${m.id}`} alt="" loading="lazy" />
              <div className="ad-grow">
                <p><strong>{m.filename || "Image"}</strong><br /><small>{m.width}×{m.height} · {Math.round(m.bytes / 1024)} KB</small></p>
                <label htmlFor={`a-${m.id}`}>Default alt text</label>
                <input id={`a-${m.id}`} className="ad-input" maxLength={250} value={alts[m.id] ?? ""} onChange={(e) => setAlts({ ...alts, [m.id]: e.target.value })} />
                <div className="ad-actions">
                  <button type="button" className="ad-btn" disabled={alts[m.id] === m.alt} onClick={() => start(async () => { const r = await updateMediaAlt(m.id, alts[m.id]); setMsg({ kind: r.ok ? "ok" : "error", text: r.message ?? "" }); router.refresh(); })}>Save alt text</button>
                  <ConfirmButton label="Delete" confirmText="Permanently delete this image?" onConfirm={async () => { const r = await deleteMedia(m.id); setMsg({ kind: r.ok ? "ok" : "error", text: r.message ?? "" }); router.refresh(); }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

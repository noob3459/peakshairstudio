"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteItem, deleteInquiry, deletePage, moveItem, setInquiryHandled } from "@/app/admin/actions";
import { ConfirmButton } from "./kit";

export function OrderActions({ entity, id, first, last, label }: { entity: "project" | "testimonial"; id: string; first: boolean; last: boolean; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const go = async (d: -1 | 1) => { setBusy(true); await moveItem(entity, id, d); setBusy(false); router.refresh(); };
  return (
    <span className="ad-actions">
      <button type="button" className="ad-btn" disabled={first || busy} aria-label={`Move ${label} up`} onClick={() => go(-1)}>↑</button>
      <button type="button" className="ad-btn" disabled={last || busy} aria-label={`Move ${label} down`} onClick={() => go(1)}>↓</button>
      <ConfirmButton label="Delete" confirmText={`Delete “${label}”?`} onConfirm={async () => { await deleteItem(entity, id); router.refresh(); }} />
    </span>
  );
}

export function PageDelete({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  return <ConfirmButton label="Delete" confirmText={`Delete “${title}”?`} onConfirm={async () => { await deletePage(id); router.refresh(); }} />;
}

export function InquiryActions({ id, handled }: { id: string; handled: boolean }) {
  const router = useRouter();
  return (
    <span className="ad-actions">
      <button type="button" className="ad-btn" onClick={async () => { await setInquiryHandled(id, !handled); router.refresh(); }}>{handled ? "Mark as new" : "Mark as handled"}</button>
      <ConfirmButton label="Delete" confirmText="Delete this inquiry?" onConfirm={async () => { await deleteInquiry(id); router.refresh(); }} />
    </span>
  );
}

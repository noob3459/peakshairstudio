"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SmartLink } from "./ui";
import type { Link } from "@/lib/content";

export function MobileNav({ nav }: { nav: Link[] }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); btn.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <button ref={btn} className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M5 5l12 12M17 5L5 17" /> : <path d="M3 6h16M3 11h16M3 16h16" />}
        </svg>
      </button>
      <nav id="mobile-menu" aria-label="Mobile" className="mobile-menu" hidden={!open}>
        <ul>{nav.map((l) => <li key={l.href + l.label}><SmartLink href={l.href}>{l.label}</SmartLink></li>)}</ul>
      </nav>
    </>
  );
}

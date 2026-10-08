"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SmartLink } from "./ui";
import type { Link } from "@/lib/content";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/brand";

export function MobileNav({ nav }: { nav: Link[] }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const btn = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
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
      <button ref={btn} className="menu-btn" aria-expanded={open} aria-controls={open ? "mobile-menu" : undefined} onClick={() => setOpen(!open)}>
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M5 5l12 12M17 5L5 17" /> : <path d="M3 6h16M3 11h16M3 16h16" />}
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && <motion.nav
          id="mobile-menu"
          aria-label="Mobile"
          className="mobile-menu"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.99 }}
          transition={{ duration: reduce ? 0.14 : 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <ul>{nav.map((l, index) => <motion.li key={l.href + l.label} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: reduce ? 0 : index * 0.035 }}><SmartLink href={l.href}>{l.label}</SmartLink></motion.li>)}</ul>
          <a className="mobile-instagram" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram <span>@{INSTAGRAM_HANDLE}</span><span aria-hidden="true">↗</span></a>
        </motion.nav>}
      </AnimatePresence>
    </>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { SmartLink } from "./ui";
import type { Link } from "@/lib/content";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/brand";

export function MobileNav({ nav }: { nav: Link[] }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const btn = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); btn.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useGSAP(() => {
    const element = menu.current;
    if (!open || !element || prefersReducedMotion()) return;
    gsap.fromTo(element, { autoAlpha: 0, y: -8, scale: 0.985 }, {
      autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: "power3.out",
      clearProps: "transform,opacity,visibility",
    });
    gsap.fromTo(element.querySelectorAll("li"), { autoAlpha: 0, x: -8 }, {
      autoAlpha: 1, x: 0, duration: 0.2, stagger: 0.035, delay: 0.025,
      ease: "power2.out", clearProps: "transform,opacity,visibility",
    });
  }, { scope: root, dependencies: [open], revertOnUpdate: true });
  return (
    <div ref={root} className="mobile-nav-root">
      <button ref={btn} className="menu-btn" aria-expanded={open} aria-controls={open ? "mobile-menu" : undefined} onClick={() => setOpen(!open)}>
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M5 5l12 12M17 5L5 17" /> : <path d="M3 6h16M3 11h16M3 16h16" />}
        </svg>
      </button>
      {open && <nav
          ref={menu}
          id="mobile-menu"
          aria-label="Mobile"
          className="mobile-menu"
        >
          <ul>{nav.map((l) => <li key={l.href + l.label}><SmartLink href={l.href}>{l.label}</SmartLink></li>)}</ul>
          <a className="mobile-instagram" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram <span>@{INSTAGRAM_HANDLE}</span><span aria-hidden="true">↗</span></a>
        </nav>}
    </div>
  );
}

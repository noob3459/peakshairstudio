"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { signOut } from "@/app/admin/actions";

const ITEMS = [
  ["/admin", "Dashboard"], ["/admin/pages", "Pages"], ["/admin/portfolio", "Portfolio"], ["/admin/testimonials", "Testimonials"],
  ["/admin/navigation", "Navigation & footer"], ["/admin/media", "Images & files"], ["/admin/settings", "Site settings"], ["/admin/inquiries", "Inquiries"],
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="ad-nav">
      <ul>
        {ITEMS.map(([href, label]) => {
          const current = href === "/admin" ? path === href : path.startsWith(href);
          return <li key={href}><Link href={href} aria-current={current ? "page" : undefined}>{label}</Link></li>;
        })}
      </ul>
      <form action={signOut}><button className="ad-btn ad-signout">Sign out</button></form>
    </nav>
  );
}

/** Open on desktop; collapsed behind "Menu" on phones so the page content is reachable. */
export function AdminMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  const path = usePathname();
  useEffect(() => {
    if (ref.current) ref.current.open = matchMedia("(min-width: 861px)").matches;
  }, [path]);
  return (
    <details ref={ref} className="ad-menu" open>
      <summary>Menu</summary>
      <AdminNav />
    </details>
  );
}

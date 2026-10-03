import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { isExternal, normalizeHref, type Img, type Link as L } from "@/lib/content";

/** Renders owner text safely. `*phrase*` becomes serif italic emphasis. Never uses innerHTML. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*([^*\n]+)\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <em key={i}>{p}</em> : p))}</>;
}

export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split(/\n{2,}/).filter(Boolean).map((p, i) => (
        <p key={i} className={className}>{p}</p>
      ))}
    </>
  );
}

export function SmartLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const safe = normalizeHref(href);
  if (!safe) return <span className={className}>{children}</span>;
  if (isExternal(safe) || safe.startsWith("mailto:") || safe.startsWith("tel:")) {
    const ext = isExternal(safe);
    return (
      <a href={safe} className={className} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
        {ext && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  }
  return <Link href={safe} className={className}>{children}</Link>;
}

export function Button({ link, variant = "primary", arrow }: { link: L | null | undefined; variant?: "primary" | "ghost" | "gold"; arrow?: boolean }) {
  if (!link?.href) return null;
  return <SmartLink href={link.href} className={`btn btn-${variant}`}>{link.label}{arrow && <span aria-hidden="true">→</span>}</SmartLink>;
}

export function Pic({ img, sizes, priority, className }: { img: Img; sizes: string; priority?: boolean; className?: string }) {
  return (
    <Image
      src={`/media/${img.id}`} alt={img.alt} width={img.w} height={img.h} sizes={sizes}
      priority={priority} className={className} style={{ width: "100%", height: "auto" }}
    />
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return children ? <p className="eyebrow">{children}</p> : null;
}

export function Head({ eyebrow, heading, intro, id, center }: { eyebrow?: string; heading?: string; intro?: string; id: string; center?: boolean }) {
  if (!eyebrow && !heading && !intro) return null;
  return (
    <header className={`sec-head${center ? " center" : ""}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      {heading && <h2 id={id}><Rich text={heading} /></h2>}
      {intro && <p className="lede">{intro}</p>}
    </header>
  );
}

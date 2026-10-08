import Link from "next/link";
import { Pic, SmartLink } from "./ui";
import { MotionCallToAction } from "./motion-primitives";

type ProjectLike = { slug?: string; name: string; summary: string; services: string[]; kind: "client" | "concept"; clientConfirmed: boolean; cover: { id: string; alt: string; w: number; h: number } | null; liveUrl?: string };
type TestimonialLike = { quote: string; person: string; business: string; role: string; image: { id: string; alt: string; w: number; h: number } | null };

export function ProjectCard({ p, href }: { p: ProjectLike; href?: string }) {
  const client = p.kind === "client" && p.clientConfirmed;
  if (["eddies-parts-marketing", "tourmaline-photo-booths"].includes(p.slug ?? "") && p.liveUrl) {
    return (
      <article className="card project project-link-card">
        <div className="card-body">
          <span className="mono-label">Client website</span>
          <h3><SmartLink href={p.liveUrl}>{p.name} <span aria-hidden="true">↗</span></SmartLink></h3>
          <MotionCallToAction />
        </div>
      </article>
    );
  }
  return (
    <article className="card project">
      <div className="shot">
        {p.cover ? <Pic img={p.cover} sizes="(min-width: 900px) 380px, 100vw" /> : <div className="shot-empty" aria-hidden="true" />}
        <span className={`badge ${client ? "badge-client" : "badge-concept"}`}>{client ? "Client project" : "Concept"}</span>
      </div>
      <div className="card-body">
        <h3>{href ? <Link href={href}>{p.name}</Link> : p.name}</h3>
        {p.summary && <p>{p.summary}</p>}
        {p.services.length > 0 && <ul className="chips">{p.services.map((s) => <li key={s}>{s}</li>)}</ul>}
        {p.liveUrl && <p className="project-live"><SmartLink href={p.liveUrl} className="textlink">Visit live website <span aria-hidden="true">↗</span></SmartLink></p>}
      </div>
    </article>
  );
}

export function TestimonialCard({ t }: { t: TestimonialLike }) {
  return (
    <figure className="card quote">
      <blockquote><p>{t.quote}</p></blockquote>
      <figcaption>
        {t.image && <Pic img={t.image} sizes="48px" className="avatar" />}
        <span><strong>{t.person}</strong>{(t.role || t.business) && <small>{[t.role, t.business].filter(Boolean).join(", ")}</small>}</span>
      </figcaption>
    </figure>
  );
}

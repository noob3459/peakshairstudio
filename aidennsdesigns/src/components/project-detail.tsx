import Link from "next/link";
import type { Project } from "@/lib/data";
import { Button, Paragraphs, Pic } from "./ui";

export function ProjectDetail({ p }: { p: Project }) {
  const client = p.kind === "client" && p.clientConfirmed;
  return (
    <>
      <section className="hero on-dark" aria-labelledby="project-h">
        <div className="wrap hero-copy">
          <p className="crumb"><Link href="/work">← All work</Link></p>
          <span className={`badge badge-inline ${client ? "badge-client" : "badge-concept"}`}>{client ? "Client project" : "Concept"}</span>
          <h1 id="project-h">{p.name}</h1>
          {p.summary && <p className="lede">{p.summary}</p>}
          {p.liveUrl && <div className="actions"><Button link={{ label: "Visit live site", href: p.liveUrl }} variant="primary" arrow /></div>}
        </div>
      </section>
      <section className="sec">
        <div className="wrap narrow">
          {p.cover && <figure className="figure"><Pic img={p.cover} sizes="(min-width: 900px) 900px, 100vw" priority /></figure>}
          {p.details && <div className="prose"><Paragraphs text={p.details} /></div>}
          {p.services.length > 0 && (
            <>
              <h2 className="h-small">Services provided</h2>
              <ul className="chips">{p.services.map((s) => <li key={s}>{s}</li>)}</ul>
            </>
          )}
          {p.gallery.map((g) => <figure key={g.id} className="figure"><Pic img={g} sizes="(min-width: 900px) 900px, 100vw" /></figure>)}
        </div>
      </section>
    </>
  );
}

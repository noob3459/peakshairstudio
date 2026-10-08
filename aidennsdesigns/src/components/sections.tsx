import type { CSSProperties } from "react";
import type { Section } from "@/lib/content";
import { getPublishedProjects, getPublishedTestimonials, getSettings } from "@/lib/data";
import { ProjectCard, TestimonialCard } from "./cards";
import Image from "next/image";
import { InquiryForm } from "./inquiry-form";
import { Button, Head, Paragraphs, Pic, Rich, SmartLink } from "./ui";
import { PrintOrderShop } from "./print-order-shop";
import { MotionHeroLayer, MotionItem, MotionReveal, MotionStagger, MotionStaggerItem, ServiceIcon, TimelineNumber } from "./motion-primitives";
import { AnimatedFAQItem } from "./motion-ui";

export function Sections({ sections }: { sections: Section[] }) {
  return <>{sections.map((s) => <MotionReveal key={s.id} className="motion-section"><One s={s} /></MotionReveal>)}</>;
}

async function One({ s }: { s: Section }) {
  const hid = `h-${s.id}`;
  const anchor = s.anchor || undefined;
  switch (s.type) {
    case "hero": {
      const home = s.variant === "home";
      return (
        <section id={anchor} className={`hero on-dark${home ? " hero-home" : ""}`} aria-labelledby={hid}>
          {home && (
            <div className="hero-bg" aria-hidden="true">
              <MotionHeroLayer>
                {s.image
                  ? <Image src={`/media/${s.image.id}`} alt="" fill priority sizes="100vw" />
                  : <Image src="/hero-mockups.webp" alt="" fill priority sizes="100vw" />}
              </MotionHeroLayer>
            </div>
          )}
          <MotionStagger className="wrap hero-copy">
            {s.eyebrow && <MotionStaggerItem><p className="badge-pill"><span aria-hidden="true" className="dot" />{s.eyebrow}</p></MotionStaggerItem>}
            <MotionStaggerItem><h1 id={hid}><Rich text={s.headline} /></h1></MotionStaggerItem>
            {s.body && <MotionStaggerItem><p className="lede">{s.body}</p></MotionStaggerItem>}
            {(s.primary || s.secondary) && (
              <MotionStaggerItem><div className="actions">
                  <Button link={s.primary} variant="primary" arrow />
                  {s.secondary && <SmartLink href={s.secondary.href} className="btn btn-outline">{s.secondary.label}</SmartLink>}
                </div></MotionStaggerItem>
            )}
            {home && <MotionStaggerItem><ul className="hero-offers" aria-label="Design services"><li>Websites</li><li>Branding</li><li>Business cards &amp; flyers</li></ul></MotionStaggerItem>}
          </MotionStagger>
        </section>
      );
    }
    case "services":
    case "features":
      return (
        <section id={anchor} className={`sec${s.type === "features" ? " sec-alt" : ""}`} aria-labelledby={hid}>
          <div className="wrap">
            <Head id={hid} eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} />
            <ul className={`grid ${s.items.length === 4 ? "g4" : "g3"}`}>
              {s.items.map((it: any, i: number) => (
                <MotionItem key={i} index={i} className="card pad">
                  <ServiceIcon index={i} />
                  <span className="num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{it.title}</h3>
                  <p>{it.body}</p>
                </MotionItem>
              ))}
            </ul>
          </div>
        </section>
      );
    case "process":
      return (
        <section id={anchor} className="sec sec-alt" aria-labelledby={hid}>
          <div className="wrap">
            <Head id={hid} eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} />
            <div className="steps-scroll">
              <ol className="steps" style={{
                "--step-count": s.steps.length,
                "--steps-width": `${Math.min(s.steps.length * 330, 1180)}px`,
                "--step-line": `${s.steps.length > 1 ? ((s.steps.length - 1) / s.steps.length) * 100 : 0}%`,
              } as CSSProperties}>
                {s.steps.map((it: any, i: number) => (
                  <MotionItem key={i} index={i} className="step-item" timeline>
                    <TimelineNumber number={i + 1} index={i} count={s.steps.length} />
                    <h3>{it.title}</h3>
                    <p>{it.body}</p>
                  </MotionItem>
                ))}
              </ol>
            </div>
            {s.link && <p className="more"><SmartLink href={s.link.href} className="textlink">{s.link.label} <span aria-hidden="true">→</span></SmartLink></p>}
          </div>
        </section>
      );
    case "projects": {
      const projects = await getPublishedProjects(s.limit === "all" ? undefined : Number(s.limit));
      return (
        <section id={anchor} className="sec" aria-labelledby={hid}>
          <div className="wrap">
            <Head id={hid} eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} />
            {projects.length ? (
              <ul className="grid g3">{projects.map((p, i) => <MotionItem key={p.id} index={i}><ProjectCard p={p} href={`/work/${p.slug}`} /></MotionItem>)}</ul>
            ) : (
              <div className="empty"><p>Portfolio projects will appear here as they are published.</p></div>
            )}
            {s.link && <p className="more"><SmartLink href={s.link.href} className="textlink">{s.link.label} <span aria-hidden="true">→</span></SmartLink></p>}
          </div>
        </section>
      );
    }
    case "pricing":
      if (s.anchor === "print-design") {
        return <PrintOrderShop id={anchor} headingId={hid} eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} footnote={s.footnote} />;
      }
      return (
        <section id={anchor} className="sec sec-alt" aria-labelledby={hid}>
          <div className="wrap">
            <Head id={hid} eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} />
            <ul className="grid g4 pricing">
              {s.tiers.map((t: any, i: number) => (
                <MotionItem key={i} index={i} className="card pad tier">
                  <h3>{t.name}</h3>
                  <p className="price"><strong>{t.price}</strong>{t.cadence && <span>{t.cadence}</span>}</p>
                  {t.description && <p>{t.description}</p>}
                  {t.features && (
                    <ul className="checks">
                      {t.features.split("\n").filter(Boolean).map((f: string, j: number) => <li key={j}>{f}</li>)}
                    </ul>
                  )}
                </MotionItem>
              ))}
            </ul>
            {s.notes.length > 0 && (
              <div className="notes">
                {s.notes.map((n: any, i: number) => (
                  <MotionReveal key={i} delay={i * 0.1}><div className="note"><h3>{n.title}</h3><Paragraphs text={n.body} /></div></MotionReveal>
                ))}
              </div>
            )}
            {s.footnote && <p className="footnote">{s.footnote}</p>}
            {s.link && <p className="more"><SmartLink href={s.link.href} className="textlink">{s.link.label} <span aria-hidden="true">→</span></SmartLink></p>}
          </div>
        </section>
      );
    case "faq":
      return (
        <section id={anchor} className="sec" aria-labelledby={hid}>
          <div className="wrap narrow">
            <Head id={hid} eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} />
            <div className="faq">
              {s.items.map((it: any, i: number) => <AnimatedFAQItem key={i} question={it.question} answer={it.answer} />)}
            </div>
            {s.link && <p className="more"><SmartLink href={s.link.href} className="textlink">{s.link.label} <span aria-hidden="true">→</span></SmartLink></p>}
          </div>
        </section>
      );
    case "testimonials": {
      const items = await getPublishedTestimonials(s.limit === "all" ? undefined : Number(s.limit));
      if (!items.length) return null;
      return (
        <section id={anchor} className="sec sec-alt" aria-labelledby={hid}>
          <div className="wrap">
            <Head id={hid} eyebrow={s.eyebrow} heading={s.heading} />
            <ul className="grid g3">{items.map((t, i) => <MotionItem key={t.id} index={i}><TestimonialCard t={t} /></MotionItem>)}</ul>
          </div>
        </section>
      );
    }
    case "text":
      return (
        <section id={anchor} className="sec" aria-labelledby={s.heading ? hid : undefined}>
          <div className="wrap narrow">
            <div className={s.tone === "panel" ? "panel" : undefined}>
              <Head id={hid} eyebrow={s.eyebrow} heading={s.heading} />
              <div className="prose"><Paragraphs text={s.body} /></div>
              {s.link && <p className="more"><Button link={s.link} /></p>}
            </div>
          </div>
        </section>
      );
    case "image":
      return s.image ? (
        <section id={anchor} className="sec">
          <div className="wrap narrow">
            <figure className="figure">
              <Pic img={s.image} sizes="(min-width: 900px) 900px, 100vw" />
              {s.caption && <figcaption>{s.caption}</figcaption>}
            </figure>
          </div>
        </section>
      ) : null;
    case "cta":
      return (
        <section id={anchor} className="sec" aria-labelledby={hid}>
          <div className="wrap">
            <div className="cta on-dark">
              <h2 id={hid}><Rich text={s.heading} /></h2>
              {s.body && <p className="lede">{s.body}</p>}
              <div className="actions">
                <Button link={s.primary} variant="primary" arrow />
                {s.secondary && <SmartLink href={s.secondary.href} className="textlink">{s.secondary.label} <span aria-hidden="true">→</span></SmartLink>}
              </div>
            </div>
          </div>
        </section>
      );
    case "tutoring": {
      const { tutoringUrl } = await getSettings();
      return (
        <section className="tutor" aria-labelledby={hid}>
          <div className="wrap">
            <div className="tutor-card">
              <div>
                <h2 id={hid}>{s.heading}</h2>
                <p>{s.body}</p>
              </div>
              <SmartLink href={tutoringUrl} className="btn btn-ghost">{s.buttonLabel}</SmartLink>
            </div>
          </div>
        </section>
      );
    }
    case "contactForm":
      return (
        <section id={anchor} className="sec" aria-labelledby={hid}>
          <div className="wrap narrow">
            <Head id={hid} eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} />
            <InquiryForm />
          </div>
        </section>
      );
    default:
      return null;
  }
}

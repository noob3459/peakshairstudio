import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { getSettings } from "@/lib/data";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/brand";
import { MobileNav } from "./mobile-nav";
import { Button, Rich, SmartLink } from "./ui";
import { MotionFooter, MotionHeader, MotionProgress, MotionReveal } from "./motion-primitives";

function BrandMark() {
  return <Image className="mark" src="/aidenns-designs-mark.svg" width={42} height={42} alt="" aria-hidden="true" />;
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.65" cy="6.55" r="1.1" fill="currentColor" />
    </svg>
  );
}

export async function SiteChrome({ children, banner }: { children: ReactNode; banner?: ReactNode }) {
  const s = await getSettings();
  const hasContact = Boolean(s.contactEmail || s.contactPhone || s.social.length);
  return (
    <>
      <MotionProgress />
      <a href="#main" className="skip">Skip to content</a>
      {banner}
      <MotionHeader>
        <div className="bar">
          <Link href="/" className="brand" aria-label="Aidenn's Designs home">
            <BrandMark />
            <span>Aidenn's Designs</span>
          </Link>
          <span className="pill-label">Website design studio</span>
          <nav aria-label="Main" className="nav-desktop">
            <ul>{s.nav.map((l) => <li key={l.href + l.label}><SmartLink href={l.href}>{l.label}</SmartLink></li>)}</ul>
          </nav>
          <div className="bar-end">
            <a className="instagram-header" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={`Instagram @${INSTAGRAM_HANDLE}`}>
              <InstagramGlyph />
              <span className="sr-only">Instagram</span>
            </a>
            <Button link={s.headerCta} variant="gold" arrow />
            <MobileNav nav={s.nav} />
          </div>
        </div>
      </MotionHeader>
      <main id="main">{children}</main>
      <MotionFooter>
        <div className="wrap">
          <MotionReveal className="foot-top">
            <div>
              {s.footerHeading && <p className="foot-h" role="presentation"><Rich text={s.footerHeading} /></p>}
              {s.footerBlurb && <p className="foot-blurb">{s.footerBlurb}</p>}
            </div>
            <Button link={s.headerCta} variant="primary" arrow />
          </MotionReveal>
          <div className="foot-cols">
            <MotionReveal>
              <Link href="/" className="brand footer-brand" aria-label="Aidenn's Designs home"><BrandMark /><span>Aidenn&apos;s Designs</span></Link>
            </MotionReveal>
            <MotionReveal delay={0.08}>
              <nav aria-label="Footer">
              <p className="mono-label">Pages</p>
              <ul className="foot-links">{s.footerLinks.map((l) => <li key={l.href + l.label}><SmartLink href={l.href}>{l.label}</SmartLink></li>)}</ul>
              </nav>
            </MotionReveal>
            <MotionReveal delay={0.16}>
              <div>
              <p className="mono-label">Contact</p>
              <ul className="foot-links">
                {s.contactEmail && <li><SmartLink href={`mailto:${s.contactEmail}`}>{s.contactEmail}</SmartLink></li>}
                {s.contactPhone && <li><SmartLink href={`tel:${s.contactPhone.replace(/[^+\d]/g, "")}`}>{s.contactPhone}</SmartLink></li>}
                {s.social.map((l) => <li key={l.href}><SmartLink href={l.href}>{l.label}</SmartLink></li>)}
                {!s.social.some((l) => /instagram\.com/i.test(l.href)) && <li><a className="instagram-footer" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><InstagramGlyph />Instagram <span>@{INSTAGRAM_HANDLE}</span></a></li>}
                {!hasContact && <li><SmartLink href={s.headerCta.href}>Use the request form</SmartLink></li>}
              </ul>
              </div>
            </MotionReveal>
          </div>
          <MotionReveal className="legal" delay={0.12}>© {new Date().getFullYear()} <strong className="site-wordmark">Aidenn's Designs</strong>. All rights reserved.</MotionReveal>
        </div>
      </MotionFooter>
    </>
  );
}

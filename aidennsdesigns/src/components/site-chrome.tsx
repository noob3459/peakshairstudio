import Link from "next/link";
import type { ReactNode } from "react";
import { getSettings } from "@/lib/data";
import { MobileNav } from "./mobile-nav";
import { Button, Rich, SmartLink } from "./ui";
import { MotionProgress } from "./motion-primitives";

function BrandMark() {
  return (
    <svg className="mark" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" fill="none">
      <circle cx="18" cy="18" r="17.5" fill="#1B3A6B" stroke="rgba(255,255,255,.2)" />
      <rect x="8" y="9" width="20" height="15" rx="2.5" stroke="#fff" strokeWidth="1.6" />
      <path d="M8 13.5h20M14 28h8m-4-4v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m21.2 15.5 4.6 4.6-6.8 2.2 2.2-6.8Z" fill="#C9A227" stroke="#0B1626" strokeWidth=".8" strokeLinejoin="round" />
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
      <header className="site-header">
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
            <Button link={s.headerCta} variant="gold" arrow />
            <MobileNav nav={s.nav} />
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer on-dark">
        <div className="wrap">
          <div className="foot-top">
            <div>
              {s.footerHeading && <p className="foot-h" role="presentation"><Rich text={s.footerHeading} /></p>}
              {s.footerBlurb && <p className="foot-blurb">{s.footerBlurb}</p>}
            </div>
            <Button link={s.headerCta} variant="primary" arrow />
          </div>
          <div className="foot-cols">
            <div>
              <p className="brand"><BrandMark /><span>Aidenn's Designs</span></p>
            </div>
            <nav aria-label="Footer">
              <p className="mono-label">Pages</p>
              <ul className="foot-links">{s.footerLinks.map((l) => <li key={l.href + l.label}><SmartLink href={l.href}>{l.label}</SmartLink></li>)}</ul>
            </nav>
            <div>
              <p className="mono-label">Contact</p>
              <ul className="foot-links">
                {s.contactEmail && <li><SmartLink href={`mailto:${s.contactEmail}`}>{s.contactEmail}</SmartLink></li>}
                {s.contactPhone && <li><SmartLink href={`tel:${s.contactPhone.replace(/[^+\d]/g, "")}`}>{s.contactPhone}</SmartLink></li>}
                {s.social.map((l) => <li key={l.href}><SmartLink href={l.href}>{l.label}</SmartLink></li>)}
                {!hasContact && <li><SmartLink href={s.headerCta.href}>Use the request form</SmartLink></li>}
              </ul>
            </div>
          </div>
          <div className="legal">© {new Date().getFullYear()} <strong className="site-wordmark">Aidenn's Designs</strong>. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}

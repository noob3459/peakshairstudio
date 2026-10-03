import Link from "next/link";
import type { ReactNode } from "react";
import { getSettings } from "@/lib/data";
import { MobileNav } from "./mobile-nav";
import { Button, Rich, SmartLink } from "./ui";

function BrandMark() {
  return (
    <svg className="mark" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" fill="none">
      <rect width="34" height="34" rx="10" fill="#1B3A6B" />
      <rect x="7.5" y="9.5" width="19" height="15" rx="3" stroke="#fff" strokeWidth="1.6" />
      <path d="M7.5 14.5h19" stroke="#fff" strokeWidth="1.6" />
      <circle cx="11.2" cy="12" r="1.1" fill="#C9A227" />
      <path d="M13 21.5l2.2-4 2.2 4M13.8 20.2h2.8" stroke="#C9A227" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" transform="translate(1.8 0)" />
    </svg>
  );
}

export async function SiteChrome({ children, banner }: { children: ReactNode; banner?: ReactNode }) {
  const s = await getSettings();
  const hasContact = Boolean(s.contactEmail || s.contactPhone || s.social.length);
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      {banner}
      <header className="site-header">
        <div className="bar">
          <Link href="/" className="brand" aria-label="AidennsDesigns home">
            <BrandMark />
            <span>Aidenns<b>Designs</b></span>
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
              <p className="brand"><BrandMark /><span>Aidenns<b>Designs</b></span></p>
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
          <div className="legal">© {new Date().getFullYear()} AidennsDesigns. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}

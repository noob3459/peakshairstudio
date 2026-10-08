# AidennsDesigns website

Next.js (App Router) site with an owner-only admin at `/admin`. Postgres stores content, images and inquiries.

## Routes
Public: `/`, `/work`, `/work/[project]`, `/services`, `/process`, `/about`, `/faq`, `/contact`, plus any page the owner creates at `/[slug]`.
Admin (owner only): `/admin` → Pages, Portfolio, Testimonials, Navigation & footer, Images & files, Site settings, Inquiries. Draft previews: `/preview/...` (owner only).

## Local development
```
npm install
cp .env.example .env.local     # then run: npm run owner:setup  and paste the output
npm run dev
```
With `DATABASE_URL` unset, dev uses an embedded throwaway Postgres in `.data/` (refused in production).

## Launch setup (owner steps)
1. **Database:** add a Postgres database (e.g. Neon via the Vercel Marketplace) and set `DATABASE_URL`. Tables and starter content are created automatically on first request.
2. **Owner login:** run `npm run owner:setup`, set the printed `OWNER_PASSWORD_HASH` and `SESSION_SECRET`, and set `OWNER_EMAIL`.
   - Recovery: re-run the script, replace `OWNER_PASSWORD_HASH`, redeploy. All existing sessions are signed out. There is no email-based reset.
3. `NEXT_PUBLIC_SITE_URL` → the real domain (canonical/share URLs).
4. Inquiry email: set `RESEND_API_KEY` and `INQUIRY_FROM` (a Resend-verified sender). Website and design inquiries are delivered to `aidennq29@gmail.com`; they are also saved in `/admin/inquiries`.

## Environment variables
`DATABASE_URL`, `OWNER_EMAIL`, `OWNER_PASSWORD_HASH`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `INQUIRY_FROM`. Never commit real values.

## Security notes
- Every admin page, server action and route handler calls `requireOwner()`; the proxy is only a convenience redirect.
- Session: signed JWT in an httpOnly, SameSite=Strict (`__Host-` in production) cookie, 8 h; login is rate-limited and constant-time.
- Owner text is rendered as React text only; links allow only `/path`, `#anchor`, `https://`, `http://`, `mailto:`, `tel:`.
- Uploads: JPEG/PNG/WebP, ≤4 MB, re-encoded to WebP via sharp (strips metadata; no SVG). Stored in Postgres, served from `/media/[id]` with immutable caching. Image URLs are unguessable UUIDs but not access-controlled, so don't upload anything secret.
- Inquiry form: honeypot, minimum-time check, per-IP rate limit, server validation.

## Needs owner decisions before launch
- Exact build scope: page count, features, delivery timeline, included revisions during the build.
- What the $500 website purchase transfers (files, hosting migration help?), and cancellation timing/grace period.
- Domain renewal arrangement; emergency work, new pages/features and redesign pricing.
- Verified contact email/phone/social (Site settings; footer shows them only when set).
- Approved portfolio projects and testimonials. The site ships with none: Work shows an empty state until you publish projects. Concept projects are always labeled “Concept”.
- Any personal details for the About page.

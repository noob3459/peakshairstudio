import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { listTestimonials } from "@/lib/data";
import { StatusPill } from "@/components/admin/kit";
import { OrderActions } from "@/components/admin/list-actions";

export default async function TestimonialList() {
  await requireOwner();
  const items = await listTestimonials();
  return (
    <>
      <div className="ad-head"><h1>Testimonials</h1><Link href="/admin/testimonials/new" className="ad-btn ad-primary">New testimonial</Link></div>
      <p className="ad-help">Publish only testimonials you have permission to use. Unpublished ones are never shown publicly.</p>
      {items.length === 0 ? <div className="ad-empty">No testimonials yet.</div> : (
        <ul className="ad-rows">
          {items.map((t, i) => (
            <li key={t.id} className="ad-card ad-row">
              <div className="ad-grow"><Link href={`/admin/testimonials/${t.id}`}><strong>{t.person}</strong></Link><br /><small>{t.quote.slice(0, 80)}{t.quote.length > 80 ? "…" : ""}</small></div>
              <StatusPill status={t.status} />
              <span className="ad-actions"><Link href={`/admin/testimonials/${t.id}`} className="ad-btn">Edit</Link>
                <OrderActions entity="testimonial" id={t.id} first={i === 0} last={i === items.length - 1} label={t.person} /></span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

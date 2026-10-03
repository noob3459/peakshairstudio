import { requireOwner } from "@/lib/auth";
import { listInquiries } from "@/lib/data";
import { InquiryActions } from "@/components/admin/list-actions";

const EMAIL: Record<string, string> = { not_configured: "Email notification not configured", sent: "Email notification sent" };

export default async function InquiriesPage() {
  await requireOwner();
  const items = await listInquiries();
  return (
    <>
      <h1>Inquiries</h1>
      <p className="ad-help">Every submission is saved here, whether or not email notification is set up.</p>
      {items.length === 0 ? <div className="ad-empty">No inquiries yet.</div> : (
        <ul className="ad-rows">
          {items.map((q) => (
            <li key={q.id} className={`ad-card ad-inq${q.handled ? " done" : ""}`}>
              <div className="ad-item-head"><strong>{q.name}{q.business ? ` — ${q.business}` : ""}</strong>
                <span className="ad-help">{new Date(q.createdAt).toLocaleString()} · {q.handled ? "Handled" : "New"}</span></div>
              <dl>
                <dt>Contact</dt><dd>{q.contact}</dd>
                {q.website && <><dt>Current site</dt><dd>{q.website}</dd></>}
                <dt>About the business</dt><dd>{q.about}</dd>
                <dt>Goals</dt><dd>{q.goals}</dd>
                {q.features && <><dt>Pages / features</dt><dd>{q.features}</dd></>}
              </dl>
              <p className="ad-help">{EMAIL[q.emailStatus] ?? `Email notification: ${q.emailStatus}`}</p>
              <InquiryActions id={q.id} handled={q.handled} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

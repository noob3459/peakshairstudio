import { requireOwner } from "@/lib/auth";
import { listInquiries } from "@/lib/data";
import { InquiryInbox } from "@/components/admin/inquiry-inbox";

export default async function InquiriesPage() {
  await requireOwner();
  const items = await listInquiries();
  return (
    <section className="ad-inbox-page">
      <header className="ad-inbox-intro">
        <div>
          <p className="ad-inbox-eyebrow">Client requests</p>
          <h1>Inquiries</h1>
          <p className="ad-help">A private inbox for every website and design request submitted on your site.</p>
        </div>
        <a className="ad-btn ad-inbox-email" href="mailto:aidennq29@gmail.com">Open business email ↗</a>
      </header>
      <InquiryInbox items={items} />
    </section>
  );
}

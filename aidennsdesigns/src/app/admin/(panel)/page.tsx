import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { dashboardCounts } from "@/lib/data";

export default async function Dashboard() {
  await requireOwner();
  const c = await dashboardCounts();
  const cards = [
    { href: "/admin/pages", title: "Pages", status: `${c.pagesPublished} published · ${c.pagesDraft} draft`, text: "Create and edit pages, sections, and SEO." },
    { href: "/admin/portfolio", title: "Portfolio", status: `${c.projectsPublished} published · ${c.projectsDraft} draft`, text: "Projects, concept or client work, and their order." },
    { href: "/admin/testimonials", title: "Testimonials", status: `${c.testimonialsPublished} published · ${c.testimonialsDraft} draft`, text: "Approved quotes only." },
    { href: "/admin/navigation", title: "Navigation & footer", status: "Live", text: "Menu, header button, and footer links." },
    { href: "/admin/media", title: "Images & files", status: `${c.media} uploaded`, text: "Screenshots, logos, alt text." },
    { href: "/admin/settings", title: "Site settings", status: "Live", text: "Contact details, tutoring link, default SEO." },
    { href: "/admin/inquiries", title: "Inquiries", status: c.inquiriesNew ? `${c.inquiriesNew} new` : "None new", text: "Requests from the website form." },
  ];
  return (
    <>
      <h1>Dashboard</h1>
      <ul className="ad-dash">
        {cards.map((x) => (
          <li key={x.href} className="ad-card"><h2><Link href={x.href}>{x.title}</Link></h2><p className="ad-status">{x.status}</p><p className="ad-help">{x.text}</p></li>
        ))}
      </ul>
    </>
  );
}

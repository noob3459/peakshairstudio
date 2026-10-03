import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { listPages } from "@/lib/data";
import { StatusPill } from "@/components/admin/kit";
import { PageDelete } from "@/components/admin/list-actions";

export default async function PagesList() {
  await requireOwner();
  const pages = await listPages();
  return (
    <>
      <div className="ad-head"><h1>Pages</h1><Link href="/admin/pages/new" className="ad-btn ad-primary">New page</Link></div>
      <ul className="ad-rows">
        {pages.map((p) => {
          const changed = p.status === "published" && JSON.stringify(p.draft) !== JSON.stringify(p.published);
          return (
            <li key={p.id} className="ad-card ad-row">
              <div className="ad-grow"><Link href={`/admin/pages/${p.id}`}><strong>{p.draft.title}</strong></Link><br /><small>{p.slug === "home" ? "/" : `/${p.slug}`}</small></div>
              <StatusPill status={p.status} extra={changed ? "unpublished changes" : undefined} />
              <span className="ad-actions">
                <Link href={`/admin/pages/${p.id}`} className="ad-btn">Edit</Link>
                <a href={`/preview/page/${p.id}`} target="_blank" rel="noopener noreferrer" className="ad-btn">Preview<span className="sr-only"> {p.draft.title} (opens in a new tab)</span></a>
                {p.slug !== "home" && <PageDelete id={p.id} title={p.draft.title} />}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

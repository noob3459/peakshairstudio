import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { listProjects } from "@/lib/data";
import { StatusPill } from "@/components/admin/kit";
import { OrderActions } from "@/components/admin/list-actions";

export default async function PortfolioList() {
  await requireOwner();
  const items = await listProjects();
  return (
    <>
      <div className="ad-head"><h1>Portfolio</h1><Link href="/admin/portfolio/new" className="ad-btn ad-primary">New project</Link></div>
      <p className="ad-help">Projects appear on the public site in this order. Only published projects are public.</p>
      {items.length === 0 ? <div className="ad-empty">No projects yet. Add your first project.</div> : (
        <ul className="ad-rows">
          {items.map((p, i) => (
            <li key={p.id} className="ad-card ad-row">
              <div className="ad-grow"><Link href={`/admin/portfolio/${p.id}`}><strong>{p.name}</strong></Link><br />
                <small>{p.kind === "client" && p.clientConfirmed ? "Client project" : "Concept project"}</small></div>
              <StatusPill status={p.status} />
              <span className="ad-actions"><Link href={`/admin/portfolio/${p.id}`} className="ad-btn">Edit</Link>
                <OrderActions entity="project" id={p.id} first={i === 0} last={i === items.length - 1} label={p.name} /></span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

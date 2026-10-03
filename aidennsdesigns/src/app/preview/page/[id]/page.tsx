import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { isUuid } from "@/lib/content";
import { getPage } from "@/lib/data";
import { SiteChrome } from "@/components/site-chrome";
import { Sections } from "@/components/sections";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireOwner();
  const { id } = await params;
  const p = isUuid(id) ? await getPage(id) : null;
  if (!p) notFound();
  return (
    <SiteChrome banner={<div className="preview-banner" role="status">Draft preview — only you can see this. Status: {p.status === "published" ? "published (live version may differ)" : "not published"}. <a href={`/admin/pages/${p.id}`}>Back to editor</a></div>}>
      <Sections sections={p.draft.sections} />
    </SiteChrome>
  );
}

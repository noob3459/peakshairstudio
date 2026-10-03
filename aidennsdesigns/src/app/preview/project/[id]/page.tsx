import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { isUuid } from "@/lib/content";
import { getProject } from "@/lib/data";
import { SiteChrome } from "@/components/site-chrome";
import { ProjectDetail } from "@/components/project-detail";

export default async function PreviewProject({ params }: { params: Promise<{ id: string }> }) {
  await requireOwner();
  const { id } = await params;
  const p = isUuid(id) ? await getProject(id) : null;
  if (!p) notFound();
  return (
    <SiteChrome banner={<div className="preview-banner" role="status">Preview — only you can see this. Status: {p.status}. <a href={`/admin/portfolio/${p.id}`}>Back to editor</a></div>}>
      <ProjectDetail p={p} />
    </SiteChrome>
  );
}

import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { isUuid } from "@/lib/content";
import { getProject, listRevisions } from "@/lib/data";
import { ProjectEditor } from "@/components/admin/project-editor";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requireOwner();
  const { id } = await params;
  const p = isUuid(id) ? await getProject(id) : null;
  if (!p) notFound();
  return (<><h1>Edit project</h1>
    <ProjectEditor key={p.id} id={p.id} status={p.status} revisions={await listRevisions("project", p.id)}
      form={{ name: p.name, slug: p.slug, summary: p.summary, details: p.details, servicesText: p.services.join("\n"), kind: p.kind, clientConfirmed: p.clientConfirmed, cover: p.cover, gallery: p.gallery, liveUrl: p.liveUrl }} /></>);
}

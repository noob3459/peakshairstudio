import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { isUuid } from "@/lib/content";
import { getPage, listRevisions } from "@/lib/data";
import { PageEditor } from "@/components/admin/page-editor";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireOwner();
  const { id } = await params;
  const p = isUuid(id) ? await getPage(id) : null;
  if (!p) notFound();
  const revisions = await listRevisions("page", p.id);
  return (
    <>
      <h1>Edit page</h1>
      <PageEditor key={p.id} id={p.id} slug={p.slug} status={p.status} isHome={p.slug === "home"} content={p.draft}
        hasUnpublished={p.status === "published" && JSON.stringify(p.draft) !== JSON.stringify(p.published)} revisions={revisions} />
    </>
  );
}

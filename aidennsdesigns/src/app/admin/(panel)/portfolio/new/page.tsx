import { requireOwner } from "@/lib/auth";
import { ProjectEditor } from "@/components/admin/project-editor";

export default async function NewProject() {
  await requireOwner();
  return (<><h1>New project</h1>
    <ProjectEditor id={null} status="draft" revisions={[]} form={{ name: "", slug: "", summary: "", details: "", servicesText: "", kind: "concept", clientConfirmed: false, cover: null, gallery: [], liveUrl: "" }} /></>);
}

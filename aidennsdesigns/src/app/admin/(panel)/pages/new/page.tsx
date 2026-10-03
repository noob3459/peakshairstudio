import { requireOwner } from "@/lib/auth";
import { newSection, type PageContent } from "@/lib/content";
import { PageEditor } from "@/components/admin/page-editor";

export default async function NewPage() {
  await requireOwner();
  const hero = { ...newSection("hero"), variant: "page" };
  const content: PageContent = { title: "", seoTitle: "", seoDescription: "", shareImage: null, sections: [hero, newSection("text")] };
  return (<><h1>New page</h1><PageEditor id={null} slug="" status="draft" isHome={false} content={content} hasUnpublished={false} revisions={[]} /></>);
}

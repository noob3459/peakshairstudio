import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { isUuid } from "@/lib/content";
import { getTestimonial } from "@/lib/data";
import { TestimonialEditor } from "@/components/admin/testimonial-editor";

export default async function EditTestimonial({ params }: { params: Promise<{ id: string }> }) {
  await requireOwner();
  const { id } = await params;
  const t = isUuid(id) ? await getTestimonial(id) : null;
  if (!t) notFound();
  return (<><h1>Edit testimonial</h1><TestimonialEditor key={t.id} id={t.id} status={t.status} form={{ quote: t.quote, person: t.person, business: t.business, role: t.role, image: t.image }} /></>);
}

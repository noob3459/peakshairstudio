import { requireOwner } from "@/lib/auth";
import { TestimonialEditor } from "@/components/admin/testimonial-editor";

export default async function NewTestimonial() {
  await requireOwner();
  return (<><h1>New testimonial</h1><TestimonialEditor id={null} status="draft" form={{ quote: "", person: "", business: "", role: "", image: null }} /></>);
}

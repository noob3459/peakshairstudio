import { notFound, redirect } from "next/navigation";
import { Sections } from "@/components/sections";
import { getPublishedPage, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = await getPublishedPage(slug);
  return p ? pageMetadata(p.content, `/${slug}`, await getSettings()) : {};
}

export default async function CustomPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "home") redirect("/");
  const p = await getPublishedPage(slug);
  if (!p) notFound();
  return <Sections sections={p.content.sections} />;
}

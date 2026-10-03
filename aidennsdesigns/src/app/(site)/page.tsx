import { notFound } from "next/navigation";
import { Sections } from "@/components/sections";
import { getPublishedPage, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const p = await getPublishedPage("home");
  return p ? pageMetadata(p.content, "/", await getSettings()) : {};
}

export default async function Home() {
  const p = await getPublishedPage("home");
  if (!p) notFound();
  return <Sections sections={p.content.sections} />;
}

import { notFound } from "next/navigation";
import { Sections } from "@/components/sections";
import { getPublishedPage, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { HomepageFilm } from "@/components/homepage-film";

export async function generateMetadata() {
  const p = await getPublishedPage("home");
  return p ? pageMetadata(p.content, "/", await getSettings()) : {};
}

export default async function Home() {
  const p = await getPublishedPage("home");
  if (!p) notFound();
  const heroIndex = p.content.sections.findIndex((section) => section.type === "hero" && section.variant === "home");
  if (heroIndex < 0) return <><Sections sections={p.content.sections} /><HomepageFilm /></>;
  return <>
    <Sections sections={p.content.sections.slice(0, heroIndex + 1)} />
    <HomepageFilm />
    <Sections sections={p.content.sections.slice(heroIndex + 1)} />
  </>;
}

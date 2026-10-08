import { notFound } from "next/navigation";
import { Sections } from "@/components/sections";
import { getPublishedPage, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { HomepageFilm } from "@/components/homepage-film";
import { HomepageExperience } from "@/components/homepage-experience";

export async function generateMetadata() {
  const p = await getPublishedPage("home");
  return p ? pageMetadata(p.content, "/", await getSettings()) : {};
}

export default async function Home() {
  const p = await getPublishedPage("home");
  if (!p) notFound();
  const sections = p.content.sections;
  const heroIndex = sections.findIndex((section) => section.type === "hero" && section.variant === "home");
  const projectIndex = sections.findIndex((section) => section.type === "projects");
  if (heroIndex < 0) {
    return <><Sections sections={sections.filter((section) => section.type !== "projects")} /><HomepageFilm /><HomepageExperience /></>;
  }
  const afterHero = sections.slice(heroIndex + 1);
  const projectIndexAfterHero = afterHero.findIndex((section) => section.type === "projects");
  return <>
    <Sections sections={sections.slice(0, heroIndex + 1)} />
    <HomepageFilm />
    {projectIndexAfterHero >= 0 ? <>
      <Sections sections={afterHero.slice(0, projectIndexAfterHero)} />
      <HomepageExperience />
      <Sections sections={afterHero.slice(projectIndexAfterHero + 1)} />
    </> : <Sections sections={afterHero.filter((section) => section.type !== "projects")} />}
  </>;
}

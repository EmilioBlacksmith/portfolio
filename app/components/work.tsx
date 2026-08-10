import { getTranslations } from "next-intl/server";
import { SectionHeading } from "./section-heading";
import { WorkCard } from "./work-card";
import { ART_WORK } from "@/data/ascii-art";
import type { Project } from "@/data/types";

export async function Work({ projects }: { projects: Project[] }) {
  const sectionsT = await getTranslations("sections");
  const projectsT = await getTranslations("projects");

  return (
    <section id="work" className="mx-auto max-w-[1600px] scroll-mt-16 px-5 py-28 sm:px-8">
      <SectionHeading index="01" label={sectionsT("work")} art={ART_WORK} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <WorkCard
            key={project.id}
            project={project}
            index={i}
            latestLabel={projectsT("latest")}
            viewLabel={projectsT("view")}
          />
        ))}
      </div>
    </section>
  );
}

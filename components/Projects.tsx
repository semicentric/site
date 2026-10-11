"use client";

import ProjectCard, { type HoverStyle, type Project } from "./ProjectCard";
import { AFTER_S } from "./shared";

const PROJECTS: Project[] = [
  { name: "neptune", href: "https://neptune.rip", image: "/projects/neptune.png" },
  { name: "palisade", href: "https://palisade.rocks", image: "/projects/palisade.png" },
  { name: "evanescent" },
  { name: "sram", note: "self-reorganizing autonomous machines" },
];

export default function Projects({ hover = "lens" }: { hover?: HoverStyle }) {
  return (
    <section
      aria-label="projects"
      className="grid w-full grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-4 md:grid-cols-4 lg:max-w-[calc((100dvh-16rem)*3.2+3rem)]"
    >
      {PROJECTS.map((project, i) => (
        <ProjectCard key={project.name} project={project} hover={hover} delay={AFTER_S + 0.05 + i * 0.12 + (project.image ? 0 : 0.45)} />
      ))}
    </section>
  );
}

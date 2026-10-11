"use client";

import ProjectCard, { type Project } from "./ProjectCard";
import { AFTER_S } from "./shared";

const PROJECTS: Project[] = [
  { name: "Neptune", href: "https://neptune.rip", image: "/projects/neptune.png" },
  { name: "Palisade", href: "https://palisade.rocks", image: "/projects/palisade.png" },
  { name: "Evanescent" },
  { name: "SRAM", note: "Self-Reorganizing Autonomous Machines" },
];

export default function Projects() {
  return (
    <section
      aria-label="projects"
      className="grid w-full grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-4 md:grid-cols-4 lg:max-w-[calc((100dvh-16rem)*3.2+3rem)]"
    >
      {PROJECTS.map((project, i) => (
        <ProjectCard
          key={project.name}
          project={project}
          delay={AFTER_S + 0.05 + i * 0.12 + (project.image ? 0 : 0.45)}
        />
      ))}
    </section>
  );
}

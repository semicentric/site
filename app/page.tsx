import Corner from "@/components/Corner";
import type { HoverStyle } from "@/components/ProjectCard";

const STYLES: HoverStyle[] = ["lens", "scan", "lift"];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ hover?: string }>;
}) {
  const { hover } = await searchParams;
  return (
    <main>
      <Corner hover={STYLES.find((s) => s === hover)} />
    </main>
  );
}

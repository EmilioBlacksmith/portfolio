import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/data/types";

export function WorkCard({
  project,
  index,
  latestLabel,
  viewLabel,
}: {
  project: Project;
  index: number;
  latestLabel: string;
  viewLabel: string;
}) {
  const cover = project.projectImgs?.[0];
  const tag = project.isFeatured
    ? latestLabel
    : `item_${String(index + 1).padStart(2, "0")}`;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col overflow-hidden bg-panel transition-[background-color,transform] duration-300 hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:outline-offset-4 active:scale-[0.99]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink">
        {cover ? (
          <Image
            src={cover}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover opacity-80 transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-panel via-ink to-black">
            <span className="font-display text-8xl font-bold text-steel/15">
              D
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/70 to-transparent" />
        <span className="absolute right-3 top-3 font-mono text-[10px] tracking-wider text-ash">
          {project.year}
        </span>
        <span className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-wider text-faint">
          {tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-tight text-bone">
          {project.title}
        </h3>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ash">
          {project.role}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ash">
          {project.description}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {(project.isFeatured
            ? project.techStack
            : project.techStack.slice(0, 4)
          ).map((tech) => (
            <span
              key={tech}
              className="border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ash"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-wider text-faint">
            {viewLabel}
          </span>
          <span
            aria-hidden="true"
            className="font-mono text-xs text-steel opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            &gt;
          </span>
        </div>
      </div>
    </Link>
  );
}

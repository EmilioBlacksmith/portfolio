import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/navigation";
import { Logo } from "@/app/components/logo";
import projectsEn from "@/data/en/projects.json";
import projectsEs from "@/data/es/projects.json";
import type { Project } from "@/data/types";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    projectsEn.map((project) => ({ locale, id: project.id }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[id]">) {
  const { locale, id } = await params;
  const project = (locale === "es" ? projectsEs : projectsEn).find(
    (p) => p.id === id
  );
  const t = await getTranslations({ locale, namespace: "projects" });

  return {
    title: project ? `${project.title} ${t("titleSuffix")}` : t("titleSuffix"),
    description: project?.description,
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/[locale]/projects/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const projects: Project[] = locale === "es" ? projectsEs : projectsEn;
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  const t = await getTranslations("projects");
  const images = project.projectImgs ?? [];

  return (
    <main className="min-h-svh">
      <div className="flex h-16 items-center justify-between px-5 sm:px-8">
        <Logo />
        <Link
          href="/#work"
          className="font-mono text-[11px] tracking-[0.15em] text-ash uppercase transition-colors hover:text-bone"
        >
          {t("back")}
        </Link>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
        <header className="pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            {project.isFeatured ? t("latestProject") : t("project")} /{" "}
            <span className="text-steel">{project.year}</span> / {project.role}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-bone sm:text-6xl">
            {project.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ash">
            {project.description}
          </p>
        </header>

        {images.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((src, i) => (
              <div
                key={src}
                className={`relative aspect-[16/10] overflow-hidden bg-panel ${
                  i === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <Image
                  src={src}
                  alt={`${project.title} preview ${i + 1}`}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center bg-panel">
            <span className="font-display text-8xl font-bold text-steel/15">
              D
            </span>
          </div>
        )}

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-10">
            {project.overview && (
              <section>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
                  {t("overview")}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-ash">
                  {project.overview}
                </p>
              </section>
            )}

            {project.highlights && (
              <section>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
                  {t("highlights")}
                </h2>
                <ul className="mt-4 space-y-3">
                  {project.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3 text-base leading-relaxed text-ash">
                      <span aria-hidden="true" className="mt-[3px] font-mono text-sm text-steel">
                        &gt;
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {project.features && (
              <section>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
                  {t("features")}
                </h2>
                <div className="mt-4 space-y-6">
                  {project.features.map((feature) => (
                    <div key={feature.title}>
                      <h3 className="font-display text-base font-bold text-bone">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ash">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {project.challenges && (
              <section className="border border-white/10 bg-panel/50 p-6">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
                  {t("challenges")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ash">
                  {project.challenges}
                </p>
              </section>
            )}
          </div>

          <aside>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              {t("techStack")}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="border border-white/10 bg-panel/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ash"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-8 border border-white/10 bg-panel/50 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
                {t("moreFromTheForge")}
              </p>
              <ul className="mt-3 space-y-2">
                {projects
                  .filter((p) => p.id !== project.id)
                  .slice(0, 4)
                  .map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/projects/${p.id}`}
                        className="group flex items-baseline justify-between gap-3 text-sm text-ash transition-colors hover:text-bone"
                      >
                        <span>{p.title}</span>
                        <span className="font-mono text-[10px] text-faint transition-colors group-hover:text-steel">
                          {p.year} &gt;
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

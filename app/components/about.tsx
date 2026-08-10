import { Fragment } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "./section-heading";
import type { Profile } from "@/data/types";

const COMPANY_LINKS: Record<string, string> = {
  Finsphera: "https://www.finsphera.ai/",
};

function Linkify({ text }: { text: string }) {
  const pattern = new RegExp(`(${Object.keys(COMPANY_LINKS).join("|")})`, "g");

  return (
    <>
      {text.split(pattern).map((part, i) =>
        COMPANY_LINKS[part] ? (
          <a
            key={i}
            href={COMPANY_LINKS[part]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-bone underline decoration-steel/30 underline-offset-4 transition-colors hover:text-steel hover:decoration-steel"
          >
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

export async function About({ profile }: { profile: Profile }) {
  const t = await getTranslations("about");
  const sectionsT = await getTranslations("sections");

  return (
    <section id="about" className="mx-auto max-w-[1600px] scroll-mt-16 px-5 py-28 sm:px-8">
      <SectionHeading index="02" label={sectionsT("about")} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6 text-base leading-relaxed text-ash">
          {profile.bio.map((paragraph) => (
            <p key={paragraph}>
              <Linkify text={paragraph} />
            </p>
          ))}

          <div className="pt-2">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              {t("experience")}
            </p>
            <div className="space-y-6">
              {profile.experience.map((job) => (
                <div key={job.company} className="border-l border-white/10 pl-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-base font-bold text-bone">
                      {job.role}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-faint">
                      {job.period}
                    </p>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-steel">
                    <Linkify text={job.company} /> · {job.location}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {job.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span aria-hidden="true" className="text-steel">
                          &gt;
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center pt-2">
            <div className="relative aspect-square w-56 overflow-hidden rounded-full border-4 border-panel shadow-[0_0_0_1px_rgba(255,255,255,0.12)] sm:w-64">
              <Image
                src={profile.image}
                alt={profile.name}
                fill
                sizes="(max-width: 1024px) 16rem, 16rem"
                className="object-cover grayscale transition-all duration-500 hover:scale-105 hover:grayscale-0"
              />
            </div>
            <p className="mt-5 font-display text-xl font-bold text-bone">
              {profile.alias}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ash">
              {profile.location}
            </p>
          </div>

          <div className="border border-white/10 bg-panel/50 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              {t("education")}
            </p>
            <p className="mt-2 text-sm font-semibold text-bone">
              {profile.education.degree}
            </p>
            <p className="mt-1 text-sm text-ash">
              {profile.education.school} · {profile.education.period}
            </p>
            <p className="mt-1 font-mono text-[10px] text-steel">
              {profile.education.gpa}
            </p>
          </div>

          <div className="border border-white/10 bg-panel/50 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              {t("languages")}
            </p>
            <ul className="mt-3 space-y-2">
              {Object.entries(profile.languages).map(([language, level]) => (
                <li key={language} className="flex justify-between text-sm">
                  <span className="text-bone">{language}</span>
                  <span className="text-ash">{level}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
          {t("arsenal")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(profile.skills).map(([group, items]) => (
            <div key={group} className="border border-white/10 bg-panel/50 p-5">
              <p className="font-display text-sm font-bold text-bone">{group}</p>
              <ul className="mt-3 space-y-1.5">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-2 text-sm text-ash"
                  >
                    <span aria-hidden="true" className="font-mono text-[10px] text-steel">
                      {"//"}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

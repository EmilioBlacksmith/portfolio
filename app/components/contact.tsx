import { getTranslations } from "next-intl/server";
import { AsciiArt } from "./ascii-art";
import { ART_FACE } from "@/data/ascii-art";
import type { Profile } from "@/data/types";

export async function Contact({ profile }: { profile: Profile }) {
  const t = await getTranslations("contact");

  return (
    <section id="contact" className="mt-4 scroll-mt-16 bg-panel">
      <div className="mx-auto max-w-[1600px] px-5 py-24 text-center sm:px-8">
        <AsciiArt seed="contact" art={ART_FACE} className="mx-auto mb-6" />
        <p className="font-mono text-xs tracking-[0.25em] text-faint uppercase">
          [03] {t("label")}
        </p>
        <a
          href="mailto:emilioblacksmithlush@gmail.com"
          aria-label="emilioblacksmithlush@gmail.com"
          className="mt-6 inline-block break-all font-display text-[clamp(1.4rem,6vw,3.75rem)] font-bold tracking-tight text-bone transition-colors hover:text-steel focus-visible:text-steel"
        >
          emilio@blacksmith:~$
        </a>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 border border-white/10 px-5 py-2.5 font-mono text-xs tracking-[0.15em] text-ash uppercase transition-colors hover:border-steel/50 hover:text-bone focus-visible:border-steel/50 focus-visible:text-bone active:scale-[0.98]"
          >
            {t("github")}
            <span className="text-steel transition-transform duration-300 group-hover:translate-x-0.5">&gt;</span>
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 border border-white/10 px-5 py-2.5 font-mono text-xs tracking-[0.15em] text-ash uppercase transition-colors hover:border-steel/50 hover:text-bone focus-visible:border-steel/50 focus-visible:text-bone active:scale-[0.98]"
          >
            {t("linkedin")}
            <span className="text-steel transition-transform duration-300 group-hover:translate-x-0.5">&gt;</span>
          </a>
          <span className="flex items-center gap-2 border border-white/10 px-5 py-2.5 font-mono text-xs tracking-[0.15em] text-ash">
            <span className="text-steel">$</span> {profile.links.npm}
          </span>
        </div>
      </div>
    </section>
  );
}

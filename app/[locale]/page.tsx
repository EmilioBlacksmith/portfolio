import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/app/components/header";
import { Hero } from "@/app/components/hero";
import { Link } from "@/i18n/navigation";
import projectsEn from "@/data/en/projects.json";
import projectsEs from "@/data/es/projects.json";
import profileEn from "@/data/en/profile.json";
import profileEs from "@/data/es/profile.json";
import type { Profile, Project } from "@/data/types";

function SectionHeading({
  index,
  label,
  art,
}: {
  index: string;
  label: string;
  art?: string;
}) {
  return (
    <div className="mb-16 flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="font-display text-4xl font-bold tracking-tight text-bone sm:text-5xl">
        <span className="mr-4 font-mono text-sm font-normal text-steel align-middle">
          [{index}]
        </span>
        {label}
      </h2>
      <AsciiArt seed={label} art={art} className="hidden sm:block" />
    </div>
  );
}

const ART_ANVIL = `⢀⡀
⢻⣿⡗⢶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣄
⠀⢻⣇⠀⠈⠙⠳⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠶⠛⠋⣹⣿⡿
⠀⠀⠹⣆⠀⠀⠀⠀⠙⢷⣄⣀⣀⣀⣤⣤⣤⣄⣀⣴⠞⠋⠉⠀⠀⠀⢀⣿⡟⠁
⠀⠀⠀⠙⢷⡀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠋⠀⠀
⠀⠀⠀⠀⠈⠻⡶⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣠⡾⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣼⠃⠀⢠⠒⣆⠀⠀⠀⠀⠀⠀⢠⢲⣄⠀⠀⠀⢻⣆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢰⡏⠀⠀⠈⠛⠋⠀⢀⣀⡀⠀⠀⠘⠛⠃⠀⠀⠀⠈⣿⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣾⡟⠛⢳⠀⠀⠀⠀⠀⣉⣀⠀⠀⠀⠀⣰⢛⠙⣶⠀⢹⣇⠀⠀⠀⠀
⠀⠀⠀⠀⢿⡗⠛⠋⠀⠀⠀⠀⣾⠋⠀⢱⠀⠀⠀⠘⠲⠗⠋⠀⠈⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠘⢷⡀⠀⠀⠀⠀⠀⠈⠓⠒⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡇⠀⠀⠀
⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣧⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠁`;

const ART_HAMMER = `⠀⣠⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣰⣄⡀⠀⠀⠀
⣿⠋⣻⢲⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡀⠀⠙⣆⠀⠀
⣿⣦⡀⠀⢘⢷⣀⠀⢀⣰⢟⠛⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⡄⠀⠀⠈⢷⡀⠀⢹⢷⠀
⠈⢿⡄⠀⠈⠉⠈⠹⣟⠋⠀⣵⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣿⣤⣤⣼⣷⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡏⠙⣦⡀⠀⣼⡇⠀⠀⢸⡇
⠀⠈⣇⠀⠀⠀⠀⠞⠉⢀⡾⠁⠀⠀⠀⠀⠀⠀⠀⣠⡶⣟⢟⣉⠀⠀⣀⣀⣉⠉⠉⠓⠦⣄⠀⠀⠀⠀⠀⠸⣇⠀⢘⣧⣴⠿⠀⠀⠀⢸⡇
⠀⠀⠛⣇⠀⢈⠀⠀⠀⠘⡇⠀⠀⠀⠀⠀⢀⣤⢾⣷⡶⠛⠛⠛⠀⠀⠈⠉⠉⠙⠳⡄⠀⠈⠳⣄⠀⠀⠀⠀⢸⡇⠀⠙⠁⠀⠀⠀⠀⢺⡇
⠀⠀⠀⢿⡀⠀⠀⠒⠀⣈⡇⠀⠀⠀⠀⢠⡟⠑⠁⠀⢀⡀⣠⣴⣷⣶⣶⣶⣤⣀⠀⠀⠀⠀⠀⠈⢳⡄⠀⠀⢸⡇⠀⠀⠀⠀⠀⢠⢾⠟⠁
⠀⠀⠀⠈⠳⣄⠀⠀⢨⣿⠉⠀⠀⠀⢠⡟⠀⠀⠀⠀⣤⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⢈⢻⡄⠈⠉⠳⣇⠀⢀⢄⣤⠞⠁⠀⠀
⠀⠀⠀⠀⠀⠈⠹⠏⠏⠁⠀⠀⠀⠀⡿⠀⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠈⢏⡇⠀⠀⠀⠈⠹⠉⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠈⣻⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣇⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠀⠀⠀⣿⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣯⠀⠂⣿⣿⣿⣿⣿⡿⠿⠉⠉⠉⠛⠿⣿⣿⣿⣿⣿⣧⠀⠀⢰⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⠀⠠⣿⣿⣿⣿⠯⠀⠀⠀⠀⠀⠀⠀⠛⢿⣿⣿⣿⣿⠏⠀⣾⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣇⠺⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⢿⣿⣿⡃⢼⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣤⠛⠏⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠈⣛⣿⣳⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⠓⠶⣄⡀⠀⠀⠀⠀⠀⠀⠀⢀⡀⣶⣶⠿⠟⠻⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠒⠶⠶⠒⠲⠶⠞⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`;

const ASCII_ARTS = [ART_ANVIL, ART_HAMMER];

const ART_FACE = `⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠴⠒⠚⠋⠉⠉⠛⠶⣄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⡴⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢳⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣰⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠖⠢⡄⢹⢦⠀⠀⠀⠀
⠀⢠⣠⡾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠞⠁⠀⣾⣿⣦⣻⣇⠀⠀⠀
⠀⣸⠋⠀⣠⠴⠚⠛⠲⣦⡀⠀⠀⠀⡇⠀⠀⠀⠉⠉⠁⢳⢹⣆⠀⠀
⡆⡿⠀⢰⣷⣶⠀⠀⠀⠘⣺⠀⠀⠀⠙⢦⡀⠀⠀⠀⠀⢸⠃⢻⢇⠀
⣧⠃⠀⠘⡏⠁⠀⠀⠀⡴⠃⠀⠀⠀⠀⠀⠉⠓⠒⠒⠚⠉⠀⠈⣟⡆
⣿⠀⠀⠀⠳⣄⣀⣠⠞⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⡇
⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⡇
⣏⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⡇
⢸⣹⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣦⡀⠀⠀⢀⣼⠀⠀⠀⠀⠀⠀⠀⣷
⠀⠳⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠛⠛⠁⠀⠀⠀⠀⠀⠀⢠⡏
⠀⠀⢟⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡟⠀
⠀⠀⠘⠈⠙⠒⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠚⠀⠀`;

const ART_WORK = `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠤⢔⣶⣒⠒⠒⠒⠠⠄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠴⢊⡡⠔⣶⡿⠛⠛⠁⠉⠉⠐⠢⣤⣭⡲⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣀⣀⣀⡀⠀⠀⠀⠀⠀⢀⠔⢡⠖⠁⠀⠘⠁⠀⡀⠀⠀⠀⠀⠀⠀⠛⠛⢷⡀⠑⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠠⠊⢎⠀⠀⠙⢦⡀⠀⠀⡰⠃⡐⠁⠀⠀⠀⢠⣮⠴⠒⠿⣄⠀⠀⠀⡠⠤⢤⡀⠓⡄⠀⠣⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠱⠀⡰⠁⢰⠁⠀⠄⡀⠀⣶⠃⣠⡤⡄⠙⡄⠀⣼⠞⠉⠙⠻⣇⠸⡄⠀⠑⡀⠀⠀⣠⠚⠛⠛⡗⢄⠀⠀⠀
⠀⠀⠀⠈⠆⠀⠀⠀⠀⠀⢀⢠⠃⠀⠀⠁⠀⠀⠤⣁⣸⢸⣧⣿⢹⠀⣷⠀⣿⣞⣿⣧⠀⠘⡆⠀⠀⠀⢳⠀⡞⡁⠀⠀⠐⠁⠈⡆⠀⠀
⠀⠀⠀⠀⠘⣀⠀⠄⡤⠤⣾⣼⡀⠀⠀⠀⠀⠐⠂⠒⠌⠹⣿⡷⠋⢠⡟⠀⠈⣿⣯⡽⠁⢀⡇⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⡘⠀⠀⠀
⠀⠀⢠⡴⠋⠀⠀⠀⠀⠀⠀⠈⠙⠳⣄⠀⠀⠊⠉⠱⡒⠄⠪⠱⠶⠋⠀⠀⠀⠈⠣⣤⡴⠞⠁⠂⠀⠀⢀⣇⣧⣤⣄⠀⢀⡸⠀⠀⠀⠀
⠀⣰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠤⠜⡆⠀⠀⠀⠀⠘⣦⣀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠨⣻⠭⠀⣠⠞⠋⠁⠀⠀⠀⠀⠀⠩⡲⣄⠀⠀
⢰⠁⠀⠀⠲⣀⡠⠔⠂⠀⠀⠐⠒⠲⢖⣇⠀⠀⠀⠀⠀⢹⣧⡉⠐⠒⠤⠤⠤⢤⣤⠖⠊⠁⠀⢰⠓⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢪⢧⠀
⠀⠀⠀⠀⠀⢱⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣇⠀⠀⠀⠀⠀⢿⣿⣶⣤⣄⣀⣤⣾⠇⠀⠀⠀⢀⣼⠞⠛⠉⠉⠉⠑⠒⠠⢄⠔⠀⠀⠀⠇
⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣬⠀⠀⠀⠀⠀⠀⢢⠙⡟⢿⣿⣿⡿⠀⠀⠀⠀⠸⡅⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀
⠘⡆⠀⠀⠀⠀⠀⢲⠊⠁⠀⠀⠈⠑⢳⢮⡀⠑⢠⡀⠀⠀⠀⠀⠙⠳⠤⠿⠛⠁⠀⠀⠀⠀⠘⣄⣀⢤⠤⠤⠤⣀⠀⡀⠀⠀⠀⠀⠀⡀
⠀⠘⢆⠀⠀⠀⠀⠐⠀⠀⠀⠀⠀⠀⠀⡜⠻⡦⡀⠉⠢⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠔⠙⠏⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⡰⠁
⠀⠀⠀⠑⠄⣀⠀⠀⠀⠀⠀⠀⣀⠠⠊⠀⠀⠈⠙⠳⢦⣄⠀⠀⠀⠀⠀⠀⠀⣀⡀⠔⠊⠁⠀⠐⢄⠀⠀⠀⠀⠀⠈⠀⠀⠀⢀⠜⠀⠀
⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠁⠀⠀⠀⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠑⠢⡤⠀⠀⠀⠠⡴⠊⠁⠀⠀⠀`;

function AsciiArt({
  seed,
  art,
  className,
}: {
  seed: string;
  art?: string;
  className?: string;
}) {
  const index =
    seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    ASCII_ARTS.length;
  const lines = (art ?? ASCII_ARTS[index])
    .split("\n")
    .map((line) => line.replace(/[\u2800\s]+$/, ""))
    .filter((line) => line.length > 0);

  return (
    <pre
      aria-hidden="true"
      className={`m-0 font-mono text-[6px] leading-[6px] text-steel opacity-70 select-none ${className ?? ""}`}
    >
      {lines.join("\n")}
    </pre>
  );
}

function WorkCard({
  project,
  index,
  latestLabel,
}: {
  project: Project;
  index: number;
  latestLabel: string;
}) {
  const cover = project.projectImgs?.[0];
  const tag = project.isFeatured
    ? latestLabel
    : `item_${String(index + 1).padStart(2, "0")}`;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col overflow-hidden bg-panel transition-colors duration-300 hover:bg-white/[0.04]"
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
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">
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
      </div>
    </Link>
  );
}

async function Work({ projects }: { projects: Project[] }) {
  const t = await getTranslations("sections");
  const projectsT = await getTranslations("projects");

  return (
    <section id="work" className="mx-auto max-w-[1600px] px-5 py-28 sm:px-8">
      <SectionHeading index="01" label={t("work")} art={ART_WORK} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <WorkCard
            key={project.id}
            project={project}
            index={i}
            latestLabel={projectsT("latest")}
          />
        ))}
      </div>
    </section>
  );
}

async function About({ profile }: { profile: Profile }) {
  const t = await getTranslations("about");
  const sectionsT = await getTranslations("sections");

  return (
    <section id="about" className="mx-auto max-w-[1600px] px-5 py-28 sm:px-8">
      <SectionHeading index="02" label={sectionsT("about")} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6 text-base leading-relaxed text-ash">
          {profile.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
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
                    {job.company} · {job.location}
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

async function Contact({ profile }: { profile: Profile }) {
  const t = await getTranslations("contact");

  return (
    <section id="contact" className="mt-4 bg-panel">
      <div className="mx-auto max-w-[1600px] px-5 py-24 text-center sm:px-8">
        <AsciiArt seed="contact" art={ART_FACE} className="mx-auto mb-6" />
        <p className="font-mono text-xs tracking-[0.25em] text-faint uppercase">
          [03] {t("label")}
        </p>
        <a
          href="mailto:hello@emilioblacksmith.dev"
          className="mt-6 inline-block break-all font-display text-[clamp(1.4rem,6vw,3.75rem)] font-bold tracking-tight text-bone transition-colors hover:text-steel"
        >
          emilio@blacksmith:~$
        </a>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 border border-white/10 px-5 py-2.5 font-mono text-xs tracking-[0.15em] text-ash uppercase transition-colors hover:border-steel/50 hover:text-bone"
          >
            {t("github")}
            <span className="text-steel transition-transform duration-300 group-hover:translate-x-0.5">&gt;</span>
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 border border-white/10 px-5 py-2.5 font-mono text-xs tracking-[0.15em] text-ash uppercase transition-colors hover:border-steel/50 hover:text-bone"
          >
            {t("linkedin")}
            <span className="text-steel transition-transform duration-300 group-hover:translate-x-0.5">&gt;</span>
          </a>
          <span className="flex items-center gap-2 border border-white/10 px-5 py-2.5 font-mono text-xs tracking-[0.15em] text-ash">
            <span className="text-steel">$</span> {profile.links.npm}
          </span>
        </div>

        <p className="mt-12 font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
          {t("footer")}
        </p>
      </div>
    </section>
  );
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const projects: Project[] = locale === "es" ? projectsEs : projectsEn;
  const profile: Profile = locale === "es" ? profileEs : profileEn;

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Work projects={projects} />
        <About profile={profile} />
        <Contact profile={profile} />
      </main>
    </>
  );
}

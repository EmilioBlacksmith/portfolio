import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link, locales } from "@/i18n/navigation";
import { Header } from "@/app/components/header";
import { AsciiArt } from "@/app/components/ascii-art";
import { ART_QUILL } from "@/data/ascii-art";
import { getPosts, resolveAsset } from "@/lib/blog";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function BlogIndex({
  params,
}: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const posts = getPosts(locale);
  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="min-h-svh pt-16">
      <Header base="/" />

      <div className="mx-auto max-w-[760px] px-5 py-12 sm:px-8">
        <header className="mb-16 flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
              emilio@blacksmith:~/blog$
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-bone sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ash">
              {t("description")}
            </p>
          </div>
          <AsciiArt seed="blog" art={ART_QUILL} className="hidden shrink-0 sm:block" />
        </header>

        {posts.length === 0 ? (
          <p className="font-mono text-sm text-faint">
            {t("empty")}
            <span className="ml-1 inline-block h-3.5 w-[7px] translate-y-[2px] bg-bone/80 animate-blink" />
          </p>
        ) : (
          <div className="divide-y divide-white/10 border-y border-white/10">
            {posts.map((post, i) => {
              const cover = post.frontmatter.cover
                ? resolveAsset(post.frontmatter.cover)
                : undefined;
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex items-center gap-5 py-6 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                      [{String(i + 1).padStart(2, "0")}] /{" "}
                      {dateFmt.format(new Date(post.frontmatter.date))} /{" "}
                      {post.readingTime} min
                    </p>
                    <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-bone transition-colors group-hover:text-steel sm:text-2xl">
                      {post.frontmatter.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ash">
                      {post.frontmatter.description}
                    </p>
                    {post.frontmatter.tags && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.frontmatter.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ash"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {cover && (
                    <div className="relative aspect-[16/10] w-24 shrink-0 overflow-hidden bg-panel sm:w-36">
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 96px, 144px"
                        className="object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
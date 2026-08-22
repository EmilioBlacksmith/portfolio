import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "./section-heading";
import { ART_QUILL } from "@/data/ascii-art";
import { getPosts, resolveAsset } from "@/lib/blog";

export async function LatestPosts({ locale }: { locale: string }) {
  const sectionsT = await getTranslations("sections");
  const blogT = await getTranslations("blog");
  const posts = getPosts(locale).slice(0, 3);
  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <section
      id="journal"
      className="mx-auto max-w-[1600px] scroll-mt-16 px-5 py-28 sm:px-8"
    >
      <SectionHeading index="03" label={sectionsT("blog")} art={ART_QUILL} />

      {posts.length === 0 ? (
        <p className="font-mono text-sm text-faint">{blogT("empty")}</p>
      ) : (
        <div className="max-w-[760px] divide-y divide-white/10 border-y border-white/10">
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
                  <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-bone transition-colors group-hover:text-steel sm:text-2xl">
                    {post.frontmatter.title}
                  </h3>
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

      <Link
        href="/blog"
        className="group mt-8 inline-flex items-center gap-2 font-mono text-xs tracking-[0.15em] text-ash uppercase transition-colors hover:text-bone"
      >
        {blogT("all")}
        <span className="text-steel transition-transform duration-300 group-hover:translate-x-0.5">
          &gt;
        </span>
      </Link>
    </section>
  );
}
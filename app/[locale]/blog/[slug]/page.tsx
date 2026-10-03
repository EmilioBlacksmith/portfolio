import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/navigation";
import { Header } from "@/app/components/header";
import { JsonLd } from "@/app/components/json-ld";
import { getPost, getPosts, resolveAsset } from "@/lib/blog";
import { RSS_ALTERNATES, SITE } from "@/lib/site";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getPosts(locale).map((post) => ({ locale, slug: post.slug }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
      types: RSS_ALTERNATES,
    },
    openGraph: {
      type: "article",
      publishedTime: post.frontmatter.date,
    },
  };
}

export default async function BlogPost({
  params,
}: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPost(locale, slug);
  if (!post) notFound();

  const t = await getTranslations("blog");
  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const cover = post.frontmatter.cover
    ? resolveAsset(post.frontmatter.cover)
    : undefined;

  const articleUrl = `${SITE.url}/blog/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.date,
    inLanguage: locale,
    url: articleUrl,
    image: cover ? `${SITE.url}${cover}` : `${SITE.url}/blog/${post.slug}/opengraph-image`,
    author: {
      "@type": "Person",
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: articleUrl,
  };

  return (
    <main id="top" className="min-h-svh pt-16">
      <Header base="/" />
      <JsonLd data={articleSchema} />

      <div className="mx-auto max-w-[760px] px-5 py-12 sm:px-8">
        <header className="pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            {dateFmt.format(new Date(post.frontmatter.date))} /{" "}
            {post.readingTime} {t("minRead")}
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-bone sm:text-5xl">
            {post.frontmatter.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ash">
            {post.frontmatter.description}
          </p>
          {post.frontmatter.tags && (
            <div className="mt-5 flex flex-wrap gap-1.5">
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
        </header>

        {cover && (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden bg-panel">
            <Image
              src={cover}
              alt=""
              fill
              sizes="(max-width: 760px) 100vw, 760px"
              className="object-cover"
            />
          </div>
        )}

        <article
          className="blog-prose text-base leading-relaxed text-ash"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <footer className="mt-12 border-t border-white/10 pt-6">
          <div className="flex justify-end">
            <a
              href="#top"
              className="font-mono text-[11px] tracking-[0.15em] text-ash uppercase transition-colors hover:text-bone focus-visible:text-bone"
            >
              {t("backToTop")} <span className="text-steel">^</span>
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
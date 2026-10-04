import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/app/components/header";
import { StatusBoard } from "@/app/components/status-board";
import { runChecks, SERVICES } from "@/lib/status";
import { getHistory } from "@/lib/status-history";
import { RSS_ALTERNATES } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/status">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "status" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/status",
      types: RSS_ALTERNATES,
    },
  };
}

export default async function StatusPage({
  params,
}: PageProps<"/[locale]/status">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("status");
  const report = await runChecks();
  const history = getHistory(SERVICES.map((s) => s.id));

  return (
    <main id="main-content" className="min-h-svh pt-16">
      <Header base="/" />

      <div className="mx-auto max-w-[900px] px-5 py-12 sm:px-8">
        <header className="pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            [05] {t("label")}
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-bone sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ash">
            {t("description")}
          </p>
        </header>

        <StatusBoard initial={report} history={history} />
      </div>
    </main>
  );
}

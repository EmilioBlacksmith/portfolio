import { setRequestLocale } from "next-intl/server";
import { Header } from "@/app/components/header";
import { Hero } from "@/app/components/hero";
import { Work } from "@/app/components/work";
import { About } from "@/app/components/about";
import { Contact } from "@/app/components/contact";
import { getProfile, getProjects } from "@/data";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Work projects={getProjects(locale)} />
        <About profile={getProfile(locale)} />
        <Contact profile={getProfile(locale)} />
      </main>
    </>
  );
}

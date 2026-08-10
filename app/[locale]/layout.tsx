import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import "../globals.css";
import { locales } from "@/i18n/navigation";
import { SITE } from "@/lib/site";
import { JsonLd } from "@/app/components/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.fullName,
  alternateName: SITE.name,
  url: SITE.url,
  jobTitle: "Product Engineer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Puebla",
    addressCountry: "MX",
  },
  sameAs: [SITE.social.github, SITE.social.linkedin],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#171c26",
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const description = t("description");

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: t("title"),
      template: `%s | ${SITE.name}`,
    },
    description,
    applicationName: SITE.name,
    keywords: [
      "Emilio Herrera",
      "Emilio Blacksmith",
      "Product Engineer",
      "Full Stack Developer",
      "Software Engineer",
      "React",
      "Next.js",
      "TypeScript",
      "LLM",
      "Rust",
    ],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: SITE.url,
      locale: locale === "es" ? "es_MX" : "en_US",
      siteName: SITE.name,
      title: SITE.title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE.title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-bone">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <JsonLd data={personSchema} />
        <JsonLd data={websiteSchema} />
      </body>
    </html>
  );
}

import { createNavigation } from "next-intl/navigation";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const localePrefix = "never";
export const defaultLocale: Locale = "en";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({ locales, localePrefix, defaultLocale });

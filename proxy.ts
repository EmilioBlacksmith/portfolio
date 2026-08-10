import createMiddleware from "next-intl/middleware";

import { defaultLocale, localePrefix, locales } from "./i18n/navigation";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

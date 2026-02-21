import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Supported locales ──────────────────────────────────────────────────────
const locales = ["en", "ru"] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = "en";

// ── Locale negotiation ─────────────────────────────────────────────────────
function getPreferredLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get("accept-language") ?? "";

  // Parse "Accept-Language" header, e.g. "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7"
  const preferred = acceptLanguage
    .split(",")
    .map((part) => {
      const [lang, q] = part.trim().split(";q=");
      return { lang: (lang ?? "").split("-")[0]!.toLowerCase(), q: parseFloat(q ?? "1") };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of preferred) {
    if ((locales as readonly string[]).includes(lang)) {
      return lang as Locale;
    }
  }
  return defaultLocale;
}

// ── Middleware ─────────────────────────────────────────────────────────────
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already has a supported locale prefix
  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return; // Already localised — pass through

  // Redirect: prepend the preferred locale
  const locale = getPreferredLocale(request);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static (Next.js static assets)
     *  - _next/image  (image optimisation)
     *  - favicon.ico, robots.txt, sitemap.xml
     *  - public folder files (images, fonts, etc.)
     *  - api routes
     *  - admin route (no i18n needed)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|woff|woff2)|api|admin).*)",
  ],
};
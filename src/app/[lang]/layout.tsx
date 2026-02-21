import type { Locale } from "@/i18n/dictionaries";
import { locales } from "@/i18n/dictionaries";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
}: {
  children: React.ReactNode;
  // params is intentionally NOT destructured — Next.js requires
  // params.lang to be typed as `string`, not `"en" | "ru"`.
  // Narrowing happens inside page.tsx via hasLocale().
  params: Promise<{ lang: string }>;
}) {
  return <>{children}</>;
}
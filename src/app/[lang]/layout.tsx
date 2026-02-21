import type { Locale } from "@/i18n/dictionaries";
import { locales } from "@/i18n/dictionaries";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  // Do NOT wrap in <html><body> here.
  // Your root app/layout.tsx already renders those.
  // Nesting html/body tags breaks Tailwind's `fixed` and `absolute`
  // positioning — which is why the background image disappeared
  // and AIChat lost its fixed positioning.
  return <>{children}</>;
}
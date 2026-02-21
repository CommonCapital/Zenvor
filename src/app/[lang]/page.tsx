import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/dictionaries";
import ZenvorPage from "@/components/ZenvorPage";

// Pre-render both locales at build time
export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ru" }];
}

// Generate locale-aware metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isRu = lang === "ru";
  return {
    title: isRu
      ? "Zenvor — Платформа автоматизации на базе ИИ"
      : "Zenvor — Enterprise AI Automation Platform",
    description: isRu
      ? "Девять специализированных ИИ-ассистентов для вашего бизнеса."
      : "Nine specialized AI assistants working together for your business.",
    alternates: {
      canonical: `/${lang}`,
      languages: {
        en: "/en",
        ru: "/ru",
      },
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return <ZenvorPage dict={dict} lang={lang as Locale} />;
}
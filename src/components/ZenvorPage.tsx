"use client";

import AIChat from "@/components/AIChat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/dictionaries";

// ── Types ──────────────────────────────────────────────────────────────────
interface NavLink {
  label: string;
  href: string;
}

// ── Hooks ──────────────────────────────────────────────────────────────────
function useScrolled(threshold = 10): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useInView(ref: React.RefObject<Element | null>, threshold = 0.12) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Logo({ size = 26, strokeWidth = 1.4 }: { size?: number; strokeWidth?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.022em",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      <span style={{ color: "#0B1F3B" }}>Zen</span>
      <span
        style={{
          WebkitTextFillColor: "transparent",
          color: "transparent",
          WebkitTextStrokeColor: "#0B1F3B",
          WebkitTextStrokeWidth: `${strokeWidth}px`,
        }}
      >
        vor
      </span>
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Language Switcher ──────────────────────────────────────────────────────
function LangSwitcher({ lang }: { lang: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const navy = "#0B1F3B";
  const white = "#FFFFFF";

  const switchTo = (target: Locale) => {
    // Replace the current locale segment in the pathname
    const segments = pathname.split("/");
    segments[1] = target;
    router.push(segments.join("/"));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: `1px solid rgba(11,31,59,0.22)`,
        borderRadius: 2,
        overflow: "hidden",
        height: 32,
      }}
    >
      {(["en", "ru"] as Locale[]).map((l, i) => {
        const active = lang === l;
        return (
          <button
            key={l}
            onClick={() => switchTo(l)}
            style={{
              height: "100%",
              padding: "0 11px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: active ? navy : "transparent",
              color: active ? white : `rgba(11,31,59,0.45)`,
              border: "none",
              borderLeft: i > 0 ? `1px solid rgba(11,31,59,0.18)` : "none",
              cursor: active ? "default" : "pointer",
              transition: "all 0.18s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

// ── ServiceCard ────────────────────────────────────────────────────────────
function ServiceCard({
  num, name, tag, desc, bullets, wide,
}: {
  num: string; name: string; tag: string; desc: string; bullets: string[]; wide?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const navy = "#0B1F3B";
  const white = "#FFFFFF";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? navy : white,
        padding: "36px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "background 0.26s ease",
        cursor: "default",
        gridColumn: wide ? "span 2" : "span 1",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: wide ? "1fr 1fr" : "1fr",
          gap: wide ? 40 : 0,
          alignItems: "start",
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: hovered ? "rgba(255,255,255,0.3)" : "rgba(11,31,59,0.25)", marginBottom: 20, transition: "color 0.26s" }}>
            {num}
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em", color: hovered ? white : navy, marginBottom: 14, transition: "color 0.26s", lineHeight: 1.2 }}>
            {name}
          </p>
          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: hovered ? "rgba(255,255,255,0.65)" : "rgba(11,31,59,0.55)", marginBottom: 24, transition: "color 0.26s" }}>
            {desc}
          </p>
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 2, background: hovered ? "rgba(255,255,255,0.1)" : "rgba(11,31,59,0.06)", color: hovered ? "rgba(255,255,255,0.6)" : "rgba(11,31,59,0.5)", transition: "all 0.26s", alignSelf: "flex-start" }}>
            {tag}
          </span>
        </div>
        {/* Right / Bullets */}
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, marginTop: wide ? 56 : 24 }}>
          {bullets.map((b) => (
            <li key={b} style={{ fontSize: 13, color: hovered ? "rgba(255,255,255,0.7)" : "rgba(11,31,59,0.65)", display: "flex", alignItems: "center", gap: 10, transition: "color 0.26s" }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: hovered ? "rgba(255,255,255,0.4)" : "rgba(11,31,59,0.3)", flexShrink: 0, display: "inline-block", transition: "background 0.26s" }} />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatBar({ stats }: { stats: Dictionary["stats"] }) {
  return (
    <div style={{ background: "#0B1F3B", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: "28px 40px", textAlign: "center", borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none", flex: "1 1 120px" }}>
          <span style={{ display: "block", fontSize: 30, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</span>
          <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 6 }}>{s.label}</span>
          {s.sub && <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>{s.sub}</span>}
        </div>
      ))}
    </div>
  );
}

const INTEGRATIONS = [
  "WhatsApp", "Instagram", "LinkedIn", "Telegram", "Facebook Messenger",
  "HubSpot", "Salesforce", "Bitrix24", "amoCRM", "Pipedrive",
  "Google Calendar", "Outlook", "Make", "Zapier", "n8n",
  "SQL Databases", "MongoDB", "Airtable", "Webhooks", "REST APIs",
  "Notion", "Slack", "Intercom", "Zendesk", "Custom Systems",
];

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ZenvorPage({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: Locale;
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const scrolled = useScrolled();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navy = "#0B1F3B";
  const white = "#FFFFFF";
  const muted = "#f4f5f7";

  const NAV_LINKS: NavLink[] = [
    { label: dict.nav.services,      href: "#services" },
    { label: dict.nav.howItWorks,    href: "#how" },
    { label: dict.nav.integrations,  href: "#integrations" },
    { label: dict.nav.about,         href: "#about" },
  ];

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,300&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #FFFFFF; color: #0B1F3B; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        ::selection { background: #0B1F3B; color: #FFFFFF; }
        @media (max-width: 768px) {
          .services-grid { grid-template-columns: 1fr !important; }
          .wide-card { grid-column: span 1 !important; }
          .wide-card-inner { grid-template-columns: 1fr !important; }
          .hero-logo-text { font-size: clamp(64px, 18vw, 120px) !important; }
          .intro-grid { grid-template-columns: 1fr !important; }
          .step-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-bottom { flex-direction: column !important; gap: 16px !important; align-items: flex-start !important; }
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .stat-item { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .hero-actions { flex-direction: column !important; }
          .section-pad { padding: 72px 20px !important; }
          .hero-pad { padding: 130px 20px 80px !important; }
          .nav-pad { padding: 0 20px !important; }
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? "rgba(255,255,255,0.94)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? `1px solid rgba(11,31,59,0.1)` : "1px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        {/* Top utility bar */}
        <div
          style={{ background: navy, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 64px", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em" }}
          className="nav-pad"
        >
          <span style={{ color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
            {dict.nav.utilityBar}
          </span>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href={`mailto:${dict.nav.email}`} style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", letterSpacing: "0.06em" }}>
              {dict.nav.email}
            </a>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <Link href={`/${lang}/book-demo`} style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", letterSpacing: "0.06em" }}>
              {dict.nav.bookCall}
            </Link>
          </div>
        </div>

        {/* Main nav */}
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 64px", height: 64 }}
          className="nav-pad"
        >
          <a href="#" style={{ textDecoration: "none" }}>
            <Logo size={26} strokeWidth={1.4} />
          </a>

          {/* Desktop links */}
          <ul className="nav-desktop" style={{ display: "flex", gap: 36, listStyle: "none", alignItems: "center" }}>
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: navy, textDecoration: "none", opacity: 0.45, transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "0.45")}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA + lang switcher */}
          <div className="nav-desktop" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* Language Switcher */}
            <LangSwitcher lang={lang} />

            <a
              href="#contact"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: navy, textDecoration: "none", opacity: 0.5, transition: "opacity 0.2s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "0.5")}
            >
              {dict.nav.contact}
            </a>
            <Link
              href={`/${lang}/book-demo`}
              style={{ background: navy, color: white, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 24px", height: 40, display: "flex", alignItems: "center", borderRadius: 2, textDecoration: "none", border: `1px solid ${navy}`, transition: "all 0.22s" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = white; el.style.color = navy; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = navy; el.style.color = white; }}
            >
              {dict.nav.bookDemo}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 8 }}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ display: "block", width: 24, height: 1.5, background: navy, transition: "all 0.2s", transform: mobileMenuOpen ? i === 0 ? "translateY(6.5px) rotate(45deg)" : i === 2 ? "translateY(-6.5px) rotate(-45deg)" : "scaleX(0)" : "none" }} />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{ background: white, borderTop: `1px solid rgba(11,31,59,0.1)`, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: navy, textDecoration: "none", padding: "14px 0", borderBottom: `1px solid rgba(11,31,59,0.08)`, opacity: 0.7 }}>
                {l.label}
              </a>
            ))}
            {/* Mobile lang switcher */}
            <div style={{ padding: "16px 0", borderBottom: `1px solid rgba(11,31,59,0.08)` }}>
              <LangSwitcher lang={lang} />
            </div>
            <Link
              href={`/${lang}/book-demo`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ marginTop: 20, background: navy, color: white, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "14px 24px", textAlign: "center", borderRadius: 2, textDecoration: "none" }}
            >
              {dict.nav.bookDemo}
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section
        className="hero-pad"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "160px 40px 100px", position: "relative", overflow: "hidden" }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/background.jpg")' }}
        />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 70% at 50% -5%, rgba(11,31,59,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(11,31,59,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(11,31,59,0.04) 1px, transparent 1px)", backgroundSize: "72px 72px", pointerEvents: "none" }} />

        {/* Eyebrow */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 16, marginBottom: 44, animation: "fadeUp 0.8s ease both" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#0F766E" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: navy, opacity: 0.4 }}>
            {dict.hero.eyebrow}
          </span>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#0F766E" }} />
        </div>

        {/* Big Logo */}
        <div
          className="hero-logo-text"
          style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "baseline", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(72px, 13vw, 172px)", letterSpacing: "-0.028em", lineHeight: 1, marginBottom: 36, animation: "fadeUp 0.8s 0.1s ease both" }}
        >
          <span style={{ color: navy }}>Zen</span>
          <span style={{ WebkitTextFillColor: "transparent", color: "transparent", WebkitTextStrokeColor: navy, WebkitTextStrokeWidth: "clamp(1.5px, 0.25vw, 3px)" }}>vor</span>
        </div>

        {/* Tagline */}
        <p style={{ position: "relative", zIndex: 1, fontFamily: "'EB Garamond', serif", fontSize: "clamp(20px, 2.4vw, 28px)", fontWeight: 400, fontStyle: "italic", color: navy, opacity: 0.55, maxWidth: 580, lineHeight: 1.55, marginBottom: 20, animation: "fadeUp 0.8s 0.2s ease both" }}>
          {dict.hero.tagline}
        </p>

    

        {/* Hero actions */}
        <div className="hero-actions" style={{ position: "relative", zIndex: 1, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.8s 0.32s ease both" }}>
          <Link
            href={`/${lang}/dashboard`}
            style={{ background: navy, color: white, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 40px", height: 52, display: "flex", alignItems: "center", borderRadius: 2, textDecoration: "none", border: `1px solid ${navy}`, transition: "all 0.22s" }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = white; el.style.color = navy; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = navy; el.style.color = white; }}
          >
            {dict.hero.ctaStart}
          </Link>
          <a
            href="#services"
            style={{ background: "white", color: navy, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 32px", height: 52, display: "flex", alignItems: "center", borderRadius: 2, textDecoration: "none", border: `1px solid rgba(11,31,59,0.28)`, transition: "all 0.22s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "white"; (e.currentTarget as HTMLElement).style.background = navy; (e.currentTarget as HTMLElement).style.color = "white"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "white"; (e.currentTarget as HTMLElement).style.background = "white"; (e.currentTarget as HTMLElement).style.color = navy; }}
          >
            {dict.hero.ctaSee}
          </a>
          <a
            href="#how"
            style={{  fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "white", opacity: 2, textDecoration: "underline", textUnderlineOffset: 4, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.9")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.4")}
          >
            {dict.hero.ctaHow}
          </a>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.25, animation: "fadeUp 1s 0.6s ease both" }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>{dict.hero.scroll}</span>
          <div style={{ width: 1, height: 40, background: navy, animation: "pulse 2s ease infinite" }} />
        </div>

        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scaleY(1); } 50% { opacity: 0.7; transform: scaleY(1.15); } }
        `}</style>
      </section>

      {/* ── STAT BAR ── */}
      <StatBar stats={dict.stats} />

      {/* ── INTRO ── */}
      <section className="section-pad" style={{ padding: "112px 64px", borderTop: `1px solid rgba(11,31,59,0.1)` }}>
        <div className="intro-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, maxWidth: 1200, margin: "0 auto", alignItems: "start" }}>
          {/* Left */}
          <Reveal>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: navy, opacity: 0.3, marginBottom: 20 }}>{dict.intro.eyebrow}</p>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(30px, 3.5vw, 48px)", fontWeight: 700, letterSpacing: "-0.024em", lineHeight: 1.1, color: navy, marginBottom: 24 }}>
              {dict.intro.heading1}{" "}
              <em style={{ fontFamily: "'EB Garamond', serif", fontWeight: 400, fontStyle: "italic" }}>{dict.intro.headingItalic}</em>
            </h2>
            <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.75, color: navy, opacity: 0.55, marginBottom: 36 }}>{dict.intro.p1}</p>
            <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.75, color: navy, opacity: 0.45, marginBottom: 40 }}>{dict.intro.p2}</p>
            <a
              href="#services"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: navy, textDecoration: "none", borderBottom: `1px solid ${navy}`, paddingBottom: 3, transition: "opacity 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.5")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              {dict.intro.cta}
            </a>
          </Reveal>

          {/* Right – cells grid */}
          <Reveal delay={0.12}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(11,31,59,0.1)", border: "1px solid rgba(11,31,59,0.1)" }}>
              {dict.intro.cells.map((cell) => (
                <div
                  key={cell.num}
                  style={{ background: white, padding: "24px 22px", transition: "background 0.22s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = muted)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = white)}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: navy, opacity: 0.22, marginBottom: 10 }}>{cell.num}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: navy, marginBottom: 6, lineHeight: 1.3 }}>{cell.title}</p>
                  <p style={{ fontSize: 12, lineHeight: 1.6, color: navy, opacity: 0.45 }}>{cell.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="section-pad" style={{ background: muted, borderTop: `1px solid rgba(11,31,59,0.1)`, borderBottom: `1px solid rgba(11,31,59,0.1)`, padding: "112px 64px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: navy, opacity: 0.3, marginBottom: 20 }}>{dict.services.eyebrow}</p>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, color: navy, marginBottom: 20 }}>
              {dict.services.heading1}{" "}
              <em style={{ fontFamily: "'EB Garamond', serif", fontWeight: 400, fontStyle: "italic" }}>{dict.services.headingItalic}</em>
            </h2>
            <p style={{ fontSize: 16, fontWeight: 300, color: navy, opacity: 0.45, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>{dict.services.sub}</p>
          </div>
        </Reveal>

        <div
          className="services-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(11,31,59,0.1)", border: "1px solid rgba(11,31,59,0.1)", maxWidth: 1200, margin: "0 auto" }}
        >
          {dict.services.items.map((svc, i) => (
            <ServiceCard
              key={svc.num}
              num={svc.num}
              name={svc.name}
              tag={svc.tag}
              desc={svc.desc}
              bullets={svc.bullets}
              wide={i === 0}
            />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="section-pad" style={{ padding: "112px 64px", borderTop: `1px solid rgba(11,31,59,0.1)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: navy, opacity: 0.3, marginBottom: 20 }}>{dict.how.eyebrow}</p>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(30px, 3.5vw, 48px)", fontWeight: 700, letterSpacing: "-0.024em", lineHeight: 1.1, color: navy, maxWidth: 520 }}>
              {dict.how.heading1}{" "}
              <em style={{ fontFamily: "'EB Garamond', serif", fontWeight: 400, fontStyle: "italic" }}>{dict.how.headingItalic}</em>
            </h2>
          </Reveal>

          <div style={{ marginTop: 72, display: "flex", flexDirection: "column" }}>
            {dict.how.steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  className="step-grid"
                  style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: 48, alignItems: "start", padding: "44px 0", borderTop: `1px solid rgba(11,31,59,0.1)`, ...(i === dict.how.steps.length - 1 ? { borderBottom: `1px solid rgba(11,31,59,0.1)` } : {}) }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: navy, opacity: 0.2, paddingTop: 5 }}>{step.num}</span>
                  <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em", color: navy, lineHeight: 1.25 }}>{step.title}</p>
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: navy, opacity: 0.48 }}>{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="section-pad" style={{ background: navy, padding: "112px 64px" }}>
        <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, maxWidth: 1200, margin: "0 auto", alignItems: "center" }}>
          <Reveal>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>{dict.about.eyebrow}</p>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 700, letterSpacing: "-0.022em", lineHeight: 1.1, color: white, marginBottom: 24 }}>
              {dict.about.heading1}{" "}
              <em style={{ fontFamily: "'EB Garamond', serif", fontWeight: 400, fontStyle: "italic", color: "rgba(255,255,255,0.65)" }}>{dict.about.headingItalic}</em>
            </h2>
            <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.8, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>{dict.about.p1}</p>
            <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.8, color: "rgba(255,255,255,0.5)" }}>{dict.about.p2}</p>
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {dict.about.pillars.map((item, i) => (
                <div
                  key={i}
                  style={{ padding: "22px 24px", background: "rgba(255,255,255,0.04)", borderLeft: "2px solid rgba(255,255,255,0.12)", display: "flex", flexDirection: "column", gap: 6, transition: "background 0.2s, border-color 0.2s", cursor: "default" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
                >
                  <p style={{ fontSize: 13, fontWeight: 700, color: white, letterSpacing: "-0.01em" }}>{item.label}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.45)" }}>{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section id="integrations" className="section-pad" style={{ background: "#0d1e35", padding: "80px 64px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", textAlign: "center", marginBottom: 44 }}>
          {dict.integrations.eyebrow}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 900, margin: "0 auto" }}>
          {INTEGRATIONS.map((name) => (
            <span
              key={name}
              style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", padding: "9px 18px", borderRadius: 2, transition: "all 0.2s", cursor: "default" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.45)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contact" className="section-pad" style={{ padding: "140px 64px", textAlign: "center", borderTop: `1px solid rgba(11,31,59,0.1)`, position: "relative", overflow: "hidden" }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/")' }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.82)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 90% at 50% 110%, rgba(11,31,59,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <Reveal>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: navy, opacity: 0.3, marginBottom: 24 }}>{dict.cta.eyebrow}</p>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(36px, 6vw, 78px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.0, color: navy, marginBottom: 28, position: "relative", zIndex: 1 }}>
            {dict.cta.heading1}{" "}
            <em style={{ fontFamily: "'EB Garamond', serif", fontWeight: 400, fontStyle: "italic" }}>{dict.cta.headingItalic}</em>
            <br />
            {dict.cta.heading2}
          </h2>
          <p style={{ fontSize: 17, fontWeight: 300, color: navy, opacity: 0.42, marginBottom: 52, position: "relative", zIndex: 1 }}>{dict.cta.sub}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <Link
              href={`/${lang}/book-demo`}
              style={{ background: navy, color: white, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 44px", height: 54, display: "flex", alignItems: "center", borderRadius: 2, textDecoration: "none", border: `1px solid ${navy}`, transition: "all 0.22s" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = white; el.style.color = navy; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = navy; el.style.color = white; }}
            >
              {dict.cta.ctaDemo}
            </Link>
            <a
              href={`mailto:${dict.nav.email}`}
              style={{ background: "transparent", color: navy, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 32px", height: 54, display: "flex", alignItems: "center", borderRadius: 2, textDecoration: "none", border: `1px solid rgba(11,31,59,0.28)`, transition: "all 0.22s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = navy; (e.currentTarget as HTMLElement).style.background = "rgba(11,31,59,0.04)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(11,31,59,0.28)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {dict.cta.ctaEmail}
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── FLOATING AI CHAT ── */}
      {/* Toggle button */}
      <Button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
          "bg-[#0B1F3B]",
          "hover:scale-110 active:scale-95",
          isChatOpen && "rotate-90"
        )}
        aria-label="Toggle AI Chat"
      >
        {isChatOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Notification badge (shows when chat is closed) */}
      {!isChatOpen && (
        <div className="fixed bottom-[88px] right-6 z-40 animate-bounce">
          <div className="bg-[#0B1F3B] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            AI
          </div>
        </div>
      )}

      {/* AI Chat popup panel */}
      <AIChat
        isExpanded={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* ── FOOTER ── */}
      <footer style={{ background: navy, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="section-pad" style={{ padding: "72px 64px 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 48, maxWidth: 1200, margin: "0 auto" }}>
            {/* Brand column */}
            <div>
              <a href="#" style={{ textDecoration: "none", display: "inline-block", marginBottom: 24 }}>
                <span style={{ display: "inline-flex", alignItems: "baseline", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: "-0.022em", lineHeight: 1 }}>
                  <span style={{ color: white }}>Zen</span>
                  <span style={{ WebkitTextFillColor: "transparent", color: "transparent", WebkitTextStrokeColor: white, WebkitTextStrokeWidth: "1.4px" }}>vor</span>
                </span>
              </a>
              <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.75, color: "rgba(255,255,255,0.4)", maxWidth: 260, marginBottom: 28 }}>
                {dict.footer.desc}
              </p>
              <a href={`mailto:${dict.nav.email}`} style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)", textDecoration: "none", display: "block", marginBottom: 8, transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = white)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
              >
                {dict.nav.email}
              </a>
              <a href="tel:+77085690878" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 8, display: "block", transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = white)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
              >
                +7 (708) 569 08 78
              </a>
              <a href="tel:+77759156613" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)", textDecoration: "none", display: "block", transition: "color 0.2s", marginBottom: 8 }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = white)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
              >
                +7 (775) 915 66 13
              </a>
            </div>

            {/* Link columns */}
            {Object.entries(dict.footer.columns).map(([heading, links]) => (
              <div key={heading}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 20 }}>{heading}</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {(links as string[]).map((link) => (
                    <li key={link}>
                      <a href="#" style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.2s", display: "block" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = white)}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "20px 64px" }} className="section-pad">
          <div className="footer-bottom" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1200, margin: "0 auto", flexWrap: "wrap", gap: 16 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em" }}>
              © {new Date().getFullYear()} Zenvor. {dict.footer.copyright}
            </p>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {(dict.footer.legal as string[]).map((l) => (
                <a key={l} href="#" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)")}
                >
                  {l}
                </a>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em" }}>{dict.footer.tagline}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
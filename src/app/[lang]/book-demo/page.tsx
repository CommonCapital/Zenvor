"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useBookDemo } from "~/hooks/useBookDemo";

// ── Types ──────────────────────────────────────────────────────────────────────
type ServiceOption = { value: string; label: string; desc: string };

// ── Content Dictionaries (EN / RU) ─────────────────────────────────────────────
const CONTENT = {
  en: {
    nav: { utilityBar: "AI Automation Platform", email: "nursanomarov616@gmail.com", back: "← Back" },
    hero: {
      eyebrow: "Schedule a Demo",
      title1: "See Zenvor in action.",
      titleItalic: "Built for your business.",
      sub: "In 30 minutes we'll walk you through a live demo tailored to your specific workflows, team size, and communication channels — no slides, no fluff.",
      stats: [
        { num: "30", unit: "min", label: "Live walkthrough" },
        { num: "1", unit: "day", label: "Response time" },
        { num: "9", unit: "AI", label: "Assistants shown" },
        { num: "0", unit: "cost", label: "No commitment" },
      ],
    },
    form: {
      section1: {
        step: "01", title: "Your contact details", fullName: "Full Name", email: "Work Email",
        phone: "Phone Number", phoneHint: "Optional — speeds up scheduling",
        jobTitle: "Job Title", jobTitleHint: "Optional",
        companyName: "Company Name", companyNameHint: "Optional",
      },
      section2: { step: "02", title: "What are you interested in?", sub: "Optional — helps us tailor the demo to what matters most to you." },
      section3: { step: "03", title: "Anything else?", message: "Message", messageHint: "Optional — your situation, team size, current tools, or specific questions", referral: "How did you hear about Zenvor?", referralHint: "Optional" },
      submit: "Request Demo", submitting: "Sending your request…", noCommitment: "No commitment required. We'll reach out within 1 business day.",
    },
    sidebar: {
      nextTitle: "What happens next",
      steps: [
        { step: "1", title: "We review your request", body: "Within 1 business day, a Zenvor team member reads your submission." },
        { step: "2", title: "We reach out", body: "We contact you by email (or phone if provided) to confirm a time." },
        { step: "3", title: "30-min live demo", body: "We walk you through a session built around your use case." },
        { step: "4", title: "Custom proposal", body: "If it's a fit, we send a tailored scope and timeline within 48 hours." },
      ],
      directTitle: "Prefer to write directly?",
      directEmail: "nursanomarov616@gmail.com",
      directSub: "We respond to every email within 1 business day.",
      previewTitle: "What you'll see",
      previewItems: ["Live AI conversation across channels", "CRM & database integration in action", "Automated lead qualification flow", "Scheduling assistant walkthrough", "Your questions answered live"],
    },
    success: { title: "Request Received", sub1: "A member of the Zenvor team will reach out within", sub2: "1 business day", sub3: "to confirm your demo slot.", refLabel: "REF:", backHome: "Back to Home", another: "Submit Another" },
    footer: { copyright: "All rights reserved.", privacy: "Privacy Policy", terms: "Terms" },
    serviceOptions: [
      { value: "full_platform", label: "Full Platform", desc: "All 9 AI assistants" },
      { value: "communication_ai", label: "Communication AI", desc: "Omnichannel messaging" },
      { value: "sales_ai", label: "Sales AI", desc: "Lead qualification" },
      { value: "support_ai", label: "Support AI", desc: "Customer service" },
      { value: "knowledge_ai", label: "Knowledge AI", desc: "Document intelligence" },
      { value: "scheduling_ai", label: "Scheduling AI", desc: "Calendar automation" },
      { value: "data_ai", label: "Data AI", desc: "CRM & DB integration" },
      { value: "automation_ai", label: "Automation AI", desc: "Workflow automation" },
      { value: "internal_assistant_ai", label: "Internal Assistant", desc: "Team productivity" },
      { value: "decision_support_ai", label: "Decision Support", desc: "Analytics & insights" },
      { value: "not_sure", label: "Not Sure Yet", desc: "Help me find the right fit" },
    ] as ServiceOption[],
    referralOptions: ["Search engine (Google, Bing…)", "LinkedIn", "Word of mouth / referral", "Social media", "Conference or event", "Blog or article", "Other"],
  },
  ru: {
    nav: { utilityBar: "Платформа автоматизации на базе ИИ", email: "nursanomarov616@gmail.com", back: "← Назад" },
    hero: {
      eyebrow: "Записаться на демо",
      title1: "Увидьте Zenvor в действии.",
      titleItalic: "Создан для вашего бизнеса.",
      sub: "За 30 минут мы проведём живое демо, адаптированное под ваши рабочие процессы, размер команды и каналы коммуникации — без слайдов и лишней информации.",
      stats: [
        { num: "30", unit: "мин", label: "Живая демонстрация" },
        { num: "1", unit: "день", label: "Время ответа" },
        { num: "9", unit: "ИИ", label: "Показано ассистентов" },
        { num: "0", unit: "руб", label: "Без обязательств" },
      ],
    },
    form: {
      section1: {
        step: "01", title: "Ваши контактные данные", fullName: "Полное имя", email: "Рабочий email",
        phone: "Номер телефона", phoneHint: "Необязательно — ускоряет планирование",
        jobTitle: "Должность", jobTitleHint: "Необязательно",
        companyName: "Название компании", companyNameHint: "Необязательно",
      },
      section2: { step: "02", title: "Что вас интересует?", sub: "Необязательно — помогает нам адаптировать демо под то, что важно именно для вас." },
      section3: { step: "03", title: "Что-то ещё?", message: "Сообщение", messageHint: "Необязательно — ваша ситуация, размер команды, текущие инструменты или конкретные вопросы", referral: "Как вы узнали о Zenvor?", referralHint: "Необязательно" },
      submit: "Запросить демо", submitting: "Отправка запроса…", noCommitment: "Обязательств нет. Мы свяжемся в течение 1 рабочего дня.",
    },
    sidebar: {
      nextTitle: "Что будет дальше",
      steps: [
        { step: "1", title: "Мы изучаем ваш запрос", body: "В течение 1 рабочего дня сотрудник Zenvor изучит вашу заявку." },
        { step: "2", title: "Мы связываемся", body: "Мы свяжемся с вами по email (или телефону, если указан) для подтверждения времени." },
        { step: "3", title: "30-минутное живое демо", body: "Мы проведём сессию, построенную вокруг вашего сценария использования." },
        { step: "4", title: "Индивидуальное предложение", body: "Если это подходит, мы отправим адаптированный объём работ и сроки в течение 48 часов." },
      ],
      directTitle: "Предпочитаете написать напрямую?",
      directEmail: "nursanomarov616@gmail.com",
      directSub: "Мы отвечаем на каждое письмо в течение 1 рабочего дня.",
      previewTitle: "Что вы увидите",
      previewItems: ["Живой диалог с ИИ по всем каналам", "Интеграция с CRM и базами данных в действии", "Автоматизированный процесс квалификации лидов", "Демонстрация ассистента планирования", "Ответы на ваши вопросы в реальном времени"],
    },
    success: { title: "Запрос получен", sub1: "Сотрудник команды Zenvor свяжется с вами в течение", sub2: "1 рабочего дня", sub3: "для подтверждения времени демо.", refLabel: "REF:", backHome: "На главную", another: "Отправить ещё один" },
    footer: { copyright: "Все права защищены.", privacy: "Политика конфиденциальности", terms: "Условия использования" },
    serviceOptions: [
      { value: "full_platform", label: "Полная платформа", desc: "Все 9 ИИ-ассистентов" },
      { value: "communication_ai", label: "Коммуникационный ИИ", desc: "Мультиканальные сообщения" },
      { value: "sales_ai", label: "ИИ продаж", desc: "Квалификация лидов" },
      { value: "support_ai", label: "ИИ поддержки", desc: "Обслуживание клиентов" },
      { value: "knowledge_ai", label: "ИИ знаний", desc: "Интеллект документов" },
      { value: "scheduling_ai", label: "ИИ планирования", desc: "Автоматизация календаря" },
      { value: "data_ai", label: "ИИ данных", desc: "Интеграция с CRM и БД" },
      { value: "automation_ai", label: "ИИ автоматизации", desc: "Автоматизация рабочих процессов" },
      { value: "internal_assistant_ai", label: "Внутренний ассистент", desc: "Продуктивность команды" },
      { value: "decision_support_ai", label: "Поддержка решений", desc: "Аналитика и инсайты" },
      { value: "not_sure", label: "Пока не уверен", desc: "Помогите подобрать подходящее решение" },
    ] as ServiceOption[],
    referralOptions: ["Поисковая система (Google, Bing…)", "LinkedIn", "Рекомендация / сарафанное радио", "Социальные сети", "Конференция или мероприятие", "Блог или статья", "Другое"],
  },
};

// ── Constants ─────────────────────────────────────────────────────────────────
const SERVICE_OPTIONS = CONTENT.en.serviceOptions;
const REFERRAL_OPTIONS = CONTENT.en.referralOptions;

// ── Design tokens ─────────────────────────────────────────────────────────────
const N = "#0B1F3B", W = "#FFFFFF", E = "#0F766E";
const NR12 = "rgba(11,31,59,0.12)", NR06 = "rgba(11,31,59,0.06)", NR30 = "rgba(11,31,59,0.30)", NR50 = "rgba(11,31,59,0.50)";

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400, color: N,
  background: W, border: `1px solid ${NR30}`, borderRadius: 2, padding: "13px 16px",
  outline: "none", transition: "border-color 0.18s, box-shadow 0.18s", appearance: "none" as const,
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
  textTransform: "uppercase" as const, color: N, opacity: 0.45, marginBottom: 8,
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label}{required && <span style={{ color: E, marginLeft: 4 }}>*</span>}</label>
      {children}
      {hint && !error && <span style={{ fontSize: 12, color: N, opacity: 0.38, marginTop: 6 }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: "#C0392B", marginTop: 6 }}>{error}</span>}
    </div>
  );
}

function TextInput({ name, value, onChange, placeholder, type = "text", hasError }: { name: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hasError?: boolean }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} name={name} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputStyle, borderColor: hasError ? "#C0392B" : focused ? N : NR30, boxShadow: focused ? `0 0 0 3px ${NR06}` : "none" }}
    />
  );
}

function TextArea({ name, value, onChange, placeholder, rows = 4 }: { name: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea name={name} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputStyle, resize: "vertical", borderColor: focused ? N : NR30, boxShadow: focused ? `0 0 0 3px ${NR06}` : "none", lineHeight: 1.65 }}
    />
  );
}

function SelectInput({ name, value, onChange, options, placeholder }: { name: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inputStyle, cursor: "pointer", borderColor: focused ? N : NR30, boxShadow: focused ? `0 0 0 3px ${NR06}` : "none", paddingRight: 40 }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${NR50}` }} />
    </div>
  );
}

function ServiceSelector({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: ServiceOption[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button key={opt.value} type="button" onClick={() => onChange(selected ? "" : opt.value)}
            style={{ background: selected ? N : W, border: `1px solid ${selected ? N : NR30}`, borderRadius: 2, padding: "12px 14px", textAlign: "left", cursor: "pointer", transition: "all 0.18s", display: "flex", flexDirection: "column", gap: 3 }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "-0.01em", color: selected ? W : N, fontFamily: "'DM Sans', sans-serif", transition: "color 0.18s" }}>{opt.label}</span>
            <span style={{ fontSize: 11, color: selected ? "rgba(255,255,255,0.55)" : NR50, fontFamily: "'DM Sans', sans-serif", transition: "color 0.18s" }}>{opt.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

function SuccessScreen({ id, onReset, t }: { id: string; onReset: () => void; t: typeof CONTENT.ru }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 40px", gap: 24 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${E}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={E} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: N }}>{t.success.title}</h2>
      <p style={{ fontSize: 16, fontWeight: 300, color: N, opacity: 0.55, maxWidth: 420, lineHeight: 1.7 }}>
        {t.success.sub1} <strong style={{ fontWeight: 600 }}>{t.success.sub2}</strong> {t.success.sub3}
      </p>
      <p style={{ fontFamily: "monospace", fontSize: 11, color: N, opacity: 0.3, letterSpacing: "0.08em", marginTop: 4 }}>{t.success.refLabel} {id.toUpperCase()}</p>
      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" style={{ background: N, color: W, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 28px", height: 44, display: "flex", alignItems: "center", borderRadius: 2, textDecoration: "none", border: `1px solid ${N}` }}>{t.success.backHome}</Link>
        <button onClick={onReset} style={{ background: "transparent", color: N, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 28px", height: 44, display: "flex", alignItems: "center", borderRadius: 2, border: `1px solid ${NR30}`, cursor: "pointer" }}>{t.success.another}</button>
      </div>
    </div>
  );
}

// ── Form state ────────────────────────────────────────────────────────────────
interface FormState { fullName: string; email: string; phone: string; companyName: string; jobTitle: string; serviceInterest: string; message: string; referralSource: string; }
interface FormErrors { fullName?: string; email?: string; phone?: string; }
const EMPTY_FORM: FormState = { fullName: "", email: "", phone: "", companyName: "", jobTitle: "", serviceInterest: "", message: "", referralSource: "" };
type ServiceInterestValue = "communication_ai" | "sales_ai" | "support_ai" | "knowledge_ai" | "scheduling_ai" | "data_ai" | "automation_ai" | "internal_assistant_ai" | "decision_support_ai" | "full_platform" | "not_sure";

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BookDemoPage() {
  // 🔥 SIMPLE i18n: Check if URL contains "ru" (case-insensitive)
  const params = useParams();
  const langParam = (params?.lang as string) || "";
  const isRu = langParam.toLowerCase().includes("ru");
  const t = isRu ? CONTENT.ru : CONTENT.en; // ← Translation object

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLDivElement>(null);
  const { status, errorMessage, submittedId, submit, reset } = useBookDemo();

  const set = useCallback((field: keyof FormState) => (value: string) => setForm((prev) => ({ ...prev, [field]: value })), []);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) next.fullName = isRu ? "Введите полное имя" : "Please enter your full name.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = isRu ? "Введите корректный email" : "Please enter a valid email address.";
    if (form.phone && form.phone.trim().length < 6) next.phone = isRu ? "Введите номер телефона" : "Please enter a valid phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    await submit({ fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined, companyName: form.companyName.trim() || undefined, jobTitle: form.jobTitle.trim() || undefined, serviceInterest: (form.serviceInterest as ServiceInterestValue) || undefined, message: form.message.trim() || undefined, referralSource: form.referralSource || undefined });
  };

  const handleReset = () => { setForm(EMPTY_FORM); setErrors({}); reset(); };
  const isSubmitting = status === "submitting";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,300&family=EB+Garamond:ital,wght@0,400;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'DM Sans',sans-serif;background:#fff;color:#0B1F3B;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        ::selection{background:#0B1F3B;color:#fff}
        input::placeholder,textarea::placeholder{color:rgba(11,31,59,0.28)}
        input,textarea,select{font-family:'DM Sans',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){.page-grid{grid-template-columns:1fr!important}.form-cols{grid-template-columns:1fr!important}.service-grid{grid-template-columns:repeat(2,1fr)!important}.hero-title{font-size:clamp(32px,9vw,56px)!important}.nav-links{display:none!important}.stat-row{flex-wrap:wrap!important}.sidebar{position:static!important}.page-inner{padding:40px 20px 80px!important}.nav-pad{padding:0 20px!important}.form-right{padding-right:0!important}}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${NR12}` }}>
        <div className="nav-pad" style={{ background: N, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 20px", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{t.nav.utilityBar}</span>
          <a href={`mailto:${t.nav.email}`} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{t.nav.email}</a>
        </div>
        <div className="nav-pad" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 64 }}>
          <Link href={`/${langParam || "en"}`} style={{ textDecoration: "none" }}>
            <span style={{ display: "inline-flex", alignItems: "baseline", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: "-0.022em", lineHeight: 1 }}>
              <span style={{ color: N }}>Zen</span><span style={{ WebkitTextFillColor: "transparent", color: "transparent", WebkitTextStrokeColor: N, WebkitTextStrokeWidth: "1.3px" }}>vor</span>
            </span>
          </Link>
          <ul className="nav-links" style={{ display: "flex", gap: 24, listStyle: "none" }}>
            {[["Services", "/#services"], ["How It Works", "/#how"], ["Integrations", "/#integrations"]].map(([label, href]) => (
              <li key={label}><Link href={href!} style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: N, textDecoration: "none", opacity: 0.4 }}>{label}</Link></li>
            ))}
          </ul>
          <Link href={`/${langParam || "en"}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: N, textDecoration: "none", opacity: 0.45 }}>{t.nav.back}</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ background: N, padding: "72px 20px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "64px 64px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: E }} />{t.hero.eyebrow}
          </p>
          <h1 className="hero-title" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(36px,5vw,64px)", fontWeight: 700, letterSpacing: "-0.028em", lineHeight: 1.08, color: W, marginBottom: 20 }}>
            {t.hero.title1} <em style={{ fontFamily: "'EB Garamond', serif", fontWeight: 400, fontStyle: "italic", color: "rgba(255,255,255,0.6)" }}>{t.hero.titleItalic}</em>
          </h1>
          <p style={{ fontSize: 16, fontWeight: 300, color: "rgba(255,255,255,0.5)", maxWidth: 560, lineHeight: 1.75, marginBottom: 48 }}>{t.hero.sub}</p>
          <div className="stat-row" style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            {(t.hero.stats || []).map((s, i) => (
              <div key={i} style={{ padding: "20px 24px", borderLeft: i === 0 ? "1px solid rgba(255,255,255,0.1)" : "none", borderRight: "1px solid rgba(255,255,255,0.1)", flex: "1 1 100px" }}>
                <span style={{ display: "block", fontSize: 26, fontWeight: 700, color: W, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.num}<span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4, opacity: 0.5 }}>{s.unit}</span></span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6, display: "block", letterSpacing: "0.06em" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div ref={formRef} className="page-grid page-inner" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 0, maxWidth: 1200, margin: "0 auto", padding: "64px 20px 120px", alignItems: "start" }}>
        {/* ── FORM ── */}
        <div className="form-right" style={{ paddingRight: 24 }}>
          {status === "success" && submittedId ? (
            <SuccessScreen id={submittedId} onReset={handleReset} t={t} />
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {status === "error" && errorMessage && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 2, padding: "16px 20px", marginBottom: 32, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <p style={{ fontSize: 14, color: "#991B1B", lineHeight: 1.5 }}>{errorMessage}</p>
                </div>
              )}
              {/* Section 01 */}
              <section style={{ marginBottom: 48 }}>
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 8 }}>{t.form.section1.step}</p>
                  <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em", color: N }}>{t.form.section1.title}</h2>
                </div>
                <div className="form-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label={t.form.section1.fullName} required error={errors.fullName}><TextInput name="fullName" value={form.fullName} onChange={set("fullName")} placeholder={isRu ? "Иван Иванов" : "Jane Smith"} hasError={!!errors.fullName} /></Field>
                  <Field label={t.form.section1.email} required error={errors.email}><TextInput name="email" type="text" value={form.email} onChange={set("email")} placeholder="jane@company.com" hasError={!!errors.email} /></Field>
                  <Field label={t.form.section1.phone} error={errors.phone} hint={t.form.section1.phoneHint}><TextInput name="phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+7 (999) 000-00-00" hasError={!!errors.phone} /></Field>
                  <Field label={t.form.section1.jobTitle} hint={t.form.section1.jobTitleHint}><TextInput name="jobTitle" value={form.jobTitle} onChange={set("jobTitle")} placeholder={isRu ? "Руководитель отдела" : "Head of Operations"} /></Field>
                  <div style={{ gridColumn: "1 / -1" }}><Field label={t.form.section1.companyName} hint={t.form.section1.companyNameHint}><TextInput name="companyName" value={form.companyName} onChange={set("companyName")} placeholder="Acme Corp" /></Field></div>
                </div>
              </section>
              <div style={{ height: 1, background: NR12, marginBottom: 48 }} />
              {/* Section 02 */}
              <section style={{ marginBottom: 48 }}>
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 8 }}>{t.form.section2.step}</p>
                  <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em", color: N }}>{t.form.section2.title}</h2>
                  <p style={{ fontSize: 14, fontWeight: 300, color: N, opacity: 0.45, marginTop: 8 }}>{t.form.section2.sub}</p>
                </div>
                <ServiceSelector value={form.serviceInterest} onChange={set("serviceInterest")} options={t.serviceOptions} />
              </section>
              <div style={{ height: 1, background: NR12, marginBottom: 48 }} />
              {/* Section 03 */}
              <section style={{ marginBottom: 48 }}>
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 8 }}>{t.form.section3.step}</p>
                  <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em", color: N }}>{t.form.section3.title}</h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label={t.form.section3.message} hint={t.form.section3.messageHint}><TextArea name="message" value={form.message} onChange={set("message")} placeholder={isRu ? "Мы — команда из 25 человек, обрабатываем ~500 сообщений в день…" : "We're a team of 25 handling ~500 messages per day…"} rows={5} /></Field>
                  <Field label={t.form.section3.referral} hint={t.form.section3.referralHint}><SelectInput name="referralSource" value={form.referralSource} onChange={set("referralSource")} options={t.referralOptions} placeholder={isRu ? "Выберите вариант" : "Select an option"} /></Field>
                </div>
              </section>
              {/* Submit */}
              <button type="submit" disabled={isSubmitting} style={{ width: "100%", height: 56, background: isSubmitting ? NR30 : N, color: W, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${isSubmitting ? NR30 : N}`, borderRadius: 2, cursor: isSubmitting ? "not-allowed" : "pointer", transition: "all 0.22s", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}
                onMouseEnter={(e) => { if (!isSubmitting) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = N; } }}
                onMouseLeave={(e) => { if (!isSubmitting) { (e.currentTarget as HTMLElement).style.background = N; (e.currentTarget as HTMLElement).style.color = W; } }}
              >
                {isSubmitting ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> {t.form.submitting}</> : t.form.submit}
              </button>
              <p style={{ textAlign: "center", fontSize: 12, color: N, opacity: 0.3, marginTop: 16 }}>{t.form.noCommitment}</p>
            </form>
          )}
        </div>
        {/* ── SIDEBAR ── */}
        <div className="sidebar" style={{ position: "sticky", top: 112, display: "flex", flexDirection: "column", gap: 1, background: NR12, border: `1px solid ${NR12}`, alignSelf: "start" }}>
          <div style={{ background: W, padding: "24px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 16 }}>{t.sidebar.nextTitle}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(t.sidebar.steps || []).map((item) => (
                <div key={item.step} style={{ display: "flex", gap: 12 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", border: `1px solid ${NR30}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: N, opacity: 0.5, flexShrink: 0, marginTop: 1 }}>{item.step}</span>
                  <div><p style={{ fontSize: 13, fontWeight: 600, color: N, marginBottom: 2 }}>{item.title}</p><p style={{ fontSize: 12, lineHeight: 1.5, color: N, opacity: 0.45 }}>{item.body}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: W, padding: "20px", borderTop: `1px solid ${NR12}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 12 }}>{t.sidebar.directTitle}</p>
            <a href={`mailto:${t.sidebar.directEmail}`} style={{ fontSize: 13, fontWeight: 600, color: N, textDecoration: "none", display: "block", marginBottom: 4 }}>{t.sidebar.directEmail}</a>
            <p style={{ fontSize: 11, color: N, opacity: 0.4, lineHeight: 1.5 }}>{t.sidebar.directSub}</p>
          </div>
          <div style={{ background: N, padding: "20px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>{t.sidebar.previewTitle}</p>
            {(t.sidebar.previewItems || []).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: E, display: "inline-block", flexShrink: 0, marginTop: 5 }} /><p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: N, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "baseline", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}><span style={{ color: W }}>Zen</span><span style={{ WebkitTextFillColor: "transparent", WebkitTextStrokeColor: W, WebkitTextStrokeWidth: "1.2px" }}>vor</span></span>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em" }}>© {new Date().getFullYear()} Zenvor. {t.footer.copyright}</p>
          <div style={{ display: "flex", gap: 20 }}><Link href="#" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>{t.footer.privacy}</Link><Link href="#" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>{t.footer.terms}</Link></div>
        </div>
      </footer>
    </>
  );
}
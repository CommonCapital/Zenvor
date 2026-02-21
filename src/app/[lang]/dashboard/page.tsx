"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetStarted } from "~/hooks/useGetStarted";

// ── Types ──────────────────────────────────────────────────────────────────────
type CompanySize = "1_10" | "11_50" | "51_200" | "201_plus";
type PainPoint =
  | "too_many_messages" | "manual_scheduling" | "data_entry"
  | "lead_qualification" | "internal_knowledge" | "workflow_automation" | "other";
type BudgetRange = "under_500" | "500_1500" | "1500_5000" | "5000_plus" | "not_sure";

interface FormState {
  fullName: string; email: string; companyName: string; companySize: CompanySize | "";
  currentTools: string[];
  painPoint: PainPoint | ""; painPointOther: string; budget: BudgetRange | ""; additionalContext: string;
}
interface FormErrors { fullName?: string; email?: string; companyName?: string; companySize?: string; painPoint?: string; }

// ── Content Dictionaries (EN / RU) ─────────────────────────────────────────────
const CONTENT = {
  en: {
    nav: { utilityBar: "AI Automation Platform", email: "nursanomarov616@gmail.com", bookDemo: "Book Demo", back: "← Back" },
    hero: {
      eyebrow: "Get Started",
      title1: "Tell us about your business.",
      titleItalic: "We'll do the rest.",
      sub: "3 quick steps — then we'll prepare a demo built around your exact tools, team, and challenges. No generic walkthroughs.",
    },
    step1: {
      step: "01", title: "Tell us about yourself", sub: "We'll use this to tailor your demo session.",
      fullName: "Full Name", email: "Work Email", companyName: "Company Name", teamSize: "Team Size",
      placeholders: { name: "Jane Smith", email: "jane@company.com", company: "Acme Corp" },
    },
    companySizes: [
      { value: "1_10" as CompanySize, label: "1–10", sub: "Startup" },
      { value: "11_50" as CompanySize, label: "11–50", sub: "Growing" },
      { value: "51_200" as CompanySize, label: "51–200", sub: "Scale-up" },
      { value: "201_plus" as CompanySize, label: "201+", sub: "Enterprise" },
    ],
    step2: {
      step: "02", title: "What tools do you use today?",
      sub: "Select everything relevant — this helps us show you exactly how we'd connect to your stack.",
      optional: "Optional", selected: "selected",
    },
    toolGroups: [
      { group: "Messaging", tools: ["WhatsApp", "Telegram", "Instagram DMs", "Facebook Messenger", "LinkedIn DMs", "Email"] },
      { group: "CRM", tools: ["HubSpot", "Salesforce", "Bitrix24", "amoCRM", "Pipedrive", "No CRM yet"] },
      { group: "Calendar & Scheduling", tools: ["Google Calendar", "Outlook / Office 365", "Calendly", "No tool yet"] },
      { group: "Automation & Data", tools: ["n8n", "Make (Integromat)", "Zapier", "Airtable", "Notion", "Custom DB / SQL"] },
    ],
    step3: {
      step: "03", title: "What's your biggest challenge?", sub: "We'll structure the demo around solving this first.",
      painPoint: "Main Pain Point", budget: "Monthly Budget Range", budgetHint: "Optional — helps us scope the right solution",
      other: "Anything else?", otherHint: "Optional — specific tools, timelines, or questions for the demo",
      otherPlaceholder: "We're planning to expand to 3 new markets this quarter and need automation before then...",
    },
    painPoints: [
      { value: "too_many_messages" as PainPoint, label: "Drowning in messages", desc: "Can't keep up with inbound volume" },
      { value: "manual_scheduling" as PainPoint, label: "Manual scheduling hell", desc: "Too much time coordinating calls" },
      { value: "data_entry" as PainPoint, label: "Repetitive data entry", desc: "Moving data between systems manually" },
      { value: "lead_qualification" as PainPoint, label: "Unqualified leads", desc: "Team talks to people who won't buy" },
      { value: "internal_knowledge" as PainPoint, label: "Lost internal knowledge", desc: "Team can't find answers fast enough" },
      { value: "workflow_automation" as PainPoint, label: "Broken workflows", desc: "Processes that need human glue" },
      { value: "other" as PainPoint, label: "Something else", desc: "Tell us in your own words" },
    ],
    budgetOptions: [
      { value: "under_500" as BudgetRange, label: "Under $500 / mo" },
      { value: "500_1500" as BudgetRange, label: "$500 – $1,500 / mo" },
      { value: "1500_5000" as BudgetRange, label: "$1,500 – $5,000 / mo" },
      { value: "5000_plus" as BudgetRange, label: "$5,000+ / mo" },
      { value: "not_sure" as BudgetRange, label: "Not sure yet" },
    ],
    buttons: { continue: "Continue →", back: "← Back", submit: "Submit & Get My Demo →", submitting: "Submitting…", noCommitment: "No commitment. We'll reach out within 1 business day." },
    sidebar: {
      whatYouGet: "What you get",
      items: [
        { icon: "🎯", title: "Tailored demo", body: "Built around your exact stack and challenge" },
        { icon: "⚡", title: "Live workflow", body: "We'll show a real automation for your use case" },
        { icon: "📐", title: "Custom scope", body: "Specific plan and timeline for your company" },
        { icon: "🔒", title: "No pressure", body: "Zero obligation, just clarity on what's possible" },
      ],
      yourAnswers: "Your answers so far", company: "Company", stack: "Stack", challenge: "Challenge",
      directTitle: "Prefer to just talk?", directEmail: "nursanomarov616@gmail.com", directSub: "We reply within 1 business day.",
    },
    success: {
      title: (name: string) => `You're on the list, ${name}.`,
      sub1: "We've received your details and will prepare a demo built around your exact stack and pain points. Expect a message from us",
      sub2: "within 1 business day.",
      refLabel: "REF:", backHome: "Back to Home", bookDemo: "Book Demo Instead",
    },
    footer: { copyright: "All rights reserved.", privacy: "Privacy Policy", terms: "Terms" },
    errors: { name: "Please enter your full name.", email: "Please enter a valid email address.", company: "Please enter your company name.", size: "Please select your team size.", pain: "Please select your main challenge." },
  },
  ru: {
    nav: { utilityBar: "Платформа автоматизации на базе ИИ", email: "nursanomarov616@gmail.com", bookDemo: "Демо", back: "← Назад" },
    hero: {
      eyebrow: "Начать",
      title1: "Расскажите о вашем бизнесе.",
      titleItalic: "Мы сделаем всё остальное.",
      sub: "3 простых шага — и мы подготовим демо, адаптированное под ваши инструменты, команду и задачи. Никаких шаблонных презентаций.",
    },
    step1: {
      step: "01", title: "Расскажите о себе", sub: "Мы используем это, чтобы адаптировать демо под вас.",
      fullName: "Полное имя", email: "Рабочий email", companyName: "Название компании", teamSize: "Размер команды",
      placeholders: { name: "Иван Иванов", email: "ivan@company.ru", company: "ООО «Пример»" },
    },
    companySizes: [
      { value: "1_10" as CompanySize, label: "1–10", sub: "Стартап" },
      { value: "11_50" as CompanySize, label: "11–50", sub: "Растущий" },
      { value: "51_200" as CompanySize, label: "51–200", sub: "Масштабируемый" },
      { value: "201_plus" as CompanySize, label: "201+", sub: "Корпорация" },
    ],
    step2: {
      step: "02", title: "Какие инструменты вы используете?",
      sub: "Отметьте всё подходящее — это поможет показать, как мы интегрируемся с вашим стеком.",
      optional: "Необязательно", selected: "выбрано",
    },
    toolGroups: [
      { group: "Мессенджеры", tools: ["WhatsApp", "Telegram", "Instagram DM", "Facebook Messenger", "LinkedIn DM", "Email"] },
      { group: "CRM", tools: ["HubSpot", "Salesforce", "Bitrix24", "amoCRM", "Pipedrive", "Пока нет CRM"] },
      { group: "Календарь и планирование", tools: ["Google Calendar", "Outlook / Office 365", "Calendly", "Пока нет инструмента"] },
      { group: "Автоматизация и данные", tools: ["n8n", "Make (Integromat)", "Zapier", "Airtable", "Notion", "Своя БД / SQL"] },
    ],
    step3: {
      step: "03", title: "Какая ваша главная проблема?", sub: "Мы построим демо вокруг решения именно этой задачи.",
      painPoint: "Основная проблема", budget: "Ежемесячный бюджет", budgetHint: "Необязательно — помогает подобрать подходящее решение",
      other: "Что-то ещё?", otherHint: "Необязательно — конкретные инструменты, сроки или вопросы для демо",
      otherPlaceholder: "Мы планируем выйти на 3 новых рынка в этом квартале и нуждаемся в автоматизации до этого...",
    },
    painPoints: [
      { value: "too_many_messages" as PainPoint, label: "Не справляемся с сообщениями", desc: "Не успеваем обрабатывать входящие" },
      { value: "manual_scheduling" as PainPoint, label: "Ручное планирование встреч", desc: "Тратим слишком много времени на координацию" },
      { value: "data_entry" as PainPoint, label: "Рутинный ввод данных", desc: "Переносим данные между системами вручную" },
      { value: "lead_qualification" as PainPoint, label: "Неквалифицированные лиды", desc: "Команда общается с теми, кто не купит" },
      { value: "internal_knowledge" as PainPoint, label: "Потеря знаний внутри команды", desc: "Сотрудники не могут быстро найти ответы" },
      { value: "workflow_automation" as PainPoint, label: "Сломанные процессы", desc: "Рабочие потоки требуют ручного вмешательства" },
      { value: "other" as PainPoint, label: "Что-то другое", desc: "Опишите своими словами" },
    ],
    budgetOptions: [
      { value: "under_500" as BudgetRange, label: "До $500 / мес" },
      { value: "500_1500" as BudgetRange, label: "$500 – $1,500 / мес" },
      { value: "1500_5000" as BudgetRange, label: "$1,500 – $5,000 / мес" },
      { value: "5000_plus" as BudgetRange, label: "$5,000+ / мес" },
      { value: "not_sure" as BudgetRange, label: "Пока не уверен" },
    ],
    buttons: { continue: "Далее →", back: "← Назад", submit: "Отправить и получить демо →", submitting: "Отправка…", noCommitment: "Обязательств нет. Мы свяжемся в течение 1 рабочего дня." },
    sidebar: {
      whatYouGet: "Что вы получите",
      items: [
        { icon: "🎯", title: "Персонализированное демо", body: "Построено вокруг вашего стека и задачи" },
        { icon: "⚡", title: "Живой рабочий процесс", body: "Покажем реальную автоматизацию для вашего случая" },
        { icon: "📐", title: "Индивидуальный план", body: "Конкретный объём работ и сроки для вашей компании" },
        { icon: "🔒", title: "Без давления", body: "Никаких обязательств, только ясность о возможностях" },
      ],
      yourAnswers: "Ваши ответы", company: "Компания", stack: "Стек", challenge: "Проблема",
      directTitle: "Предпочитаете просто поговорить?", directEmail: "nursanomarov616@gmail.com", directSub: "Отвечаем в течение 1 рабочего дня.",
    },
    success: {
      title: (name: string) => `Вы в списке, ${name}.`,
      sub1: "Мы получили ваши данные и подготовим демо, адаптированное под ваш стек и задачи. Ожидайте сообщение от нас",
      sub2: "в течение 1 рабочего дня.",
      refLabel: "REF:", backHome: "На главную", bookDemo: "Записаться на демо",
    },
    footer: { copyright: "Все права защищены.", privacy: "Политика конфиденциальности", terms: "Условия использования" },
    errors: { name: "Введите полное имя.", email: "Введите корректный email.", company: "Введите название компании.", size: "Выберите размер команды.", pain: "Выберите основную проблему." },
  },
};

// ── Design tokens ─────────────────────────────────────────────────────────────
const N = "#0B1F3B", W = "#FFFFFF", E = "#0F766E";
const NR06 = "rgba(11,31,59,0.06)", NR12 = "rgba(11,31,59,0.12)", NR30 = "rgba(11,31,59,0.30)", NR50 = "rgba(11,31,59,0.50)";
const inputBase: React.CSSProperties = {
  width: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400, color: N,
  background: W, border: `1px solid ${NR30}`, borderRadius: 2, padding: "13px 16px",
  outline: "none", transition: "border-color 0.18s, box-shadow 0.18s",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
  textTransform: "uppercase", color: N, opacity: 0.45, marginBottom: 8,
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
      style={{ ...inputBase, borderColor: hasError ? "#C0392B" : focused ? N : NR30, boxShadow: focused ? `0 0 0 3px ${NR06}` : "none" }}
    />
  );
}

function TextArea({ name, value, onChange, placeholder, rows = 4 }: { name: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea name={name} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputBase, resize: "vertical", borderColor: focused ? N : NR30, boxShadow: focused ? `0 0 0 3px ${NR06}` : "none", lineHeight: 1.65 }}
    />
  );
}

function StepIndicator({ current, total, t }: { current: number; total: number; t: typeof CONTENT.en }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 48 }}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1; const done = step < current; const active = step === current;
        return (
          <div key={step} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: active ? N : done ? E : "transparent", border: `1px solid ${active ? N : done ? E : NR30}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", flexShrink: 0 }}>
              {done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={W} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg> : <span style={{ fontSize: 11, fontWeight: 700, color: active ? W : NR50, fontFamily: "'DM Sans', sans-serif" }}>{step}</span>}
            </div>
            {step < total && <div style={{ width: 48, height: 1, background: done ? E : NR12, transition: "background 0.3s" }} />}
          </div>
        );
      })}
      <span style={{ marginLeft: 16, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: N, opacity: 0.35, fontFamily: "'DM Sans', sans-serif" }}>
        Step {current} of {total}
      </span>
    </div>
  );
}

// ── Step 1: Contact ────────────────────────────────────────────────────────────
function Step1({ form, errors, set, t }: { form: FormState; errors: FormErrors; set: (field: keyof FormState) => (value: string) => void; t: typeof CONTENT.en }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 8 }}>{t.step1.step}</p>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: N, marginBottom: 8 }}>{t.step1.title}</h2>
        <p style={{ fontSize: 14, fontWeight: 300, color: N, opacity: 0.45, lineHeight: 1.7 }}>{t.step1.sub}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="form-cols">
        <Field label={t.step1.fullName} required error={errors.fullName}><TextInput name="fullName" value={form.fullName} onChange={set("fullName")} placeholder={t.step1.placeholders.name} hasError={!!errors.fullName} /></Field>
        <Field label={t.step1.email} required error={errors.email}><TextInput name="email" value={form.email} onChange={set("email")} placeholder={t.step1.placeholders.email} hasError={!!errors.email} /></Field>
        <Field label={t.step1.companyName} required error={errors.companyName}><TextInput name="companyName" value={form.companyName} onChange={set("companyName")} placeholder={t.step1.placeholders.company} hasError={!!errors.companyName} /></Field>
      </div>
      <Field label={t.step1.teamSize} required error={errors.companySize}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }} className="size-grid">
          {t.companySizes.map((s) => {
            const selected = form.companySize === s.value;
            return (
              <button key={s.value} type="button" onClick={() => set("companySize")(s.value)}
                style={{ background: selected ? N : W, border: `1px solid ${selected ? N : NR30}`, borderRadius: 2, padding: "16px 12px", cursor: "pointer", transition: "all 0.18s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: selected ? W : N, fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em", transition: "color 0.18s" }}>{s.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: selected ? "rgba(255,255,255,0.5)" : NR50, transition: "color 0.18s" }}>{s.sub}</span>
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

// ── Step 2: Current Stack ──────────────────────────────────────────────────────
function Step2({ form, toggleTool, t }: { form: FormState; toggleTool: (tool: string) => void; t: typeof CONTENT.en }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 8 }}>{t.step2.step}</p>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: N, marginBottom: 8 }}>{t.step2.title}</h2>
        <p style={{ fontSize: 14, fontWeight: 300, color: N, opacity: 0.45, lineHeight: 1.7 }}>
          {t.step2.sub} <span style={{ display: "inline-block", marginLeft: 6, fontSize: 12, opacity: 0.6 }}>{t.step2.optional}</span>
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {t.toolGroups.map((group) => (
          <div key={group.group}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: N, opacity: 0.35, marginBottom: 12 }}>{group.group}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {group.tools.map((tool) => {
                const selected = form.currentTools.includes(tool);
                return (
                  <button key={tool} type="button" onClick={() => toggleTool(tool)}
                    style={{ background: selected ? N : W, border: `1px solid ${selected ? N : NR30}`, borderRadius: 2, padding: "9px 16px", cursor: "pointer", transition: "all 0.18s", display: "flex", alignItems: "center", gap: 8 }}>
                    {selected && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={W} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    <span style={{ fontSize: 13, fontWeight: 600, color: selected ? W : N, fontFamily: "'DM Sans', sans-serif", transition: "color 0.18s" }}>{tool}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {form.currentTools.length > 0 && (
        <div style={{ padding: "14px 18px", background: NR06, borderLeft: `2px solid ${E}`, borderRadius: 2 }}>
          <p style={{ fontSize: 12, color: N, opacity: 0.6 }}>
            <span style={{ fontWeight: 700, color: N, opacity: 1 }}>{form.currentTools.length} {t.step2.selected}:</span> {form.currentTools.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Pain + Budget ──────────────────────────────────────────────────────
function Step3({ form, errors, set, t }: { form: FormState; errors: FormErrors; set: (field: keyof FormState) => (value: string) => void; t: typeof CONTENT.en }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 8 }}>{t.step3.step}</p>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: N, marginBottom: 8 }}>{t.step3.title}</h2>
        <p style={{ fontSize: 14, fontWeight: 300, color: N, opacity: 0.45, lineHeight: 1.7 }}>{t.step3.sub}</p>
      </div>
      <Field label={t.step3.painPoint} required error={errors.painPoint}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="pain-grid">
          {t.painPoints.map((p) => {
            const selected = form.painPoint === p.value;
            return (
              <button key={p.value} type="button" onClick={() => set("painPoint")(p.value)}
                style={{ background: selected ? N : W, border: `1px solid ${selected ? N : NR30}`, borderRadius: 2, padding: "14px 16px", cursor: "pointer", transition: "all 0.18s", textAlign: "left", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: selected ? W : N, fontFamily: "'DM Sans', sans-serif", transition: "color 0.18s", letterSpacing: "-0.01em" }}>{p.label}</span>
                <span style={{ fontSize: 11, color: selected ? "rgba(255,255,255,0.5)" : NR50, fontFamily: "'DM Sans', sans-serif", transition: "color 0.18s" }}>{p.desc}</span>
              </button>
            );
          })}
        </div>
      </Field>
      {form.painPoint === "other" && (
        <Field label={t.step3.other}>
          <TextArea name="painPointOther" value={form.painPointOther} onChange={set("painPointOther")} placeholder={t.step3.otherPlaceholder} rows={3} />
        </Field>
      )}
      <Field label={t.step3.budget} hint={t.step3.budgetHint}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {t.budgetOptions.map((b) => {
            const selected = form.budget === b.value;
            return (
              <button key={b.value} type="button" onClick={() => set("budget")(selected ? "" : b.value)}
                style={{ background: selected ? N : W, border: `1px solid ${selected ? N : NR30}`, borderRadius: 2, padding: "10px 18px", cursor: "pointer", transition: "all 0.18s" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: selected ? W : N, fontFamily: "'DM Sans', sans-serif", transition: "color 0.18s" }}>{b.label}</span>
              </button>
            );
          })}
        </div>
      </Field>
      <Field label={t.step3.other} hint={t.step3.otherHint}>
        <TextArea name="additionalContext" value={form.additionalContext} onChange={set("additionalContext")} placeholder={t.step3.otherPlaceholder} rows={4} />
      </Field>
    </div>
  );
}

// ── Success ────────────────────────────────────────────────────────────────────
function SuccessScreen({ id, name, t }: { id: string; name: string; t: typeof CONTENT.en }) {
  const firstName = name.split(" ")[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "64px 40px", gap: 24 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", border: `2px solid ${E}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={E} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: N }}>{t.success.title(firstName)}</h2>
      <p style={{ fontSize: 16, fontWeight: 300, color: N, opacity: 0.55, maxWidth: 440, lineHeight: 1.75 }}>
        {t.success.sub1} <strong style={{ fontWeight: 600 }}>{t.success.sub2}</strong>
      </p>
      <p style={{ fontFamily: "monospace", fontSize: 11, color: N, opacity: 0.3, letterSpacing: "0.1em" }}>{t.success.refLabel} {id.toUpperCase()}</p>
      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" style={{ background: N, color: W, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 32px", height: 48, display: "flex", alignItems: "center", borderRadius: 2, textDecoration: "none", border: `1px solid ${N}` }}>{t.success.backHome}</Link>
        <Link href="/book-demo" style={{ background: "transparent", color: N, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 32px", height: 48, display: "flex", alignItems: "center", borderRadius: 2, textDecoration: "none", border: `1px solid ${NR30}` }}>{t.success.bookDemo}</Link>
      </div>
    </div>
  );
}

// ── EMPTY FORM ─────────────────────────────────────────────────────────────────
const EMPTY: FormState = {
  fullName: "", email: "", companyName: "", companySize: "",
  currentTools: [], painPoint: "", painPointOther: "", budget: "", additionalContext: "",
};

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default function GetStartedPage() {
  // 🔥 SIMPLE i18n: Check if URL contains "ru" (case-insensitive)
  const params = useParams();
  const langParam = (params?.lang as string) || "";
  const isRu = langParam.toLowerCase().includes("ru");
  const t = isRu ? CONTENT.ru : CONTENT.en;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const { status, errorMessage, submittedId, submit } = useGetStarted();

  const set = useCallback((field: keyof FormState) => (value: string) => setForm((prev) => ({ ...prev, [field]: value })), []);
  const toggleTool = useCallback((tool: string) => {
    setForm((prev) => ({ ...prev, currentTools: prev.currentTools.includes(tool) ? prev.currentTools.filter((t) => t !== tool) : [...prev.currentTools, tool] }));
  }, []);

  const validateStep1 = (): boolean => {
    const next: FormErrors = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) next.fullName = t.errors.name;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t.errors.email;
    if (!form.companyName.trim()) next.companyName = t.errors.company;
    if (!form.companySize) next.companySize = t.errors.size;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep3 = (): boolean => {
    const next: FormErrors = {};
    if (!form.painPoint) next.painPoint = t.errors.pain;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => { if (step === 1 && !validateStep1()) return; setErrors({}); setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleBack = () => { setErrors({}); setStep((s) => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    await submit({
      fullName: form.fullName.trim(), email: form.email.trim(), companyName: form.companyName.trim(),
      companySize: form.companySize as any, currentTools: form.currentTools.length ? form.currentTools : undefined,
      painPoint: form.painPoint as any || undefined, painPointOther: form.painPointOther.trim() || undefined,
      budget: form.budget as any || undefined, additionalContext: form.additionalContext.trim() || undefined,
    });
  };

  const isSubmitting = status === "submitting";
  const TOTAL_STEPS = 3;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,300&family=EB+Garamond:ital,wght@0,400;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'DM Sans',sans-serif;background:#fff;color:#0B1F3B;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        ::selection{background:#0B1F3B;color:#fff}
        input::placeholder,textarea::placeholder{color:rgba(11,31,59,0.28)}
        input,textarea,select,button{font-family:'DM Sans',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:768px){.page-layout{grid-template-columns:1fr!important}.form-cols{grid-template-columns:1fr!important}.size-grid{grid-template-columns:repeat(2,1fr)!important}.pain-grid{grid-template-columns:1fr!important}.nav-pad{padding:0 20px!important}.page-inner{padding:40px 20px 80px!important}.sidebar{display:none!important}}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${NR12}` }}>
        <div className="nav-pad" style={{ background: N, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 20px", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{t.nav.utilityBar}</span>
          <a href={`mailto:${t.nav.email}`} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{t.nav.email}</a>
        </div>
        <div className="nav-pad" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 64 }}>
          <Link href={`/${langParam || "en"}`} style={{ textDecoration: "none" }}>
            <span style={{ display: "inline-flex", alignItems: "baseline", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: "-0.022em" }}>
              <span style={{ color: N }}>Zen</span><span style={{ WebkitTextFillColor: "transparent", color: "transparent", WebkitTextStrokeColor: N, WebkitTextStrokeWidth: "1.3px" }}>vor</span>
            </span>
          </Link>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href={`/${langParam || "en"}/book-demo`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: N, textDecoration: "none", opacity: 0.45 }}>{t.nav.bookDemo}</Link>
            <Link href={`/${langParam || "en"}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: N, textDecoration: "none", opacity: 0.45 }}>{t.nav.back}</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ background: N, padding: "56px 20px 64px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "64px 64px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: E }} />{t.hero.eyebrow}
          </p>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(32px,4.5vw,58px)", fontWeight: 700, letterSpacing: "-0.028em", lineHeight: 1.08, color: W, marginBottom: 18 }}>
            {t.hero.title1} <em style={{ fontFamily: "'EB Garamond', serif", fontWeight: 400, fontStyle: "italic", color: "rgba(255,255,255,0.55)" }}>{t.hero.titleItalic}</em>
          </h1>
          <p style={{ fontSize: 16, fontWeight: 300, color: "rgba(255,255,255,0.45)", maxWidth: 520, lineHeight: 1.75 }}>{t.hero.sub}</p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="page-layout page-inner" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 0, maxWidth: 1100, margin: "0 auto", padding: "64px 20px 120px", alignItems: "start" }}>
        {/* ── FORM COLUMN ── */}
        <div style={{ paddingRight: 24 }}>
          {status === "success" && submittedId ? (
            <SuccessScreen id={submittedId} name={form.fullName} t={t} />
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <StepIndicator current={step} total={TOTAL_STEPS} t={t} />
              {status === "error" && errorMessage && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 2, padding: "16px 20px", marginBottom: 32, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <p style={{ fontSize: 14, color: "#991B1B", lineHeight: 1.5 }}>{errorMessage}</p>
                </div>
              )}
              <div style={{ animation: "fadeIn 0.35s ease both" }} key={step}>
                {step === 1 && <Step1 form={form} errors={errors} set={set} t={t} />}
                {step === 2 && <Step2 form={form} toggleTool={toggleTool} t={t} />}
                {step === 3 && <Step3 form={form} errors={errors} set={set} t={t} />}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 48, alignItems: "center" }}>
                {step > 1 && (
                  <button type="button" onClick={handleBack}
                    style={{ height: 52, padding: "0 28px", background: "transparent", color: N, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: `1px solid ${NR30}`, borderRadius: 2, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = N; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = NR30; }}>
                    {t.buttons.back}
                  </button>
                )}
                {step < TOTAL_STEPS ? (
                  <button type="button" onClick={handleNext}
                    style={{ flex: 1, height: 52, background: N, color: W, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${N}`, borderRadius: 2, cursor: "pointer", transition: "all 0.22s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = N; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = N; (e.currentTarget as HTMLElement).style.color = W; }}>
                    {t.buttons.continue}
                  </button>
                ) : (
                  <button type="submit" disabled={isSubmitting}
                    style={{ flex: 1, height: 52, background: isSubmitting ? NR30 : E, color: W, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${isSubmitting ? NR30 : E}`, borderRadius: 2, cursor: isSubmitting ? "not-allowed" : "pointer", transition: "all 0.22s", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                    {isSubmitting ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> {t.buttons.submitting}</> : t.buttons.submit}
                  </button>
                )}
              </div>
              {step === TOTAL_STEPS && <p style={{ textAlign: "center", fontSize: 12, color: N, opacity: 0.3, marginTop: 16 }}>{t.buttons.noCommitment}</p>}
            </form>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="sidebar" style={{ position: "sticky", top: 112, display: "flex", flexDirection: "column", gap: 1, background: NR12, border: `1px solid ${NR12}`, alignSelf: "start" }}>
          <div style={{ background: W, padding: "24px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 18 }}>{t.sidebar.whatYouGet}</p>
            {t.sidebar.items.map((item) => (
              <div key={item.title} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <div><p style={{ fontSize: 13, fontWeight: 600, color: N, marginBottom: 2 }}>{item.title}</p><p style={{ fontSize: 12, lineHeight: 1.55, color: N, opacity: 0.45 }}>{item.body}</p></div>
              </div>
            ))}
          </div>
          {(form.companyName || form.currentTools.length > 0) && (
            <div style={{ background: W, padding: "20px 24px", borderTop: `1px solid ${NR12}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 14 }}>{t.sidebar.yourAnswers}</p>
              {form.companyName && <p style={{ fontSize: 12, color: N, opacity: 0.6, marginBottom: 6 }}><span style={{ fontWeight: 600, opacity: 1, color: N }}>{t.sidebar.company}:</span> {form.companyName}{form.companySize && ` · ${t.companySizes.find(s => s.value === form.companySize)?.label}`}</p>}
              {form.currentTools.length > 0 && <p style={{ fontSize: 12, color: N, opacity: 0.6, marginBottom: 6 }}><span style={{ fontWeight: 600, opacity: 1, color: N }}>{t.sidebar.stack}:</span> {form.currentTools.slice(0, 3).join(", ")}{form.currentTools.length > 3 ? ` +${form.currentTools.length - 3} more` : ""}</p>}
              {form.painPoint && <p style={{ fontSize: 12, color: N, opacity: 0.6 }}><span style={{ fontWeight: 600, opacity: 1, color: N }}>{t.sidebar.challenge}:</span> {t.painPoints.find(p => p.value === form.painPoint)?.label}</p>}
            </div>
          )}
          <div style={{ background: N, padding: "20px 24px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>{t.sidebar.directTitle}</p>
            <a href={`mailto:${t.sidebar.directEmail}`} style={{ fontSize: 13, fontWeight: 600, color: W, textDecoration: "none", display: "block", marginBottom: 4 }}>{t.sidebar.directEmail}</a>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{t.sidebar.directSub}</p>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: N, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "baseline", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}><span style={{ color: W }}>Zen</span><span style={{ WebkitTextFillColor: "transparent", WebkitTextStrokeColor: W, WebkitTextStrokeWidth: "1.2px" }}>vor</span></span>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em" }}>© {new Date().getFullYear()} Zenvor. {t.footer.copyright}</p>
          <div style={{ display: "flex", gap: 24 }}>{[t.footer.privacy, t.footer.terms].map((l) => <Link key={l} href="#" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>{l}</Link>)}</div>
        </div>
      </footer>
    </>
  );
}
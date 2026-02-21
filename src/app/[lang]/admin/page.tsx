// src/app/admin/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "~/lib/trpc";

// ── Design tokens ─────────────────────────────────────────────────────────────
const N    = "#0B1F3B";
const W    = "#FFFFFF";
const E    = "#0F766E";
const NR06 = "rgba(11,31,59,0.06)";
const NR12 = "rgba(11,31,59,0.12)";
const NR20 = "rgba(11,31,59,0.20)";
const NR30 = "rgba(11,31,59,0.30)";
const NR50 = "rgba(11,31,59,0.50)";

// ── Status configs ─────────────────────────────────────────────────────────────
const LEAD_STATUSES = [
  { value: "new",           label: "New",           color: "#0B1F3B", bg: "rgba(11,31,59,0.08)" },
  { value: "contacted",     label: "Contacted",     color: "#0F766E", bg: "rgba(15,118,110,0.12)" },
  { value: "qualified",     label: "Qualified",     color: "#1D4ED8", bg: "rgba(29,78,216,0.1)" },
  { value: "proposal_sent", label: "Proposal Sent", color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
  { value: "closed_won",    label: "Closed Won",    color: "#15803D", bg: "rgba(21,128,61,0.1)" },
  { value: "closed_lost",   label: "Closed Lost",   color: "#C0392B", bg: "rgba(192,57,43,0.1)" },
] as const;

const DEMO_STATUSES = [
  { value: "pending",   label: "Pending",   color: "#0B1F3B", bg: "rgba(11,31,59,0.08)" },
  { value: "contacted", label: "Contacted", color: "#0F766E", bg: "rgba(15,118,110,0.12)" },
  { value: "scheduled", label: "Scheduled", color: "#1D4ED8", bg: "rgba(29,78,216,0.1)" },
  { value: "completed", label: "Completed", color: "#15803D", bg: "rgba(21,128,61,0.1)" },
  { value: "no_show",   label: "No Show",   color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  { value: "rejected",  label: "Rejected",  color: "#C0392B", bg: "rgba(192,57,43,0.1)" },
] as const;

// ── Label maps ─────────────────────────────────────────────────────────────────
const COMPANY_SIZE_LABELS: Record<string, string> = {
  "1_10": "1–10 people", "11_50": "11–50 people",
  "51_200": "51–200 people", "201_plus": "201+ people",
};
const PAIN_LABELS: Record<string, string> = {
  too_many_messages:   "Too many messages",
  manual_scheduling:   "Manual scheduling",
  data_entry:          "Data entry",
  lead_qualification:  "Lead qualification",
  internal_knowledge:  "Internal knowledge",
  workflow_automation: "Workflow automation",
  other:               "Other",
};
const BUDGET_LABELS: Record<string, string> = {
  under_500:   "< $500/mo",
  "500_1500":  "$500–1,500/mo",
  "1500_5000": "$1,500–5,000/mo",
  "5000_plus": "$5,000+/mo",
  not_sure:    "Not sure",
};
const SERVICE_LABELS: Record<string, string> = {
  communication_ai:      "Communication AI",
  sales_ai:              "Sales AI",
  support_ai:            "Support AI",
  knowledge_ai:          "Knowledge AI",
  scheduling_ai:         "Scheduling AI",
  data_ai:               "Data AI",
  automation_ai:         "Automation AI",
  internal_assistant_ai: "Internal Assistant",
  decision_support_ai:   "Decision Support",
  full_platform:         "Full Platform",
  not_sure:              "Not Sure Yet",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ value, statuses }: {
  value: string;
  statuses: readonly { value: string; label: string; color: string; bg: string }[];
}) {
  const s = statuses.find((x) => x.value === value) ?? statuses[0]!;
  return (
    <span style={{
      display: "inline-block", fontSize: 10, fontWeight: 700,
      letterSpacing: "0.1em", textTransform: "uppercase",
      padding: "3px 9px", borderRadius: 2,
      color: s.color, background: s.bg, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 600,
      color: N, opacity: 0.65, background: NR06,
      border: `1px solid ${NR12}`, borderRadius: 2,
      padding: "3px 8px", marginRight: 4, marginBottom: 4,
    }}>
      {children}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: N, opacity: 0.35, marginBottom: 5 }}>
        {label}
      </p>
      <p style={{ fontSize: 14, color: N, lineHeight: 1.65 }}>{value}</p>
    </div>
  );
}

function SectionDivider() {
  return <div style={{ height: 1, background: NR12, margin: "20px 0 24px" }} />;
}

// ── Drawer ────────────────────────────────────────────────────────────────────
function Drawer({ title, subtitle, onClose, children }: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(11,31,59,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0,
        width: "min(560px, 96vw)", background: W,
        display: "flex", flexDirection: "column",
        boxShadow: "-12px 0 48px rgba(11,31,59,0.18)",
        animation: "slideIn 0.22s ease",
      }}>
        {/* Header */}
        <div style={{ padding: "22px 28px", borderBottom: `1px solid ${NR12}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: N, letterSpacing: "-0.01em", marginBottom: 3 }}>{title}</h2>
              {subtitle && <p style={{ fontSize: 12, color: N, opacity: 0.45 }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: N, opacity: 0.4, lineHeight: 0, flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Status selector ───────────────────────────────────────────────────────────
function StatusSelector<T extends string>({
  value, options, onChange, disabled,
}: {
  value: T;
  options: readonly { value: T; label: string; color: string; bg: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: N, opacity: 0.35, marginBottom: 10 }}>
        Pipeline Status
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button key={opt.value} onClick={() => onChange(opt.value)} disabled={disabled} style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "7px 14px", borderRadius: 2, cursor: disabled ? "not-allowed" : "pointer",
              border: `1px solid ${active ? opt.color : NR20}`,
              background: active ? opt.bg : "transparent",
              color: active ? opt.color : NR50,
              transition: "all 0.15s", opacity: disabled ? 0.5 : 1,
            }}>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Note editor ───────────────────────────────────────────────────────────────
function NoteEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: N, opacity: 0.35, marginBottom: 10 }}>
        Internal Note <span style={{ fontWeight: 400, opacity: 0.6, textTransform: "none", letterSpacing: 0 }}>— private, not visible to lead</span>
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={4}
        placeholder="Add a private note about this lead..."
        style={{
          width: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: N,
          background: NR06, border: `1px solid ${focused ? NR30 : NR12}`,
          borderRadius: 2, padding: "12px 14px", outline: "none",
          resize: "vertical", lineHeight: 1.65, transition: "border-color 0.18s",
        }}
      />
    </div>
  );
}

// ── Save button ───────────────────────────────────────────────────────────────
function SaveButton({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button onClick={onClick} disabled={saving} style={{
      width: "100%", height: 48, background: saved ? E : saving ? NR20 : N, color: W,
      fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
      letterSpacing: "0.12em", textTransform: "uppercase", border: "none",
      borderRadius: 2, cursor: saving ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "all 0.2s",
    }}>
      {saving ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
    </button>
  );
}

// ── Search + filter bar ────────────────────────────────────────────────────────
function FilterBar({
  search, onSearch, filterStatus, onFilter, statuses, counts, total, onRefresh,
}: {
  search: string; onSearch: (v: string) => void;
  filterStatus: string; onFilter: (v: string) => void;
  statuses: readonly { value: string; label: string; color: string; bg: string }[];
  counts: Record<string, number>; total: number; onRefresh: () => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
      {/* Search */}
      <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
        <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.3, pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={N} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search name, email, company…" style={{ width: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: N, background: W, border: `1px solid ${NR20}`, borderRadius: 2, padding: "9px 12px 9px 34px", outline: "none" }} />
      </div>
      {/* All button */}
      <button onClick={() => onFilter("all")} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 14px", borderRadius: 2, border: `1px solid ${filterStatus === "all" ? N : NR20}`, background: filterStatus === "all" ? N : "transparent", color: filterStatus === "all" ? W : NR50, cursor: "pointer", whiteSpace: "nowrap" }}>
        All ({total})
      </button>
      {/* Status filters */}
      {statuses.map((s) => {
        const active = filterStatus === s.value;
        return (
          <button key={s.value} onClick={() => onFilter(active ? "all" : s.value)} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 14px", borderRadius: 2, border: `1px solid ${active ? s.color : NR20}`, background: active ? s.bg : "transparent", color: active ? s.color : NR50, cursor: "pointer", whiteSpace: "nowrap" }}>
            {s.label}{counts[s.value] ? ` (${counts[s.value]})` : ""}
          </button>
        );
      })}
      {/* Refresh */}
      <button onClick={onRefresh} style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", borderRadius: 2, border: `1px solid ${NR20}`, background: "transparent", color: NR50, cursor: "pointer" }}>
        ↻ Refresh
      </button>
    </div>
  );
}

// ── Empty / Loading states ────────────────────────────────────────────────────
function TableEmpty({ loading, label }: { loading: boolean; label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 0", color: N, opacity: 0.3, fontSize: 13 }}>
      {loading ? "Loading…" : label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEADS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function LeadsPanel() {
  const [leads, setLeads]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilter]     = useState("all");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<any | null>(null);
  const [localStatus, setLocalStatus] = useState("new");
  const [localNote, setLocalNote]     = useState("");
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setLeads(await trpc.getStarted.list.query({ limit: 200 })); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openDrawer = (lead: any) => {
    setSelected(lead); setLocalStatus(lead.status);
    setLocalNote(lead.internalNote ?? ""); setSaved(false);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await trpc.getStarted.updateStatus.mutate({ id: selected.id, status: localStatus as any, internalNote: localNote || undefined });
      setLeads((prev) => prev.map((l) => l.id === selected.id ? { ...l, status: localStatus, internalNote: localNote } : l));
      setSelected((p: any) => p ? { ...p, status: localStatus, internalNote: localNote } : p);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const counts: Record<string, number> = {};
  LEAD_STATUSES.forEach((s) => { counts[s.value] = leads.filter((l) => l.status === s.value).length; });

  const filtered = leads.filter((l) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    const q = search.toLowerCase();
    return !q || [l.fullName, l.email, l.companyName].some((v) => v?.toLowerCase().includes(q));
  });

  const TH = ["Name", "Email", "Company & Size", "Pain Point", "Budget", "Status", "When"];
  const COLS = "1.2fr 1.2fr 1.1fr 1fr 0.8fr 110px 80px";

  return (
    <>
      <FilterBar search={search} onSearch={setSearch} filterStatus={filterStatus} onFilter={setFilter} statuses={LEAD_STATUSES} counts={counts} total={leads.length} onRefresh={load} />

      {loading || filtered.length === 0 ? (
        <TableEmpty loading={loading} label="No leads found." />
      ) : (
        <div style={{ border: `1px solid ${NR12}`, borderRadius: 2, overflow: "hidden", background: W }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: COLS, background: NR06, borderBottom: `1px solid ${NR12}`, padding: "10px 20px", gap: 8 }}>
            {TH.map((h) => <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: N, opacity: 0.35 }}>{h}</span>)}
          </div>
          {/* Rows */}
          {filtered.map((lead, i) => (
            <div key={lead.id} onClick={() => openDrawer(lead)} style={{ display: "grid", gridTemplateColumns: COLS, padding: "13px 20px", alignItems: "center", gap: 8, borderBottom: i < filtered.length - 1 ? `1px solid ${NR06}` : "none", cursor: "pointer", transition: "background 0.13s", background: W }}
              onMouseEnter={(e) => (e.currentTarget.style.background = NR06)}
              onMouseLeave={(e) => (e.currentTarget.style.background = W)}
            >
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: N, display: "block" }}>{lead.fullName}</span>
                {lead.internalNote && <span style={{ fontSize: 10, color: E, fontWeight: 600, letterSpacing: "0.06em" }}>HAS NOTE</span>}
              </div>
              <span style={{ fontSize: 12, color: N, opacity: 0.55, wordBreak: "break-all" }}>{lead.email}</span>
              <div>
                <span style={{ fontSize: 13, color: N, display: "block" }}>{lead.companyName}</span>
                {lead.companySize && <span style={{ fontSize: 11, color: N, opacity: 0.4 }}>{COMPANY_SIZE_LABELS[lead.companySize]}</span>}
              </div>
              <span style={{ fontSize: 12, color: N, opacity: 0.55 }}>{lead.painPoint ? PAIN_LABELS[lead.painPoint] ?? lead.painPoint : "—"}</span>
              <span style={{ fontSize: 12, color: N, opacity: 0.55 }}>{lead.budget ? BUDGET_LABELS[lead.budget] ?? lead.budget : "—"}</span>
              <StatusBadge value={lead.status} statuses={LEAD_STATUSES} />
              <span style={{ fontSize: 11, color: N, opacity: 0.4 }}>{timeAgo(lead.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <Drawer title={selected.fullName} subtitle={`${selected.email} · ${selected.companyName}`} onClose={() => setSelected(null)}>
          <StatusSelector value={localStatus} options={LEAD_STATUSES} onChange={setLocalStatus} disabled={saving} />
          <SectionDivider />

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 16 }}>Contact</p>
          <DetailRow label="Full Name"   value={selected.fullName} />
          <DetailRow label="Email"       value={selected.email} />
          <DetailRow label="Company"     value={selected.companyName} />
          <DetailRow label="Team Size"   value={selected.companySize ? COMPANY_SIZE_LABELS[selected.companySize] : null} />

          {selected.currentTools && (
            <>
              <SectionDivider />
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 12 }}>Current Stack</p>
              <div style={{ marginBottom: 8 }}>
                {selected.currentTools.split(",").map((t: string) => <Tag key={t}>{t.trim()}</Tag>)}
              </div>
            </>
          )}

          <SectionDivider />
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 16 }}>Pain & Budget</p>
          <DetailRow label="Main Pain Point"    value={selected.painPoint ? PAIN_LABELS[selected.painPoint] ?? selected.painPoint : null} />
          <DetailRow label="Pain Detail"        value={selected.painPointOther} />
          <DetailRow label="Budget Range"       value={selected.budget ? BUDGET_LABELS[selected.budget] ?? selected.budget : null} />
          <DetailRow label="Additional Context" value={selected.additionalContext} />

          <SectionDivider />
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 16 }}>Meta</p>
          <DetailRow label="Submitted"    value={fmtDate(selected.createdAt)} />
          <DetailRow label="Last Updated" value={fmtDate(selected.updatedAt)} />
          <DetailRow label="Record ID"    value={selected.id} />

          <SectionDivider />
          <NoteEditor value={localNote} onChange={setLocalNote} />
          <SaveButton onClick={save} saving={saving} saved={saved} />
        </Drawer>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMOS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function DemosPanel() {
  const [demos, setDemos]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilter]     = useState("all");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<any | null>(null);
  const [localStatus, setLocalStatus] = useState("pending");
  const [localNote, setLocalNote]     = useState("");
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setDemos(await trpc.bookDemo.list.query({ limit: 200 })); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openDrawer = (demo: any) => {
    setSelected(demo); setLocalStatus(demo.status);
    setLocalNote(demo.internalNote ?? ""); setSaved(false);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await trpc.bookDemo.updateStatus.mutate({ id: selected.id, status: localStatus as any, internalNote: localNote || undefined });
      setDemos((prev) => prev.map((d) => d.id === selected.id ? { ...d, status: localStatus, internalNote: localNote } : d));
      setSelected((p: any) => p ? { ...p, status: localStatus, internalNote: localNote } : p);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const counts: Record<string, number> = {};
  DEMO_STATUSES.forEach((s) => { counts[s.value] = demos.filter((d) => d.status === s.value).length; });

  const filtered = demos.filter((d) => {
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    const q = search.toLowerCase();
    return !q || [d.fullName, d.email, d.companyName].some((v) => v?.toLowerCase().includes(q));
  });

  const TH = ["Name", "Email", "Company / Role", "Service Interest", "Referral", "Status", "When"];
  const COLS = "1.2fr 1.2fr 1.1fr 1fr 0.9fr 110px 80px";

  return (
    <>
      <FilterBar search={search} onSearch={setSearch} filterStatus={filterStatus} onFilter={setFilter} statuses={DEMO_STATUSES} counts={counts} total={demos.length} onRefresh={load} />

      {loading || filtered.length === 0 ? (
        <TableEmpty loading={loading} label="No demo requests found." />
      ) : (
        <div style={{ border: `1px solid ${NR12}`, borderRadius: 2, overflow: "hidden", background: W }}>
          <div style={{ display: "grid", gridTemplateColumns: COLS, background: NR06, borderBottom: `1px solid ${NR12}`, padding: "10px 20px", gap: 8 }}>
            {TH.map((h) => <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: N, opacity: 0.35 }}>{h}</span>)}
          </div>
          {filtered.map((demo, i) => (
            <div key={demo.id} onClick={() => openDrawer(demo)} style={{ display: "grid", gridTemplateColumns: COLS, padding: "13px 20px", alignItems: "center", gap: 8, borderBottom: i < filtered.length - 1 ? `1px solid ${NR06}` : "none", cursor: "pointer", transition: "background 0.13s", background: W }}
              onMouseEnter={(e) => (e.currentTarget.style.background = NR06)}
              onMouseLeave={(e) => (e.currentTarget.style.background = W)}
            >
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: N, display: "block" }}>{demo.fullName}</span>
                {demo.internalNote && <span style={{ fontSize: 10, color: E, fontWeight: 600, letterSpacing: "0.06em" }}>HAS NOTE</span>}
              </div>
              <span style={{ fontSize: 12, color: N, opacity: 0.55, wordBreak: "break-all" }}>{demo.email}</span>
              <div>
                <span style={{ fontSize: 13, color: N, display: "block" }}>{demo.companyName ?? "—"}</span>
                {demo.jobTitle && <span style={{ fontSize: 11, color: N, opacity: 0.4 }}>{demo.jobTitle}</span>}
              </div>
              <span style={{ fontSize: 12, color: N, opacity: 0.55 }}>{demo.serviceInterest ? SERVICE_LABELS[demo.serviceInterest] ?? demo.serviceInterest : "—"}</span>
              <span style={{ fontSize: 12, color: N, opacity: 0.55 }}>{demo.referralSource ?? "—"}</span>
              <StatusBadge value={demo.status} statuses={DEMO_STATUSES} />
              <span style={{ fontSize: 11, color: N, opacity: 0.4 }}>{timeAgo(demo.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <Drawer title={selected.fullName} subtitle={`${selected.email}${selected.companyName ? ` · ${selected.companyName}` : ""}`} onClose={() => setSelected(null)}>
          <StatusSelector value={localStatus} options={DEMO_STATUSES} onChange={setLocalStatus} disabled={saving} />
          <SectionDivider />

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 16 }}>Contact</p>
          <DetailRow label="Full Name"  value={selected.fullName} />
          <DetailRow label="Email"      value={selected.email} />
          <DetailRow label="Phone"      value={selected.phone} />
          <DetailRow label="Company"    value={selected.companyName} />
          <DetailRow label="Job Title"  value={selected.jobTitle} />

          <SectionDivider />
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 16 }}>Demo Details</p>
          <DetailRow label="Service Interest" value={selected.serviceInterest ? SERVICE_LABELS[selected.serviceInterest] ?? selected.serviceInterest : null} />
          <DetailRow label="Message"          value={selected.message} />
          <DetailRow label="Referral Source"  value={selected.referralSource} />

          <SectionDivider />
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: N, opacity: 0.3, marginBottom: 16 }}>Meta</p>
          <DetailRow label="Submitted"    value={fmtDate(selected.createdAt)} />
          <DetailRow label="Last Updated" value={fmtDate(selected.updatedAt)} />
          <DetailRow label="Record ID"    value={selected.id} />

          <SectionDivider />
          <NoteEditor value={localNote} onChange={setLocalNote} />
          <SaveButton onClick={save} saving={saving} saved={saved} />
        </Drawer>
      )}
    </>
  );
}

// ── STATS BAR ─────────────────────────────────────────────────────────────────
function StatsBar({ leads, demos }: { leads: any[]; demos: any[] }) {
  const stats = [
    { label: "Total Leads",    value: leads.length,                                           border: false },
    { label: "New",            value: leads.filter((l) => l.status === "new").length,          border: false },
    { label: "Qualified",      value: leads.filter((l) => l.status === "qualified").length,    border: false },
    { label: "Closed Won",     value: leads.filter((l) => l.status === "closed_won").length,   border: true  },
    { label: "Demo Requests",  value: demos.length,                                            border: false },
    { label: "Pending",        value: demos.filter((d) => d.status === "pending").length,      border: false },
    { label: "Scheduled",      value: demos.filter((d) => d.status === "scheduled").length,    border: false },
    { label: "Completed",      value: demos.filter((d) => d.status === "completed").length,    border: false },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", borderBottom: `1px solid ${NR12}`, background: W }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: "18px 20px", borderRight: i < stats.length - 1 ? `1px solid ${NR12}` : "none", textAlign: "center", borderLeft: s.border ? `3px solid ${E}` : "none" }}>
          <span style={{ display: "block", fontSize: 24, fontWeight: 700, color: N, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</span>
          <span style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: N, opacity: 0.35, marginTop: 5 }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── PASSWORD GATE ─────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw]           = useState("");
  const [error, setError]     = useState(false);
  const [shake, setShake]     = useState(false);
  const [focused, setFocused] = useState(false);
  const [show, setShow]       = useState(false);

  const attempt = () => {
    if (pw === "Nursan666") {
      onUnlock();
    } else {
      setError(true); setPw("");
      setShake(true); setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: N, position: "relative", overflow: "hidden" }}>
      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "64px 64px", pointerEvents: "none" }} />
      {/* Card */}
      <div style={{ position: "relative", zIndex: 1, background: W, padding: "52px 48px", width: "min(440px, 92vw)", animation: shake ? "shake 0.45s ease" : "fadeUp 0.35s ease" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ display: "inline-flex", alignItems: "baseline", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: "-0.022em" }}>
            <span style={{ color: N }}>Zen</span>
            <span style={{ WebkitTextFillColor: "transparent", color: "transparent", WebkitTextStrokeColor: N, WebkitTextStrokeWidth: "1.5px" }}>vor</span>
          </span>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: N, opacity: 0.3, marginTop: 10 }}>Admin CRM</p>
        </div>

        <p style={{ fontSize: 22, fontWeight: 700, color: N, letterSpacing: "-0.018em", marginBottom: 6 }}>Restricted Access</p>
        <p style={{ fontSize: 13, color: N, opacity: 0.45, lineHeight: 1.7, marginBottom: 28 }}>
          Enter your admin password to view lead and demo data.
        </p>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 2, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: 13, color: "#991B1B" }}>Incorrect password.</span>
          </div>
        )}

        {/* Input */}
        <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: N, opacity: 0.4, marginBottom: 8 }}>Password</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === "Enter") attempt(); }}
            placeholder="Enter admin password"
            autoFocus
            style={{
              width: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: N,
              background: W, border: `1px solid ${error ? "#FECACA" : focused ? N : NR30}`,
              borderRadius: 2, padding: "13px 44px 13px 16px", outline: "none",
              transition: "border-color 0.18s",
              boxShadow: focused ? "0 0 0 3px rgba(11,31,59,0.06)" : "none",
            }}
          />
          {/* Show/hide toggle */}
          <button type="button" onClick={() => setShow((s) => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, color: N, opacity: 0.4, lineHeight: 0 }}>
            {show ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>

        <button onClick={attempt} style={{ width: "100%", height: 50, background: N, color: W, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${N}`, borderRadius: 2, cursor: "pointer", transition: "all 0.22s" }}
          onMouseEnter={(e) => { (e.currentTarget).style.background = "transparent"; (e.currentTarget).style.color = N; }}
          onMouseLeave={(e) => { (e.currentTarget).style.background = N; (e.currentTarget).style.color = W; }}
        >
          Unlock →
        </button>
      </div>
    </div>
  );
}

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { height: 100%; }
      body { font-family: 'DM Sans', sans-serif; background: #f4f5f7; color: #0B1F3B; -webkit-font-smoothing: antialiased; }
      ::selection { background: #0B1F3B; color: #FFFFFF; }
      input, textarea, button, select { font-family: 'DM Sans', sans-serif; }
      input::placeholder, textarea::placeholder { color: rgba(11,31,59,0.28); }
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes shake   { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }
      @media (max-width: 1100px) {
        div[style*="repeat(8,1fr)"] { grid-template-columns: repeat(4,1fr) !important; }
      }
      @media (max-width: 768px) {
        div[style*="repeat(4,1fr)"] { grid-template-columns: repeat(2,1fr) !important; }
      }
    `}</style>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab]           = useState<"leads" | "demos">("leads");
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [allDemos, setAllDemos] = useState<any[]>([]);

  useEffect(() => {
    if (!unlocked) return;
    trpc.getStarted.list.query({ limit: 200 }).then(setAllLeads).catch(() => {});
    trpc.bookDemo.list.query({ limit: 200 }).then(setAllDemos).catch(() => {});
  }, [unlocked]);

  if (!unlocked) return <><GlobalStyles /><PasswordGate onUnlock={() => setUnlocked(true)} /></>;

  return (
    <>
      <GlobalStyles />

      {/* Top nav */}
      <nav style={{ background: N, borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ display: "inline-flex", alignItems: "baseline", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "-0.022em" }}>
              <span style={{ color: W }}>Zen</span>
              <span style={{ WebkitTextFillColor: "transparent", color: "transparent", WebkitTextStrokeColor: W, WebkitTextStrokeWidth: "1.3px" }}>vor</span>
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: 18 }}>Admin CRM</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href="/" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", textDecoration: "none", padding: "6px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2 }}>← Site</a>
            <button onClick={() => setUnlocked(false)} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, padding: "6px 14px", cursor: "pointer" }}>Lock</button>
          </div>
        </div>
      </nav>

      {/* Stats */}
      <StatsBar leads={allLeads} demos={allDemos} />

      {/* Tabs */}
      <div style={{ background: W, borderBottom: `1px solid ${NR12}`, padding: "0 28px", display: "flex" }}>
        {(["leads", "demos"] as const).map((t) => {
          const active = tab === t;
          const label  = t === "leads"
            ? `Get Started Leads${allLeads.length ? ` (${allLeads.length})` : ""}`
            : `Demo Requests${allDemos.length ? ` (${allDemos.length})` : ""}`;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "16px 20px", background: "none", border: "none", borderBottom: active ? `2px solid ${N}` : "2px solid transparent", color: active ? N : NR50, cursor: "pointer", transition: "all 0.18s" }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ padding: "28px 28px 80px", maxWidth: 1500, margin: "0 auto" }}>
        {tab === "leads" ? <LeadsPanel /> : <DemosPanel />}
      </div>
    </>
  );
}
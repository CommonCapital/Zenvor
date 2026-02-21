import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));



export type DemoStatus =
  | 'pending' | 'contacted' | 'scheduled'
  | 'completed' | 'no_show' | 'rejected';

export const demoRequest = pgTable(
  'demo_request',
  {
    id:          text('id').primaryKey(),
    fullName:    text('full_name').notNull(),
    email:       text('email').notNull(),
    phone:       text('phone'),
    companyName: text('company_name'),
    jobTitle:    text('job_title'),
    serviceInterest: text('service_interest'),
    message:        text('message'),
    referralSource: text('referral_source'),
    status: text('status').notNull().$type<DemoStatus>().default('pending'),
    assignedTo:   text('assigned_to'),
    internalNote: text('internal_note'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (t) => [
    index('demo_request_email_idx').on(t.email),
    index('demo_request_status_idx').on(t.status),
    index('demo_request_created_at_idx').on(t.createdAt),
  ],
);
export type CompanySize =
  | "1_10" | "11_50" | "51_200" | "201_plus";

export type PainPoint =
  | "too_many_messages" | "manual_scheduling" | "data_entry"
  | "lead_qualification" | "internal_knowledge" | "workflow_automation" | "other";

export type BudgetRange =
  | "under_500" | "500_1500" | "1500_5000" | "5000_plus" | "not_sure";

export type LeadStatus =
  | "new" | "contacted" | "qualified" | "proposal_sent" | "closed_won" | "closed_lost";

export const getStartedLead = pgTable(
  "get_started_lead",
  {
    id:          text("id").primaryKey(),

    // ── Contact ──────────────────────────────────────────────────────────────
    fullName:    text("full_name").notNull(),
    email:       text("email").notNull(),
    companyName: text("company_name").notNull(),
    companySize: text("company_size").notNull().$type<CompanySize>(),

    // ── Current stack ────────────────────────────────────────────────────────
    // Comma-separated: "whatsapp,hubspot,google_calendar"
    currentTools: text("current_tools"),

    // ── Pain point ───────────────────────────────────────────────────────────
    painPoint:      text("pain_point").$type<PainPoint>(),
    painPointOther: text("pain_point_other"),   // if painPoint === "other"

    // ── Budget ───────────────────────────────────────────────────────────────
    budget: text("budget").$type<BudgetRange>(),

    // ── Extra context ─────────────────────────────────────────────────────────
    additionalContext: text("additional_context"),

    // ── Internal ─────────────────────────────────────────────────────────────
    status:       text("status").notNull().$type<LeadStatus>().default("new"),
    assignedTo:   text("assigned_to"),
    internalNote: text("internal_note"),

    // ── Timestamps ───────────────────────────────────────────────────────────
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("get_started_lead_email_idx").on(t.email),
    index("get_started_lead_status_idx").on(t.status),
    index("get_started_lead_created_at_idx").on(t.createdAt),
  ],
);
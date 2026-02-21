import { z } from "zod";
import { router, publicProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { getStartedLead } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { nanoid } from "nanoid";

const companySizeEnum = z.enum(["1_10", "11_50", "51_200", "201_plus"]);

const painPointEnum = z.enum([
  "too_many_messages", "manual_scheduling", "data_entry",
  "lead_qualification", "internal_knowledge", "workflow_automation", "other",
]);

const budgetEnum = z.enum([
  "under_500", "500_1500", "1500_5000", "5000_plus", "not_sure",
]);

export const getStartedRouter = router({
  submit: publicProcedure
    .input(z.object({
      fullName:          z.string().min(2).max(120),
      email:             z.string().email(),
      companyName:       z.string().min(1).max(120),
      companySize:       companySizeEnum,
      currentTools:      z.array(z.string()).max(20).optional(),
      painPoint:         painPointEnum.optional(),
      painPointOther:    z.string().max(300).optional(),
      budget:            budgetEnum.optional(),
      additionalContext: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input }: any) => {
      // One submission per email per day
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existing = await db
        .select({ id: getStartedLead.id })
        .from(getStartedLead)
        .where(and(
          eq(getStartedLead.email, input.email.toLowerCase().trim()),
          gte(getStartedLead.createdAt, oneDayAgo),
        ))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You've already submitted today. We'll be in touch shortly.",
        });
      }

      const id = nanoid();
      await db.insert(getStartedLead).values({
        id,
        fullName:          input.fullName.trim(),
        email:             input.email.toLowerCase().trim(),
        companyName:       input.companyName.trim(),
        companySize:       input.companySize,
        currentTools:      input.currentTools?.join(",") ?? null,
        painPoint:         input.painPoint ?? null,
        painPointOther:    input.painPointOther?.trim() ?? null,
        budget:            input.budget ?? null,
        additionalContext: input.additionalContext?.trim() ?? null,
        status:            "new",
      });

      return { success: true, id };
    }),

  list: publicProcedure
    .input(z.object({
      status: z.enum(["new","contacted","qualified","proposal_sent","closed_won","closed_lost"]).optional(),
      limit:  z.number().min(1).max(200).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }: any) => {
      const rows = await db
        .select()
        .from(getStartedLead)
        .where(input.status ? eq(getStartedLead.status, input.status) : undefined)
        .orderBy(getStartedLead.createdAt)
        .limit(input.limit)
        .offset(input.offset);
      return rows;
    }),

  updateStatus: publicProcedure
    .input(z.object({
      id:           z.string(),
      status:       z.enum(["new","contacted","qualified","proposal_sent","closed_won","closed_lost"]),
      assignedTo:   z.string().optional(),
      internalNote: z.string().optional(),
    }))
    .mutation(async ({ input }: any) => {
      const updated = await db
        .update(getStartedLead)
        .set({
          status:       input.status,
          assignedTo:   input.assignedTo ?? null,
          internalNote: input.internalNote ?? null,
          updatedAt:    new Date(),
        })
        .where(eq(getStartedLead.id, input.id))
        .returning({ id: getStartedLead.id });

      if (!updated.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found." });
      }
      return { success: true, id: updated[0]!.id };
    }),
});
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '@/server/trpc';
import { db } from '@/db';
import { demoRequest } from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const serviceInterestEnum = z.enum([
  'communication_ai', 'sales_ai', 'support_ai', 'knowledge_ai',
  'scheduling_ai', 'data_ai', 'automation_ai', 'internal_assistant_ai',
  'decision_support_ai', 'full_platform', 'not_sure',
]);

const demoStatusEnum = z.enum([
  'pending', 'contacted', 'scheduled', 'completed', 'no_show', 'rejected',
]);

export const bookDemoRouter = router({
  submit: publicProcedure
    .input(z.object({
      fullName:        z.string().min(2).max(120),
      email:           z.string().email(),
      phone:           z.string().max(30).optional(),
      companyName:     z.string().max(120).optional(),
      jobTitle:        z.string().max(120).optional(),
      serviceInterest: serviceInterestEnum.optional(),
      message:         z.string().max(2000).optional(),
      referralSource:  z.string().max(200).optional(),
    }))
    .mutation(async ({ input }) => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existing = await db
        .select({ id: demoRequest.id })
        .from(demoRequest)
        .where(and(
          eq(demoRequest.email, input.email.toLowerCase().trim()),
          gte(demoRequest.createdAt, oneDayAgo),
        ))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'A request from this email was already submitted today.',
        });
      }

      const id = nanoid();
      await db.insert(demoRequest).values({
        id,
        fullName:        input.fullName.trim(),
        email:           input.email.toLowerCase().trim(),
        phone:           input.phone?.trim() ?? null,
        companyName:     input.companyName?.trim() ?? null,
        jobTitle:        input.jobTitle?.trim() ?? null,
        serviceInterest: input.serviceInterest ?? null,
        message:         input.message?.trim() ?? null,
        referralSource:  input.referralSource?.trim() ?? null,
        status:          'pending',
      });

      return { success: true, id };
    }),

  list: publicProcedure
    .input(z.object({
      status: demoStatusEnum.optional(),
      limit:  z.number().min(1).max(200).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(demoRequest)
        .where(input.status ? eq(demoRequest.status, input.status) : undefined)
        .orderBy(desc(demoRequest.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

  updateStatus: publicProcedure
    .input(z.object({
      id:           z.string(),
      status:       demoStatusEnum,
      assignedTo:   z.string().optional(),
      internalNote: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const updated = await db
        .update(demoRequest)
        .set({
          status:       input.status,
          assignedTo:   input.assignedTo ?? null,
          internalNote: input.internalNote ?? null,
          updatedAt:    new Date(),
        })
        .where(eq(demoRequest.id, input.id))
        .returning({ id: demoRequest.id });

      if (!updated.length) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Demo request not found.' });
      }

      return { success: true, id: updated[0]!.id };
    }),
});
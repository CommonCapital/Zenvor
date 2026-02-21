"use client";

import { useState } from "react";
import { trpc } from "~/lib/trpc";
import type { inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "~/server";

type SubmitInput = inferRouterInputs<AppRouter>["getStarted"]["submit"];
export type FormStatus = "idle" | "submitting" | "success" | "error";

export function useGetStarted() {
  const [status, setStatus]             = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedId, setSubmittedId]   = useState<string | null>(null);

  const submit = async (data: SubmitInput) => {
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const result = await trpc.getStarted.submit.mutate(data);
      setSubmittedId(result.id);
      setStatus("success");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setErrorMessage(null);
    setSubmittedId(null);
  };

  return { status, errorMessage, submittedId, submit, reset };
}
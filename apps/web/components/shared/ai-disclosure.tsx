"use client";

import * as React from "react";
import { ChevronDown, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { usePreferences } from "@/lib/preferences";

const COPY = {
  analysis:
    "AI-assisted analysis: This result is an informational aid based on the content you submitted. OCR and classification may be inaccurate or incomplete. Review the original evidence and use your judgment. This result does not establish that an incident occurred, identify an offender, or predict future harm.",
  risk: "This score is an experimental review-priority indicator. It is not a probability of crime, danger or future harm. Its values and weights have not been independently validated.",
  ocr: "Extracted text may contain errors. Always compare it with the original image.",
  graph:
    "Suggested relationships indicate content or user-reported similarities. They do not establish that two incidents involve the same person.",
  report:
    "This report includes AI-generated analysis labels. They are informational, may be inaccurate, and are not verified facts or a legal determination.",
} as const;

export type DisclosureVariant = keyof typeof COPY;

export function AiDisclosure({
  variant = "analysis",
  sample = false,
  className,
}: {
  variant?: DisclosureVariant;
  sample?: boolean;
  className?: string;
}) {
  return null;
}

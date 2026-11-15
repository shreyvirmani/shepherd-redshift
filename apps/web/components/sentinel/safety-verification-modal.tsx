"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ShieldAlert, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { VerificationRecord } from "@/lib/types/sentinel";

interface SafetyVerificationModalProps {
  open: boolean;
  verification: VerificationRecord | null;
  onRespond: (response: "safe" | "help_requested" | "cannot_respond", note?: string) => Promise<void>;
}

export function SafetyVerificationModal({
  open,
  verification,
  onRespond,
}: SafetyVerificationModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [totalSeconds, setTotalSeconds] = useState<number>(60);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('shepherd-emergency', open);
    return () => document.body.classList.remove('shepherd-emergency');
  }, [open]);

  useEffect(() => {
    if (!open || !verification) return;

    // Calculate deadline delta
    const deadlineMs = new Date(verification.deadline).getTime();
    const nowMs = Date.now();
    const remaining = Math.max(1, Math.round((deadlineMs - nowMs) / 1000));
    setTotalSeconds(remaining > 0 ? remaining : 60);
    setSecondsRemaining(remaining > 0 ? remaining : 60);

    // Haptic buzz on prompt opening if supported
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([150, 100, 150]);
      } catch {
        // Ignore haptic errors on restricted platforms
      }
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-escalate on timer expiry
          onRespond("cannot_respond", "Safety verification timed out with no user response.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, verification, onRespond]);

  const handleAction = async (response: "safe" | "help_requested" | "cannot_respond") => {
    setSubmitting(true);
    try {
      await onRespond(response);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="fixed inset-0 max-w-none w-full h-full rounded-none flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6"
        style={{ transform: "none" }}
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <ShieldAlert className="size-16 text-amber-500 animate-pulse mb-4" />

        <DialogTitle className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2 text-center">
          Are you okay?
        </DialogTitle>

        <DialogDescription className="text-base text-zinc-600 dark:text-zinc-400 text-center max-w-sm">
          Sentinel detected something unusual. Please respond within {secondsRemaining}s.
        </DialogDescription>

        {/* Countdown Ring (r=48, circumference=301.6) */}
        <div className="relative flex items-center justify-center my-6">
          <svg className="size-36 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="48"
              className="text-zinc-200 dark:text-zinc-800"
              strokeWidth="6"
              stroke="currentColor"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="48"
              className="text-rose-600 transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray={301.6}
              strokeDashoffset={301.6 * (secondsRemaining / Math.max(1, totalSeconds))}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {secondsRemaining}s
            </span>
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">countdown</span>
          </div>
        </div>

        {/* Actions Stack */}
        <div className="w-full max-w-xs sm:max-w-sm space-y-3 mt-2">
          <Button
            type="button"
            className="h-14 min-h-14 w-full bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700 active:scale-[0.99]"
            disabled={submitting}
            onClick={() => handleAction("safe")}
          >
            <CheckCircle2 className="mr-2 size-5" />
            Yes, I&apos;m Safe
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-14 min-h-14 w-full border-zinc-300 text-base font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            disabled={submitting}
            onClick={() => handleAction("cannot_respond")}
          >
            <VolumeX className="mr-2 size-5 text-zinc-500" />
            I Can&apos;t Respond Right Now
          </Button>

          <Button
            type="button"
            className="h-14 min-h-14 w-full bg-rose-600 text-base font-semibold text-white hover:bg-rose-700 active:scale-[0.99]"
            disabled={submitting}
            onClick={() => handleAction("help_requested")}
          >
            <ShieldAlert className="mr-2 size-5" />
            I Need Help
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500 max-w-xs">
          If you do not respond, SHEPHERD will automatically dispatch an emergency rescue relay to your designated SafeCircle contacts.
        </p>
      </DialogContent>
    </Dialog>
  );
}

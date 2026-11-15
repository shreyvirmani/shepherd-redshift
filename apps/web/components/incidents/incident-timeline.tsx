import {
  CalendarClock,
  FileText,
  Pencil,
  ScanSearch,
  UploadCloud,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { categoryLabel } from "@/lib/utils/categories";
import { formatDateTime } from "@/lib/utils/format";
import type {
  Evidence,
  Incident,
  SafetySession,
  ThreatAnalysis,
} from "@/lib/types/api";

interface TimelineEvent {
  id: string;
  at: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "default" | "success" | "info" | "warning";
}

function buildEvents(
  incident: Incident,
  evidence: Evidence[],
  analyses: ThreatAnalysis[],
  sessions: SafetySession[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: "occurred",
      at: incident.occurred_at,
      title: "Incident occurred",
      description:
        incident.location_description || "Time reported by you in the record.",
      icon: CalendarClock,
      tone: "default",
    },
    {
      id: "created",
      at: incident.created_at,
      title: "Record created",
      description: `Saved as ${categoryLabel(incident.category)}.`,
      icon: FileText,
      tone: "default",
    },
  ];

  evidence.forEach((item) => {
    events.push({
      id: `evidence-${item.id}`,
      at: item.uploaded_at,
      title: "Evidence metadata stored",
      description: `${item.file_name} · ${item.size_bytes.toLocaleString()} bytes`,
      icon: UploadCloud,
      tone: "info",
    });
  });

  analyses.forEach((analysis) => {
    events.push({
      id: `analysis-${analysis.analysis_id}`,
      at: analysis.created_at,
      title:
        analysis.status === "completed"
          ? "AI-assisted analysis completed"
          : "AI-assisted analysis failed",
      description:
        analysis.status === "completed"
          ? `${categoryLabel(analysis.classification.label)} · review priority ${analysis.risk.score ?? "—"}`
          : "The analysis did not complete. No result is claimed.",
      icon: ScanSearch,
      tone: analysis.status === "completed" ? "success" : "warning",
    });
  });

  sessions.forEach((session) => {
    events.push({
      id: `session-${session.id}`,
      at: session.created_at,
      title: "Safety session created",
      description: `Deadline ${formatDateTime(session.checkin_deadline)} · ${session.status.replaceAll("_", " ")}`,
      icon: Users,
      tone: "info",
    });
    if (session.checked_in_at) {
      events.push({
        id: `session-checkin-${session.id}`,
        at: session.checked_in_at,
        title: "Checked in as safe",
        description: "A check-in was recorded for this safety session.",
        icon: Users,
        tone: "success",
      });
    }
  });

  if (
    Date.parse(incident.updated_at) - Date.parse(incident.created_at) >
    60_000
  ) {
    events.push({
      id: "updated",
      at: incident.updated_at,
      title: "Record updated",
      description: "Incident details were edited.",
      icon: Pencil,
      tone: "default",
    });
  }

  return events.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

const TONE_STYLES: Record<TimelineEvent["tone"], string> = {
  default: "border-[#F0DCE5] bg-card text-[#81717A]",
  success: "border-[#36866B]/20 bg-[#36866B]/10 text-[#36866B]",
  info: "border-[#6587B7]/20 bg-[#6587B7]/10 text-[#6587B7]",
  warning: "border-[#D69A3D]/20 bg-[#D69A3D]/10 text-[#D69A3D]",
};

export function IncidentTimeline({
  incident,
  evidence,
  analyses,
  sessions,
}: {
  incident: Incident;
  evidence: Evidence[];
  analyses: ThreatAnalysis[];
  sessions: SafetySession[];
}) {
  const events = buildEvents(incident, evidence, analyses, sessions);

  return (
    <ol className="relative space-y-4 pl-1">
      {events.map((event, index) => {
        const Icon = event.icon;
        return (
          <li key={event.id} className="relative flex gap-3">
            {index < events.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute left-[15px] top-8 h-[calc(100%+4px)] w-px bg-border"
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                TONE_STYLES[event.tone],
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <p className="text-xs font-medium text-foreground">{event.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {event.description}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground/80">
                {formatDateTime(event.at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

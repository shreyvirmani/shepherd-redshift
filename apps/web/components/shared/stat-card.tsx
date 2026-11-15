import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const content = (
    <Card
      className={cn(
        "group h-full transition-all duration-200 border-[#F0DCE5] bg-white hover:border-[#DF8EAF] hover:shadow-[0_4px_16px_rgba(198,93,137,0.08)]",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#81717A]">
            {label}
          </p>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#F0DCE5] bg-[#FFF4F7] text-[#C65D89] transition-colors group-hover:bg-[#FCE7EF] group-hover:text-[#A74773]">
            {icon}
          </span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight tabular-nums text-[#30212A]">
            {value}
          </p>
          {href ? (
            <ArrowUpRight className="mb-0.5 size-4 text-[#DF8EAF] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C65D89]" />
          ) : null}
        </div>
        {hint ? (
          <p className="mt-2 text-xs leading-relaxed text-[#81717A]">
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="block h-full rounded-xl">
      {content}
    </Link>
  ) : (
    content
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const alertVariants = cva(
  "relative flex w-full gap-3 rounded-lg border px-4 py-3.5 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        muted: "border-border bg-muted/60 text-foreground",
        info: "border-[#6587B7]/25 bg-[#6587B7]/10 text-[#6587B7] [&>svg]:text-[#6587B7]",
        success:
          "border-[#36866B]/25 bg-[#36866B]/10 text-[#36866B] [&>svg]:text-[#36866B]",
        warning:
          "border-[#D69A3D]/25 bg-[#D69A3D]/10 text-[#D69A3D] [&>svg]:text-[#D69A3D]",
        destructive:
          "border-[#D94B5B]/25 bg-[#D94B5B]/10 text-[#D94B5B] [&>svg]:text-[#D94B5B]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("text-sm font-semibold leading-snug", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm leading-relaxed opacity-90", className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };

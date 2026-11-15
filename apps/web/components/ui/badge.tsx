import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide [&>svg]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-linear-to-r from-[#C65D89] to-[#DF8EAF] text-white",
        secondary: "border-transparent bg-[#FCE7EF] text-[#873B60]",
        outline: "border-[#F0DCE5] bg-card text-[#30212A]",
        muted: "border-transparent bg-[#FFF4F7] text-[#81717A]",
        destructive: "border-[#D94B5B]/20 bg-[#D94B5B]/10 text-[#D94B5B]",
        success: "border-[#36866B]/20 bg-[#36866B]/10 text-[#36866B]",
        warning: "border-[#D69A3D]/20 bg-[#D69A3D]/10 text-[#D69A3D]",
        info: "border-[#6587B7]/20 bg-[#6587B7]/10 text-[#6587B7]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-r from-[#C65D89] to-[#DF8EAF] text-white shadow-[0_2px_8px_rgba(198,93,137,0.22)] hover:from-[#A74773] hover:to-[#C65D89] active:translate-y-px font-medium",
        secondary:
          "bg-[#FCE7EF] text-[#873B60] hover:bg-[#F3B7CD]/60 active:translate-y-px font-medium",
        outline:
          "border border-[#F0DCE5] bg-card text-[#30212A] shadow-[0_1px_2px_rgba(48,33,42,0.04)] hover:bg-[#FFF4F7] hover:border-[#DF8EAF]/50 active:translate-y-px",
        ghost: "text-[#30212A] hover:bg-[#FFF4F7] hover:text-[#C65D89]",
        destructive:
          "bg-[#D94B5B] text-white shadow-[0_2px_8px_rgba(217,75,91,0.22)] hover:bg-[#c23b49] active:translate-y-px",
        link: "text-[#C65D89] underline-offset-4 hover:underline hover:text-[#A74773]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-5",
        icon: "size-9 rounded-lg",
        "icon-sm": "size-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

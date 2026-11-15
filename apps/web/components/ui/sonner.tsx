"use client";

import { Toaster as SonnerToaster } from "sonner";

function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-lg !border !border-[#F0DCE5] !bg-card !text-foreground !shadow-[0_16px_40px_-16px_rgba(56,32,47,0.18)]",
          title: "!text-sm !font-semibold",
          description: "!text-sm !text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
          closeButton: "!border-[#F0DCE5] !bg-card",
          success: "!border-[#36866B]/30",
          error: "!border-[#D94B5B]/30",
          warning: "!border-[#D69A3D]/30",
        },
      }}
    />
  );
}

export { Toaster };

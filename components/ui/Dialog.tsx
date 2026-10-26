"use client";

import * as RD from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function Dialog({
  open, onOpenChange, title, description, children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className="fixed inset-0 z-40 bg-black/70 data-[state=open]:animate-[fade-in_200ms_ease-out]" />
        <RD.Content className="fixed z-50 left-1/2 top-1/2 w-[calc(100vw-32px)] max-w-md max-h-[90dvh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 glass-strong rounded-[22px] p-5 data-[state=open]:animate-[pop-in_250ms_cubic-bezier(0.22,1,0.36,1)]">
          <div className="flex items-start justify-between gap-4 mb-3">
            <RD.Title className="text-[17px] font-semibold">{title}</RD.Title>
            <RD.Close aria-label="Tutup" className="min-h-11 min-w-11 -m-2 grid place-items-center text-muted cursor-pointer">
              <X size={18} strokeWidth={1.75} />
            </RD.Close>
          </div>
          {description ? <RD.Description className="text-ink-2 text-[15px] mb-4">{description}</RD.Description> : <RD.Description className="sr-only">{title}</RD.Description>}
          {children}
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
}

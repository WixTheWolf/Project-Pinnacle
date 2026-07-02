"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-0">
      <button
        className="flex w-full items-center justify-between py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-medium">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 pb-4" : "max-h-0"
        )}
      >
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

export function Accordion({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-border rounded-2xl border border-border bg-card px-5">{children}</div>;
}

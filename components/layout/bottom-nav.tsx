"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Heart,
  Sun,
  Target,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";

const iconMap = {
  Sun,
  Target,
  Heart,
  BarChart3,
  Trophy,
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md pb-safe"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-colors",
                isActive ? "text-accent-gold" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-accent-gold/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="relative h-5 w-5" aria-hidden="true" />
              <span className="relative text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

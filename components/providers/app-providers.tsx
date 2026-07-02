"use client";

import { PinnacleProvider } from "@/hooks/use-pinnacle-data";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return <PinnacleProvider>{children}</PinnacleProvider>;
}

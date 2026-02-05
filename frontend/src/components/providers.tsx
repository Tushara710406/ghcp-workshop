"use client";

import { QueryProvider } from "@/components/query-provider";
import { DarkModeProvider } from "@/hooks/use-dark-mode";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DarkModeProvider>
      <QueryProvider>
        <Toaster />
        {children}
      </QueryProvider>
    </DarkModeProvider>
  );
}

"use client";

import { useEffect } from "react";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { TagColorProvider } from "@/contexts/TagColorContext";
import { NotesProvider } from "@/contexts/NotesContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

function ThemeApplier() {
  const { settings } = useSettings();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);
  return null;
}

function InnerProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeApplier />
      {children}
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <TagColorProvider>
        <NotesProvider>
          <TooltipProvider delay={400}>
            <InnerProviders>{children}</InnerProviders>
          </TooltipProvider>
        </NotesProvider>
      </TagColorProvider>
    </SettingsProvider>
  );
}

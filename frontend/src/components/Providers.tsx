"use client";

import { useEffect } from "react";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
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
      <InnerProviders>{children}</InnerProviders>
    </SettingsProvider>
  );
}

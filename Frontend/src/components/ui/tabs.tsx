"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(
  undefined,
);

/**
 * Composant conteneur racine pour la bascule d'onglets (Tabs).
 *
 * @param props Valeur par défaut, valeur active, callback de changement et enfants
 */
export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [selectedTab, setSelectedTab] = React.useState(
    value || defaultValue || "",
  );

  const activeTab = value !== undefined ? value : selectedTab;

  const setActiveTab = React.useCallback(
    (val: string) => {
      if (value === undefined) {
        setSelectedTab(val);
      }
      onValueChange?.(val);
    },
    [value, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

/**
 * Composant de liste enveloppante des boutons d'onglets (TabsList).
 */
export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground w-full sm:w-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Composant de bouton d'onglet individuel (TabsTrigger).
 */
export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer flex-1 sm:flex-initial",
        isActive
          ? "bg-background text-foreground shadow-xs font-semibold"
          : "hover:text-foreground hover:bg-background/50",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * Composant de panneau de contenu associé à un onglet (TabsContent).
 */
export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return (
    <div
      className={cn(
        "mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-50 duration-150",
        className,
      )}
    >
      {children}
    </div>
  );
}

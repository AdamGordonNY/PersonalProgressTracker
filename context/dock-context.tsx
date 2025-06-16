// src/context/dock-context.tsx
"use client";

import { createContext, useContext } from "react";

export type DockItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
};

interface DockContextType {
  items: DockItem[];
}

const DockContext = createContext<DockContextType | undefined>(undefined);

export function DockProvider({
  children,
  items,
}: {
  children: React.ReactNode;
  items: DockItem[];
}) {
  return (
    <DockContext.Provider value={{ items }}>{children}</DockContext.Provider>
  );
}

export function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error("useDock must be used within a DockProvider");
  }
  return context;
}

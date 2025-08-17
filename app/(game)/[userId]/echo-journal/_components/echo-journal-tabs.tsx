"use client";

import { ReactNode } from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";

import { Tabs } from "@/components/ui/tabs";

const tabs = ["map", "sessions", "shop", "lore"] as const;
type Tabs = (typeof tabs)[number];

const EchoJournalTabs = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(tabs).withDefault("map")
  );

  const onValueChange = (value: string) => {
    setActiveTab(value as Tabs);
  };
  return (
    <Tabs value={activeTab} onValueChange={onValueChange} className="space-y-6">
      {children}
    </Tabs>
  );
};

export default EchoJournalTabs;

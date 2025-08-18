import type React from "react";

import { cn } from "@/lib/utils";

interface CosmicTableProps {
  children: React.ReactNode;
  className?: string;
}

export function CosmicTable({ children, className }: CosmicTableProps) {
  return (
    <div className="my-8 overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-game-dark/50 to-game-accent/20">
      <table className={cn("w-full border-collapse", className)}>
        {children}
      </table>
    </div>
  );
}

interface CosmicTableHeaderProps {
  children: React.ReactNode;
}

export function CosmicTableHeader({ children }: CosmicTableHeaderProps) {
  return (
    <thead className="bg-gradient-to-r from-primary/20 to-game-accent/30 border-b border-primary/30">
      {children}
    </thead>
  );
}

interface CosmicTableBodyProps {
  children: React.ReactNode;
}

export function CosmicTableBody({ children }: CosmicTableBodyProps) {
  return <tbody>{children}</tbody>;
}

interface CosmicTableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function CosmicTableRow({ children, className }: CosmicTableRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-primary/10 hover:bg-primary/5 transition-colors duration-200",
        className
      )}
    >
      {children}
    </tr>
  );
}

interface CosmicTableCellProps {
  children: React.ReactNode;
  header?: boolean;
  className?: string;
}

export function CosmicTableCell({
  children,
  header = false,
  className,
}: CosmicTableCellProps) {
  const Component = header ? "th" : "td";

  return (
    <Component
      className={cn(
        "px-6 py-4 text-left",
        header
          ? "font-semibold text-primary text-sm uppercase tracking-wider"
          : "text-muted-foreground",
        className
      )}
    >
      {children}
    </Component>
  );
}

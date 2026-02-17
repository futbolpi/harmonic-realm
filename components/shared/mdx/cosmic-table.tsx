"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

// ─── Context ────────────────────────────────────────────────────────────────

interface CosmicTableCtx {
  headers: string[];
  setHeaders: (h: string[]) => void;
  isInHeader: boolean;
  setIsInHeader: (v: boolean) => void;
}

const CosmicTableContext = createContext<CosmicTableCtx>({
  headers: [],
  setHeaders: () => {},
  isInHeader: false,
  setIsInHeader: () => {},
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Recursively extract the plain-text string from React children. */
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return extractText((node.props as any).children);
  }
  return "";
}

/** Walk the header children tree and collect all CosmicTableCell header texts. */
function collectHeaders(children: React.ReactNode): string[] {
  const result: string[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = child.props as any;

    if (props?.header === true) {
      // This is a header cell — capture its text
      result.push(extractText(props.children));
    } else if (props?.children) {
      // Recurse into rows / other wrappers
      result.push(...collectHeaders(props.children));
    }
  });

  return result;
}

// ─── CosmicTable ─────────────────────────────────────────────────────────────

interface CosmicTableProps {
  children: React.ReactNode;
  className?: string;
}

export function CosmicTable({ children, className }: CosmicTableProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [isInHeader, setIsInHeader] = useState(false);

  return (
    <CosmicTableContext.Provider
      value={{ headers, setHeaders, isInHeader, setIsInHeader }}
    >
      <div
        className={cn(
          "my-8 overflow-hidden rounded-lg border border-primary/20",
          "bg-linear-to-br from-card/80 to-card/40",
          className,
        )}
      >
        {/* Desktop: real <table>. Mobile: block layout (cards). */}
        <table className="w-full border-collapse">{children}</table>
      </div>
    </CosmicTableContext.Provider>
  );
}

// ─── CosmicTableHeader ───────────────────────────────────────────────────────

interface CosmicTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CosmicTableHeader({
  children,
  className,
}: CosmicTableHeaderProps) {
  const { setHeaders, setIsInHeader } = useContext(CosmicTableContext);

  // Extract header labels once on mount so body rows can use them
  const capturedRef = useRef(false);
  useEffect(() => {
    if (capturedRef.current) return;
    capturedRef.current = true;
    const labels = collectHeaders(children);
    if (labels.length) setHeaders(labels);
  }, [children, setHeaders]);

  return (
    <thead
      className={cn(
        // Hidden on mobile; shown as normal header on sm+
        "hidden sm:table-header-group",
        "bg-linear-to-r from-primary/20 to-secondary/10 border-b border-primary/30",
        className,
      )}
      onMouseEnter={() => setIsInHeader(true)}
      onMouseLeave={() => setIsInHeader(false)}
    >
      {children}
    </thead>
  );
}

// ─── CosmicTableBody ─────────────────────────────────────────────────────────

interface CosmicTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CosmicTableBody({ children, className }: CosmicTableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

// ─── CosmicTableRow ──────────────────────────────────────────────────────────

interface CosmicTableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function CosmicTableRow({ children, className }: CosmicTableRowProps) {
  const { headers } = useContext(CosmicTableContext);

  // Collect the direct cell children so we can zip them with headers
  const cells = React.Children.toArray(children);

  return (
    <>
      {/* ── Mobile card (hidden on sm+) ─────────────────────────────── */}
      <tr className="sm:hidden border-0">
        <td
          colSpan={100}
          className="px-0 py-2 first:pt-0 last:pb-0 border-0 align-top"
        >
          <div
            className={cn(
              "mx-3 my-1.5 rounded-lg border border-primary/15",
              "bg-linear-to-br from-card/60 to-card/30",
              "divide-y divide-primary/10",
              className,
            )}
          >
            {cells.map((cell, idx) => {
              if (!React.isValidElement(cell)) return null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const cellProps = cell.props as any;
              const label = headers[idx];
              const value = cellProps.children;

              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 px-4 py-3 first:pt-3.5 last:pb-3.5"
                >
                  {label && (
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-primary pt-0.5 min-w-20">
                      {label}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground leading-relaxed flex-1 min-w-0">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </td>
      </tr>

      {/* ── Desktop row (hidden on mobile) ──────────────────────────── */}
      <tr
        className={cn(
          "hidden sm:table-row",
          "border-b border-primary/10 last:border-0",
          "hover:bg-primary/5 transition-colors duration-200",
          className,
        )}
      >
        {children}
      </tr>
    </>
  );
}

// ─── CosmicTableCell ─────────────────────────────────────────────────────────

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
        "px-5 py-3.5 text-left align-top",
        header
          ? "font-semibold text-primary text-xs uppercase tracking-wider whitespace-nowrap"
          : "text-muted-foreground text-sm leading-relaxed",
        className,
      )}
    >
      {children}
    </Component>
  );
}

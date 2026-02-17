import Link from "next/link";
import type React from "react";
import {
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  LucideProps,
} from "lucide-react";
import type { MDXComponents } from "mdx/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "@/components/shared/mdx/video-player";

// Custom components for MDX
const components = {
  // Headings
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl neon-text mb-8",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 mt-12 mb-6",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-3",
        className,
      )}
      {...props}
    />
  ),

  // Paragraphs and text
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(
        "leading-7 not-first:mt-6 text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),

  // Lists
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("my-6 ml-6 list-disc space-y-2", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn("my-6 ml-6 list-decimal space-y-2", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <li className={cn("text-muted-foreground", className)} {...props} />
  ),

  // Links
  a: ({
    className,
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href?.startsWith("http");
    const Component = isExternal ? "a" : Link;

    return (
      <Component
        href={href || "#"}
        className={cn(
          "font-medium text-primary underline underline-offset-4 hover:text-primary/80 inline-flex items-center gap-1",
          className,
        )}
        {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
        {...props}
      >
        {children}
        {isExternal && <ExternalLink className="h-3 w-3" />}
      </Component>
    );
  },

  // Code
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className,
      )}
      {...props}
    />
  ),

  // Blockquotes
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn("mt-6 border-l-2 border-primary pl-6 italic", className)}
      {...props}
    />
  ),

  // Tables
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn("w-full", className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn("m-0 border-t p-0 even:bg-muted", className)}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        "border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        "border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),

  // Custom components
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Separator,

  // Alert components
  InfoAlert: ({ children }: { children: React.ReactNode }) => (
    <Alert className="my-6 border-blue-500/50 bg-blue-500/10">
      <Info className="h-4 w-4 text-blue-500" />
      <AlertDescription className="text-blue-200">{children}</AlertDescription>
    </Alert>
  ),

  WarningAlert: ({ children }: { children: React.ReactNode }) => (
    <Alert className="my-6 border-yellow-500/50 bg-yellow-500/10">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="text-yellow-200">
        {children}
      </AlertDescription>
    </Alert>
  ),

  SuccessAlert: ({ children }: { children: React.ReactNode }) => (
    <Alert className="my-6 border-green-500/50 bg-green-500/10">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <AlertDescription className="text-green-200">{children}</AlertDescription>
    </Alert>
  ),

  // Feature card component
  FeatureCard: ({
    icon: Icon,
    title,
    description,
    color = "text-primary",
  }: {
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
    title: string;
    description: string;
    color?: string;
  }) => (
    <Card className="game-card my-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  ),

  // Cosmic-themed components for HarmonicRealm lore
  CosmicAlert: ({ children }: { children: React.ReactNode }) => (
    <Alert className="my-6 border-primary/50 bg-primary/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-neon-purple/5" />
      <Sparkles className="h-4 w-4 text-primary relative z-10" />
      <AlertDescription className="text-primary-foreground relative z-10">
        {children}
      </AlertDescription>
    </Alert>
  ),

  LatticeCard: ({
    icon: Icon,
    title,
    description,
    color = "text-primary",
  }: {
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
    title: string;
    description: string;
    color?: string;
  }) => (
    <Card className="game-card my-6 relative overflow-hidden group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-3">
          <Icon
            className={`h-6 w-6 ${color} group-hover:scale-110 transition-transform duration-300`}
          />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  ),

  // Cosmic Table Components
  CosmicTable: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-8 overflow-hidden rounded-lg border border-primary/20 bg-linear-to-br from-game-dark/50 to-game-accent/20">
      <table className={cn("w-full border-collapse", className)} {...props} />
    </div>
  ),

  CosmicTableHeader: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead
      className={cn(
        "bg-linear-to-r from-primary/20 to-game-accent/30 border-b border-primary/30",
        className,
      )}
      {...props}
    />
  ),

  CosmicTableBody: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className={className} {...props} />
  ),

  CosmicTableRow: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn(
        "border-b border-primary/10 hover:bg-primary/5 transition-colors duration-200",
        className,
      )}
      {...props}
    />
  ),

  CosmicTableCell: ({
    className,
    header = false,
    ...props
  }: React.HTMLAttributes<HTMLTableCellElement> & { header?: boolean }) => {
    const Component = header ? "th" : "td";

    return (
      <Component
        className={cn(
          "px-6 py-4 text-left",
          header
            ? "font-semibold text-primary text-sm uppercase tracking-wider"
            : "text-muted-foreground",
          className,
        )}
        {...props}
      />
    );
  },

  // Video Player
  VideoPlayer,
} satisfies MDXComponents;

export { components };

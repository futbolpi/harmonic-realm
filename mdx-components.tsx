import type { MDXComponents } from "mdx/types";

import { components as customizedComponents } from "@/components/shared/mdx/mdx-components";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...customizedComponents,
    ...components,
  };
}

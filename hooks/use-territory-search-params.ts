"use client";

import { useQueryStates } from "nuqs";
import { useTransition } from "react";

import {
  territorySearchParamsParsers,
  territorySearchParamsUrlKeys,
} from "@/app/(game)/territories/search-params";

export function useTerritorySearchParams() {
  const [isLoading, startTransition] = useTransition();

  const [searchParams, updateSearchParams] = useQueryStates(
    territorySearchParamsParsers,
    { urlKeys: territorySearchParamsUrlKeys, startTransition }
  );

  return { searchParams, updateSearchParams, isLoading };
}

"use client";

import { useQueryStates } from "nuqs";
import { useTransition } from "react";

import {
  mapSearchParamsParsers,
  mapSearchParamsUrlKeys,
} from "@/app/(game)/(geo-needed)/map/search-params";

export function useMapSearchParams() {
  const [isLoading, startTransition] = useTransition();

  const [searchParams, updateSearchParams] = useQueryStates(
    mapSearchParamsParsers,
    {
      urlKeys: mapSearchParamsUrlKeys,
      startTransition,
    }
  );

  return { searchParams, updateSearchParams, isLoading };
}

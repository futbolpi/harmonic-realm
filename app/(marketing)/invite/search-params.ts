import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const searchParamsParsers = {
  ref: parseAsString,
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);

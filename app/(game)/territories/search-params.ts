import {
  createSearchParamsCache,
  parseAsString,
  type UrlKeys,
} from "nuqs/server";

export const territorySearchParamsParsers = {
  hex: parseAsString,
};

export const territorySearchParamsUrlKeys: UrlKeys<
  typeof territorySearchParamsParsers
> = {
  hex: "hex",
};

export const searchParamsCache = createSearchParamsCache(
  territorySearchParamsParsers,
  { urlKeys: territorySearchParamsUrlKeys }
);

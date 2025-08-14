import {
  createSearchParamsCache,
  parseAsFloat,
  parseAsStringEnum,
  parseAsStringLiteral,
  type UrlKeys,
  parseAsString,
  parseAsBoolean,
} from "nuqs/server";

import { NodeTypeRarity } from "@/lib/generated/prisma/enums";

export const sortBy = ["distance", "rarity", "yield", "name"] as const;
export type SortBy = (typeof sortBy)[number];

export const mapSearchParamsParsers = {
  // Use human-readable variable names throughout your codebase
  latitude: parseAsFloat,
  longitude: parseAsFloat,
  rarityFilter: parseAsStringEnum<NodeTypeRarity>(
    Object.values(NodeTypeRarity)
  ),
  // Then pass it to the parser
  sortBy: parseAsStringLiteral(sortBy).withDefault("distance"),
  nodeTypeFilter: parseAsString,
  openOnlyFilter: parseAsBoolean,
  sponsoredFilter: parseAsBoolean,
};

export const mapSearchParamsUrlKeys: UrlKeys<typeof mapSearchParamsParsers> = {
  // Remap them to read from shorter keys in the URL
  latitude: "lat",
  longitude: "lng",
  sortBy: "sort",
  rarityFilter: "rarity",
  nodeTypeFilter: "type",
  openOnlyFilter: "open",
  sponsoredFilter: "sponsored",
};

export const searchParamsCache = createSearchParamsCache(
  mapSearchParamsParsers,
  {
    urlKeys: mapSearchParamsUrlKeys,
  }
);

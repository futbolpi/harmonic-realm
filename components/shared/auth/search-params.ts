import {
  createSearchParamsCache,
  type UrlKeys,
  parseAsString,
} from "nuqs/server";

export const defaultRedirect = "/dashboard";

export const authSearchParamsParsers = {
  // Use human-readable variable names throughout your codebase
  redirect: parseAsString.withDefault(defaultRedirect),
  referral: parseAsString,
};

export const authSearchParamsUrlKeys: UrlKeys<typeof authSearchParamsParsers> =
  {
    // Remap them to read from shorter keys in the URL
    referral: "ref",
  };

export const authSearchParamsCache = createSearchParamsCache(
  authSearchParamsParsers,
  {
    urlKeys: authSearchParamsUrlKeys,
  }
);

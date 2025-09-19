import { redirect } from "next/navigation";

import { siteConfig } from "@/config/site";

export default function TwitterRedirect() {
  return redirect(siteConfig.links.twitter);
}

import { redirect } from "next/navigation";

import { siteConfig } from "@/config/site";

export default function GithubRedirect() {
  return redirect(siteConfig.links.github);
}

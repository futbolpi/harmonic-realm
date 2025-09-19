import { redirect } from "next/navigation";

import { siteConfig } from "@/config/site";

export default function TelegramRedirect() {
  return redirect(siteConfig.links.telegram);
}

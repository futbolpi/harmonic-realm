"use server";

import { InngestEventDispatcher } from "@/inngest/dispatcher";

export async function reportError(error: Error & { digest?: string }) {
  const content = `<b>Site Error Report</b> ⚠️
  
  <b>Message:</b> ${error?.message ?? ""}
  <b>Name:</b> ${error?.name ?? ""}
  <b>Stack:</b> <pre>${error?.stack ?? ""}</pre>
  <b>Digest:</b> ${error?.digest ?? ""}
  
  Thank you for helping us improve MitiMara!
  `;

  try {
    await InngestEventDispatcher.sendHeraldAnnouncement(content, "bug");
  } catch (error) {
    console.error("SEND_ERROR_MESSAGE", error);
  }
}

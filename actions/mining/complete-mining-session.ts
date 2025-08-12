"use server";

import { CompleteMiningRequest } from "@/lib/schema/mining-session";

export const completeMiningSession = async (params: CompleteMiningRequest) => {
  console.log(params);
};

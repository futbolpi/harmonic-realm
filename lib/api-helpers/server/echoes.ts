import prisma from "@/lib/prisma";
import { EchoTransmissionType } from "@/lib/schema/echo";

export const getUserEchoTransmission = async (
  userId: string
): Promise<EchoTransmissionType> => {
  // Get user's Echo Transmission
  let echoTransmission = await prisma.echoTransmission.findUnique({
    where: { userId },
  });

  // Create default if doesn't exist
  if (!echoTransmission) {
    echoTransmission = await prisma.echoTransmission.create({
      data: {
        userId,
        chargeLevel: 0,
        status: "EXPIRED",
        usedNodeIds: [],
        maxTimeReduction: 25, // Default 25%
      },
    });
  }

  // Check if expired
  if (echoTransmission.expiresAt && new Date() > echoTransmission.expiresAt) {
    echoTransmission = await prisma.echoTransmission.update({
      where: { userId },
      data: { status: "EXPIRED" },
    });
  }
  return echoTransmission;
};

import { siteConfig } from "@/config/site";

export const PIONEERSCALE = 0.001;

export const getTotalMainnetKYCPioneers = () => {
  if (siteConfig.network === "testnet") {
    return 100000;
  }
  // should call api
  return 12000000;
};

export const getNumberOfPhaseNodes = (gamePhase: number) => {
  const effectivePioneers = getTotalMainnetKYCPioneers();
  const baseNodes = Math.max(
    1000,
    Math.floor(effectivePioneers / (1000 * Math.log2(gamePhase + 1)))
  ); // Soft decay, min 1000

  // Bonus: From prior phase sessions (e.g., query total completed sessions)
  // const priorSessions = await prisma.miningSession.count({
  //   where: { status: "COMPLETED", phaseId: gamePhase - 1 },
  // }); // Assume phaseId in model
  // const bonusNodes = Math.floor(priorSessions / 100000) * (baseNodes * 0.1); // +10% per 100k, cap 50%
  // const totalBonus = Math.min(bonusNodes, baseNodes * 0.5);

  return baseNodes;
};

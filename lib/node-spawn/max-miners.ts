import { NodeTypeRarity } from "../generated/prisma/enums";

export interface MaxMinerInputs {
  rarity: NodeTypeRarity;
  localPioneerCount: number; // recent active unique users in cell
  usageIndex: number; // 0..1 (recent load)
  festivalActive: boolean;
  spawnWindowActive: boolean;
  uniqueParties: number; // distinct co-mining parties detected now
  beaconLinks: number; // adjacent allied beacons controlled 0..6
}

const rarityScore: Record<NodeTypeRarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 6,
  Epic: 12,
  Legendary: 24,
};

const BASE_UNIT = 5; // miners per rarity score
const MIN_CAP = 4;
const MAX_CAP = 60;

const DENSITY_FACTOR = 20; // higher = slower density boost
const OVERUSE_K = 0.15;
const UNDERUSE_K = 0.1;

const PARTY_K = 2; // miners added per unique party
const RESONANCE_CAP = 5; // max parties counted

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function baselineByRarity(r: NodeTypeRarity) {
  return BASE_UNIT * rarityScore[r];
}

function densityBoost(localPioneerCount: number) {
  return Math.floor(Math.sqrt(localPioneerCount) / DENSITY_FACTOR);
}

function usageElasticity(usageIndex: number) {
  const u = clamp(usageIndex, 0, 1);
  return 1 - OVERUSE_K * u + UNDERUSE_K * (1 - u);
}

function eventMultiplier(spawnWindowActive: boolean, festivalActive: boolean) {
  if (festivalActive) return 1.3;
  if (spawnWindowActive) return 1.15;
  return 1.0;
}

function resonanceBonus(uniqueParties: number) {
  const parties = clamp(uniqueParties, 0, RESONANCE_CAP);
  return parties * PARTY_K;
}

function territoryMultiplier(beaconLinks: number) {
  const links = clamp(beaconLinks, 0, 6);
  return 1 + links * 0.03; // +3% per link
}

export function computeMaxMiners(input: MaxMinerInputs): number {
  // 1) Rarity baseline
  let cap = baselineByRarity(input.rarity);

  // 2) Density augmentation
  cap += densityBoost(input.localPioneerCount);

  // 3) Usage elasticity
  cap = Math.round(cap * usageElasticity(input.usageIndex));

  // 4) Event-phase multiplier
  cap = Math.round(
    cap * eventMultiplier(input.spawnWindowActive, input.festivalActive)
  );

  // 5) Territory multiplier
  cap = Math.round(cap * territoryMultiplier(input.beaconLinks));

  // 6) Resonance additive bonus
  cap += resonanceBonus(input.uniqueParties);

  // Final clamp
  return clamp(cap, MIN_CAP, MAX_CAP);
}

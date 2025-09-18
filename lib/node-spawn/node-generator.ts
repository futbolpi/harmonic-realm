import * as turf from "@turf/turf";
import { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import Decimal from "decimal.js";
import { promises as fs } from "fs";

import { NodeTypeRarity } from "../generated/prisma/enums";
import { NodeCreateManyInput } from "../generated/prisma/models";
import { redis } from "../redis";
import { generateLore, getRarityElements } from "./generate-lore";
import { BIN_SIZE } from "./region-metrics";

type GlobalCache = {
  pi_digits: string | null;
  land_geojson: FeatureCollection<MultiPolygon | Polygon> | null;
};

type GenerateNodesParams = {
  phaseId: number;
  batch: number;
  currentBatchSize: number;
  adaptive: boolean;
  binActivities?: { binId: string; activity: number }[];
  rarityToIdMap: Record<NodeTypeRarity, string>;
};

// In-memory cache
const globalCache: GlobalCache = { pi_digits: null, land_geojson: null };

// Math helper
const getDegrees = (rad: number) => rad * (180 / Math.PI);

// Memoized factorial for Decimal
const factorials: Decimal[] = [new Decimal(1)];
function getFactorial(n: number): Decimal {
  if (n < 0) return new Decimal(0);
  while (factorials.length <= n) {
    const next = factorials[factorials.length - 1].mul(factorials.length);
    factorials.push(next);
  }
  return factorials[n];
}

// Chudnovsky algorithm for Pi digits using Decimal.js
export async function computePiDigits(digits: number): Promise<string> {
  Decimal.set({ precision: digits + 10 });
  let pi = new Decimal(0);
  const iterations = Math.ceil(digits / 14) + 1; // ~14 digits per iter
  for (let k = 0; k < iterations; k++) {
    const Mk = getFactorial(6 * k).div(
      getFactorial(3 * k).mul(getFactorial(k).pow(3))
    );
    const Lk = new Decimal(545140134 * k + 13591409);
    const Xk = new Decimal(-262537412640768000).pow(k);
    pi = pi.add(Mk.mul(Lk).div(Xk));
  }
  const C = new Decimal(1).div(
    new Decimal(426880).mul(new Decimal(10005).sqrt())
  );
  pi = C.mul(pi);
  return pi.toFixed(digits).slice(2); // Digits after decimal
}

// Cached getPiDigits
async function getPiDigits(): Promise<string> {
  const cacheKey = "pi_digits";
  // Memory check
  if (globalCache[cacheKey]) {
    return globalCache[cacheKey];
  }
  // Redis check
  const redisValue = await redis.get<string>(cacheKey);
  if (redisValue) {
    globalCache[cacheKey] = redisValue;
    return redisValue;
  }
  // Compute and store
  const file = await fs.readFile(
    process.cwd() + "/contents/assets/pidigits.txt",
    "utf8"
  );
  const digits = file.slice(2);
  globalCache[cacheKey] = digits;
  await redis.set(cacheKey, digits); // Optional TTL: await redis.set(cacheKey, digits, { ex: 86400 });
  return digits;
}

// Pi-seeded point
export async function piSeededPoint(
  offset: number
): Promise<{ lat: number; lng: number }> {
  const digits = await getPiDigits();

  const chunkSize = 10;
  offset = offset % (digits.length - chunkSize * 2); // Wrap if overflow
  const lngFrac = parseInt(digits.slice(offset, offset + chunkSize), 10) / 1e10;
  const latFrac =
    parseInt(digits.slice(offset + chunkSize, offset + 2 * chunkSize), 10) /
    1e10;
  const lng = lngFrac * 360 - 180;
  const lat = getDegrees(Math.asin(latFrac * 2 - 1));
  return { lat, lng };
}

// Cached loadLandGeoJson
async function loadLandGeoJson(): Promise<
  FeatureCollection<MultiPolygon | Polygon>
> {
  const cacheKey = "land_geojson";
  // Memory check
  if (globalCache[cacheKey]) {
    return globalCache[cacheKey];
  }
  // Redis check
  const redisValue = await redis.get<string>(cacheKey);
  if (redisValue) {
    const parsed = JSON.parse(redisValue) as FeatureCollection<
      MultiPolygon | Polygon
    >;
    globalCache[cacheKey] = parsed;
    return parsed;
  }
  // Load and store
  const file = await fs.readFile(
    process.cwd() + "/contents/assets/world-land.json",
    "utf8"
  );
  const geojson = JSON.parse(file);
  globalCache[cacheKey] = geojson;
  await redis.set(cacheKey, JSON.stringify(geojson));
  return geojson;
}

// Fixed isOnLand: Loop over features
export async function isOnLand(lng: number, lat: number): Promise<boolean> {
  const geojson = await loadLandGeoJson();
  const point = turf.point([lng, lat]);
  for (const feature of geojson.features) {
    if (turf.booleanPointInPolygon(point, feature)) {
      return true;
    }
  }
  return false;
}

// Generate dynamic node name (similar to type, but instance-specific)
function generateNodeName(rarity: NodeTypeRarity, offset: number): string {
  const { adjectives, nouns } = getRarityElements(rarity);
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const shortId = offset.toString(16).slice(0, 8).toUpperCase(); // Pi offset as hex ID
  return `${adj} ${noun} Lattice (${rarity} #${shortId})`;
}

// Weighted choice
function chooseWeighted<T>(items: T[], weights: number[]): T {
  const cumWeights = weights.reduce(
    (acc, w, i) => [...acc, (acc[i - 1] || 0) + w],
    [] as number[]
  );
  const rand = Math.random() * cumWeights[cumWeights.length - 1];
  return items[cumWeights.findIndex((cw) => rand <= cw)];
}

// Generate nodes
export async function generateNodes({
  adaptive,
  currentBatchSize,
  phaseId,
  rarityToIdMap,
  binActivities,
  batch,
}: GenerateNodesParams): Promise<NodeCreateManyInput[]> {
  const rarities: NodeTypeRarity[] = [
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
  ];
  const probs = [0.5, 0.25, 0.15, 0.09, 0.01];
  const nodes: NodeCreateManyInput[] = [];
  let offset = (phaseId - 1) * 100000 + batch * 1000;
  let maxActivity = 0;
  const adaptiveFraction = 0.7; // 70% adaptive, 30% uniform
  const numAdaptive = Math.floor(currentBatchSize * adaptiveFraction);
  const numUniform = currentBatchSize - numAdaptive;

  if (adaptive && binActivities && binActivities.length > 0) {
    maxActivity = binActivities.reduce(
      (max, b) => Math.max(max, b.activity),
      0
    );
    const totalActivity = binActivities.reduce((sum, b) => sum + b.activity, 0);
    const weights = binActivities.map(
      (b) => (b.activity + 1) / (totalActivity + binActivities.length)
    );
    const cumWeights = weights.reduce(
      (acc, w, i) => [...acc, (acc[i - 1] || 0) + w],
      [] as number[]
    );

    // Uniform part (30%)
    for (let i = 0; i < numUniform; i++) {
      let point: { lat: number; lng: number };
      do {
        point = await piSeededPoint(offset);
        offset += 20;
      } while (!(await isOnLand(point.lng, point.lat)));

      const selectedRarity = chooseWeighted(rarities, probs);
      const typeId = rarityToIdMap[selectedRarity];
      const echoIntensity =
        parseInt(
          (await getPiDigits()).slice(
            offset % (await getPiDigits()).length,
            (offset % (await getPiDigits()).length) + 5
          ),
          10
        ) / 99999;
      const lore = generateLore(selectedRarity, phaseId).lore;
      const name = generateNodeName(selectedRarity, offset);
      nodes.push({
        name,
        latitude: point.lat,
        longitude: point.lng,
        typeId,
        phase: phaseId,
        echoIntensity,
        lore,
      });
    }

    // Adaptive part (70%)
    for (let i = 0; i < numAdaptive; i++) {
      const rand = Math.random();
      const binIndex = cumWeights.findIndex((cw) => rand <= cw);
      const selectedBin = binActivities[binIndex];
      let point: { lat: number; lng: number };
      do {
        point = await piSeededPoint(offset);
        const [latBin, lngBin] = selectedBin.binId.split("_").map(Number);
        const latMin = latBin * 1.0;
        const latMax = latMin + BIN_SIZE;
        const lngMin = lngBin * 1.0;
        const lngMax = lngMin + BIN_SIZE;
        point.lat = latMin + ((point.lat + 90) / 180) * (latMax - latMin);
        point.lng = lngMin + ((point.lng + 180) / 360) * (lngMax - lngMin);
        offset += 20;
      } while (!(await isOnLand(point.lng, point.lat)));

      const selectedRarity = chooseWeighted(rarities, probs);
      const typeId = rarityToIdMap[selectedRarity];
      const echoIntensity = (selectedBin.activity + 1) / (maxActivity + 1);
      const lore = generateLore(selectedRarity, phaseId).lore;
      const name = generateNodeName(selectedRarity, offset);
      nodes.push({
        name,
        latitude: point.lat,
        longitude: point.lng,
        typeId,
        phase: phaseId,
        echoIntensity,
        lore,
      });
    }
  } else {
    // Full uniform for initial
    for (let i = 0; i < currentBatchSize; i++) {
      let point: { lat: number; lng: number };
      do {
        point = await piSeededPoint(offset);
        offset += 20;
      } while (!(await isOnLand(point.lng, point.lat)));

      const selectedRarity = chooseWeighted(rarities, probs);
      const typeId = rarityToIdMap[selectedRarity];
      const echoIntensity =
        parseInt(
          (await getPiDigits()).slice(
            offset % (await getPiDigits()).length,
            (offset % (await getPiDigits()).length) + 5
          ),
          10
        ) / 99999;
      const lore = generateLore(selectedRarity, phaseId).lore;
      const name = generateNodeName(selectedRarity, offset);
      nodes.push({
        name,
        latitude: point.lat,
        longitude: point.lng,
        typeId,
        phase: phaseId,
        echoIntensity,
        lore,
      });
    }
  }

  return nodes;
}

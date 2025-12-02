import { BASE_XP } from "@/config/site";

// Iterative Fibonacci to avoid recursion limits
export function fib(n: number): number {
  let a = 0,
    b = 1;
  for (let i = 1; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}

/**
 * XP required to reach a given level.
 * Uses fib(level) * baseXP.
 * Level 1 → fib(1)=1×baseXP, Level 2 → fib(2)=1×baseXP, Level 3 → fib(3)=2×baseXP…
 */
export function xpForLevel(level: number, baseXP: number = BASE_XP): number {
  return fib(level) * baseXP;
}

/**
 * Derive the highest level attainable from totalXP.
 * Stops when next level's requirement exceeds totalXP.
 */
export function calculateLevelFromXp(
  totalXP: number,
  baseXP: number = BASE_XP,
  maxLevel: number = 100
): number {
  let level = 1;

  while (level < maxLevel && totalXP >= xpForLevel(level + 1, baseXP)) {
    level++;
  }

  return level;
}

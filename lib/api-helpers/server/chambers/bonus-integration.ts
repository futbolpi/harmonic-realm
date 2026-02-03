/**
 * UI Component Integration
 *
 * Add visual indicator during active sessions when user is in chamber radius:
 *
 * In components/mining-session.tsx or tuning-modal.tsx:
 *
 * ```typescript
 * const [chamberBonus, setChamberBonus] = useState<{
 *   hasBoost: boolean;
 *   level?: number;
 *   boost?: number;
 * }>({ hasBoost: false });
 *
 * useEffect(() => {
 *   // Check for chamber bonus when session starts
 *   async function checkChamberBonus() {
 *     const result = await getChamberBoostForLocation({
 *       userId,
 *       latitude: nodeLatitude,
 *       longitude: nodeLongitude,
 *     });
 *
 *     setChamberBonus({
 *       hasBoost: result.hasBoost,
 *       level: result.chamberLevel,
 *       boost: result.boostMultiplier,
 *     });
 *   }
 *
 *   checkChamberBonus();
 * }, []);
 *
 * // Display in UI:
 * {chamberBonus.hasBoost && (
 *   <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
 *     <div className="flex items-center gap-2">
 *       <Crown className="h-4 w-4 text-purple-400" />
 *       <span className="text-xs font-semibold text-purple-400">
 *         Echo Chamber Active
 *       </span>
 *     </div>
 *     <p className="text-xs text-purple-300 mt-1">
 *       Level {chamberBonus.level} Chamber • +{(chamberBonus.boost * 100).toFixed(0)}% Boost
 *     </p>
 *   </div>
 * )}
 * ```
 */

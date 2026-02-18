// ─── Game Economy Calculation Engine ────────────────────────────────
// Pure functions — no side effects, no framework dependencies.

export interface CompoundDataPoint {
  minute: number;
  balance: number;
  spawners: number;
  linearBalance: number;
  income: number; // cumulative income at this point
}

// ── Spawner Income ──────────────────────────────────────────────────

/**
 * Income per minute from `spawnerCount` spawners,
 * where each spawner yields `revenuePer4Min` every 4 minutes.
 */
export function calculateProfitPerMinute(
  spawnerCount: number,
  revenuePer4Min: number
): number {
  return spawnerCount * (revenuePer4Min / 4);
}

export function calculateProfitPerHour(
  spawnerCount: number,
  revenuePer4Min: number
): number {
  return calculateProfitPerMinute(spawnerCount, revenuePer4Min) * 60;
}

export function calculateProfitPerDay(
  spawnerCount: number,
  revenuePer4Min: number
): number {
  return calculateProfitPerHour(spawnerCount, revenuePer4Min) * 24;
}

// ── Time-to-Goal ────────────────────────────────────────────────────

/**
 * Minutes needed to reach `goalAmount` from `currentBalance`
 * at the given per-minute income rate.
 * Returns Infinity when rate ≤ 0.
 */
export function calculateTimeToGoal(
  goalAmount: number,
  currentBalance: number,
  profitPerMinute: number
): number {
  if (profitPerMinute <= 0) return Infinity;
  const remaining = goalAmount - currentBalance;
  if (remaining <= 0) return 0;
  return remaining / profitPerMinute;
}

// ── Compound Growth Simulation ──────────────────────────────────────

/**
 * Minute-by-minute simulation:
 *  • Each tick adds income based on current spawner count.
 *  • Whenever balance ≥ spawnerCost we buy a spawner (up to balanceCap).
 *  • Also tracks a "linear" baseline (no reinvesting).
 *
 * Returns an array sampled every `sampleEvery` minutes to keep chart data lean.
 */
export function simulateCompoundGrowth(
  startSpawners: number,
  startBalance: number,
  durationHours: number,
  spawnerCost: number,
  revenuePer4Min: number,
  balanceCap: number,
  sampleEvery = 5 // emit a data-point every N minutes
): CompoundDataPoint[] {
  const totalMinutes = durationHours * 60;
  const data: CompoundDataPoint[] = [];

  // ── compound path
  let balance = startBalance;
  let spawners = startSpawners;

  // ── linear path (never buys new spawners)
  let linearBalance = startBalance;
  const linearRate = calculateProfitPerMinute(startSpawners, revenuePer4Min);

  for (let m = 0; m <= totalMinutes; m++) {
    // record at sample points
    if (m % sampleEvery === 0) {
      data.push({
        minute: m,
        balance: Math.min(balance, balanceCap),
        spawners,
        linearBalance: Math.min(linearBalance, balanceCap),
        income: balance - startBalance,
      });
    }

    // tick income
    const perMin = calculateProfitPerMinute(spawners, revenuePer4Min);
    balance += perMin;
    linearBalance += linearRate;

    // cap
    if (balance > balanceCap) balance = balanceCap;
    if (linearBalance > balanceCap) linearBalance = balanceCap;

    // try to buy spawners (compound only)
    while (balance >= spawnerCost) {
      balance -= spawnerCost;
      spawners += 1;
    }
  }

  return data;
}

// ── Interval-Based Reinvestment Simulation ──────────────────────────

export interface ReinvestmentSnapshot {
  hour: number;
  spawners: number;
  balance: number;
  totalEarned: number;
  spawnersBought: number; // cumulative bought
}

/**
 * Simulates buying spawners at a fixed interval (e.g. every 1h, 12h, 24h).
 *
 * Each interval:
 *  1. Accumulate income from current spawners for `intervalHours`.
 *  2. Buy as many spawners as affordable.
 *  3. Record snapshot.
 *
 * Returns one snapshot per interval tick.
 */
export function simulateReinvestment(
  startSpawners: number,
  startBalance: number,
  durationDays: number,
  intervalHours: number,
  spawnerCost: number,
  revenuePer4Min: number,
  balanceCap: number
): ReinvestmentSnapshot[] {
  const totalHours = durationDays * 24;
  const ticks = Math.floor(totalHours / intervalHours);
  const data: ReinvestmentSnapshot[] = [];

  let spawners = startSpawners;
  let balance = startBalance;
  let totalEarned = 0;
  let totalBought = 0;

  // initial state
  data.push({
    hour: 0,
    spawners,
    balance,
    totalEarned: 0,
    spawnersBought: 0,
  });

  for (let t = 1; t <= ticks; t++) {
    // earn for this interval
    const perMin = calculateProfitPerMinute(spawners, revenuePer4Min);
    const earned = perMin * intervalHours * 60;
    balance += earned;
    totalEarned += earned;

    if (balance > balanceCap) balance = balanceCap;

    // buy spawners
    while (balance >= spawnerCost) {
      balance -= spawnerCost;
      spawners += 1;
      totalBought += 1;
    }

    data.push({
      hour: t * intervalHours,
      spawners,
      balance,
      totalEarned,
      spawnersBought: totalBought,
    });
  }

  return data;
}

// ── Reset Day Optimizer ─────────────────────────────────────────────

export interface ResetOptimizerResult {
  /** Best day to stop buying spawners (0 = never buy, totalDays = always buy) */
  optimalSwitchDay: number;
  /** Max island levels achievable */
  maxLevels: number;
  /** Final spawner count at switch point */
  finalSpawners: number;
  /** Money available for lodestones */
  moneyForLodestones: number;
  /** Lodestones purchased */
  lodestoneCount: number;
  /** Full breakdown for each possible switch day */
  breakdown: ResetDayBreakdown[];
}

export interface ResetDayBreakdown {
  switchDay: number;
  spawnersAtSwitch: number;
  balanceAtSwitch: number;
  earnedInPhase2: number;
  totalMoneyForLodestones: number;
  lodestones: number;
  islandLevels: number;
}

/**
 * Finds the optimal day to stop buying spawners and start buying lodestones.
 *
 * Phase 1 (day 0 → switchDay): reinvest into spawners every hour.
 * Phase 2 (switchDay → totalDays): buy lodestones at the given interval.
 *
 * @param lodestoneBuyIntervalMin - how often (in minutes) to buy lodestones in Phase 2
 * @param effectiveCap - total balance cap across all accounts
 */
export function optimizeForReset(
  startSpawners: number,
  startBalance: number,
  totalDays: number,
  spawnerCost: number,
  revenuePer4Min: number,
  lodestoneCost: number,
  lodestoneValue: number,
  effectiveCap: number,
  lodestoneBuyIntervalMin = 60,
): ResetOptimizerResult {
  const breakdown: ResetDayBreakdown[] = [];

  for (let switchDay = 0; switchDay <= totalDays; switchDay++) {
    // ── Phase 1: reinvest into spawners (hourly buying)
    let spawners = startSpawners;
    let balance = startBalance;
    const phase1Hours = switchDay * 24;

    for (let h = 0; h < phase1Hours; h++) {
      const perMin = calculateProfitPerMinute(spawners, revenuePer4Min);
      const earned = perMin * 60; // 1 hour of income
      balance += earned;
      if (balance > effectiveCap) balance = effectiveCap;

      // buy spawners with available balance
      while (balance >= spawnerCost) {
        balance -= spawnerCost;
        spawners += 1;
      }
    }

    // ── Phase 2: earn income and buy lodestones at the given interval
    const phase2TotalMinutes = (totalDays - switchDay) * 24 * 60;
    const intervals = Math.floor(phase2TotalMinutes / lodestoneBuyIntervalMin);
    let totalLodestones = 0;
    let totalSpentOnLodestones = 0;

    for (let i = 0; i < intervals; i++) {
      const perMin = calculateProfitPerMinute(spawners, revenuePer4Min);
      const earned = perMin * lodestoneBuyIntervalMin;
      balance += earned;
      if (balance > effectiveCap) balance = effectiveCap;

      // buy lodestones
      if (lodestoneCost > 0) {
        const canBuy = Math.floor(balance / lodestoneCost);
        if (canBuy > 0) {
          totalLodestones += canBuy;
          totalSpentOnLodestones += canBuy * lodestoneCost;
          balance -= canBuy * lodestoneCost;
        }
      }
    }

    // leftover time after last full interval
    const leftoverMinutes = phase2TotalMinutes - intervals * lodestoneBuyIntervalMin;
    if (leftoverMinutes > 0) {
      const perMin = calculateProfitPerMinute(spawners, revenuePer4Min);
      balance += perMin * leftoverMinutes;
      if (balance > effectiveCap) balance = effectiveCap;
    }

    // buy remaining lodestones
    if (lodestoneCost > 0) {
      const remaining = Math.floor(balance / lodestoneCost);
      totalLodestones += remaining;
      totalSpentOnLodestones += remaining * lodestoneCost;
      balance -= remaining * lodestoneCost;
    }

    const islandLevels = totalLodestones * lodestoneValue;

    breakdown.push({
      switchDay,
      spawnersAtSwitch: spawners,
      balanceAtSwitch: balance,
      earnedInPhase2: totalSpentOnLodestones + balance,
      totalMoneyForLodestones: totalSpentOnLodestones,
      lodestones: totalLodestones,
      islandLevels,
    });
  }

  // find optimal
  let best = breakdown[0];
  for (const b of breakdown) {
    if (b.islandLevels > best.islandLevels) {
      best = b;
    }
  }

  return {
    optimalSwitchDay: best.switchDay,
    maxLevels: best.islandLevels,
    finalSpawners: best.spawnersAtSwitch,
    moneyForLodestones: best.totalMoneyForLodestones,
    lodestoneCount: best.lodestones,
    breakdown,
  };
}

/**
 * Calculate how long until the balance hits the cap at the current earning rate.
 * Returns time in minutes.
 */
export function minutesToCap(
  currentBalance: number,
  spawners: number,
  revenuePer4Min: number,
  effectiveCap: number,
): number {
  if (currentBalance >= effectiveCap) return 0;
  const perMin = calculateProfitPerMinute(spawners, revenuePer4Min);
  if (perMin <= 0) return Infinity;
  return (effectiveCap - currentBalance) / perMin;
}

// ── Lodestone / Island Level ────────────────────────────────────────

export interface LodestoneResult {
  count: number;
  totalCost: number;
  levelsGained: number;
}

/**
 * How many Lodestones are needed to reach `targetLevel`,
 * and what do they cost?
 */
export function calculateLodestones(
  targetLevel: number,
  lodestoneCost: number,
  lodestoneValue: number
): LodestoneResult {
  if (lodestoneValue <= 0) return { count: 0, totalCost: 0, levelsGained: 0 };
  const count = Math.ceil(targetLevel / lodestoneValue);
  return {
    count,
    totalCost: count * lodestoneCost,
    levelsGained: count * lodestoneValue,
  };
}

/**
 * Maximum Island Levels reachable with a given balance.
 */
export function maxLevelsFromBalance(
  balance: number,
  lodestoneCost: number,
  lodestoneValue: number
): number {
  if (lodestoneCost <= 0) return 0;
  return Math.floor(balance / lodestoneCost) * lodestoneValue;
}

// ── Formatting helpers ──────────────────────────────────────────────

/** Pretty-print large numbers with commas. */
export function formatMoney(n: number): string {
  if (!isFinite(n)) return "∞";
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/** Format minutes → human-readable time string. */
export function formatTime(totalMinutes: number): string {
  if (!isFinite(totalMinutes) || totalMinutes < 0) return "∞";
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins = Math.floor(totalMinutes % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(" ");
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return "∞";
  return n.toLocaleString("en-US");
}

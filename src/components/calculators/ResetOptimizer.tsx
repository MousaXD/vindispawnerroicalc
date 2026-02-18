"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CalendarClock,
    Trophy,
    Mountain,
    Sword,
    DollarSign,
    Gem,
    ArrowRight,
    Star,
} from "lucide-react";
import { useGameStore } from "@/lib/store";
import {
    optimizeForReset,
    formatMoney,
    formatNumber,
} from "@/lib/calculations";

// Server reset date
const RESET_DATE = new Date("2026-04-04T00:00:00");

function getDaysUntilReset(): number {
    const now = new Date();
    const diff = RESET_DATE.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function ResetOptimizer() {
    const {
        currentSpawners,
        currentBalance,
        spawnerCost,
        spawnerRevenue,
        lodestoneCost,
        lodestoneValue,
        balanceLimit,
    } = useGameStore();

    const daysLeft = getDaysUntilReset();

    const result = useMemo(
        () =>
            optimizeForReset(
                currentSpawners,
                currentBalance,
                daysLeft,
                spawnerCost,
                spawnerRevenue,
                lodestoneCost,
                lodestoneValue,
                balanceLimit
            ),
        [
            currentSpawners,
            currentBalance,
            daysLeft,
            spawnerCost,
            spawnerRevenue,
            lodestoneCost,
            lodestoneValue,
            balanceLimit,
        ]
    );

    // Compute the actual switch date
    const switchDate = new Date();
    switchDate.setDate(switchDate.getDate() + result.optimalSwitchDay);
    const switchDateStr = switchDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    // Compare vs "never reinvest" (switchDay=0) and "always reinvest" (switchDay=totalDays)
    const neverReinvest = result.breakdown[0];
    const alwaysReinvest = result.breakdown[result.breakdown.length - 1];
    const optimal =
        result.breakdown.find((b) => b.switchDay === result.optimalSwitchDay) ??
        result.breakdown[0];

    return (
        <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.03] to-amber-500/[0.02] backdrop-blur-xl shadow-2xl shadow-yellow-500/[0.05] relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/[0.04] rounded-full blur-3xl" />

            <CardHeader className="pb-3 relative">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-zinc-200">
                    <CalendarClock className="h-5 w-5 text-yellow-400" />
                    Reset Day Optimizer
                    <span className="ml-auto text-xs font-normal text-zinc-500 font-mono">
                        Reset: Apr 4, 2026
                    </span>
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-mono font-bold">
                        <CalendarClock className="h-3 w-3" />
                        {daysLeft} days left
                    </span>
                    <span className="text-xs text-zinc-500">
                        Starting with{" "}
                        <span className="text-cyan-400 font-mono">{formatNumber(currentSpawners)}</span>{" "}
                        spawner{currentSpawners !== 1 ? "s" : ""}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-5 relative">
                {/* ── Optimal Strategy Banner ────────────────────────── */}
                <div className="p-4 rounded-xl bg-yellow-500/[0.06] border border-yellow-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <h3 className="text-sm font-bold text-yellow-300 uppercase tracking-wider">
                            Optimal Strategy
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Phase 1 */}
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                Phase 1 — Buy Spawners
                            </p>
                            <p className="text-sm text-zinc-300">
                                Reinvest for{" "}
                                <span className="text-emerald-400 font-mono font-bold text-lg">
                                    {result.optimalSwitchDay}
                                </span>{" "}
                                days
                            </p>
                            <p className="text-xs text-zinc-500">
                                Now → {switchDateStr}
                            </p>
                        </div>

                        {/* Phase 2 */}
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                Phase 2 — Save for Lodestones
                            </p>
                            <p className="text-sm text-zinc-300">
                                Save for{" "}
                                <span className="text-purple-400 font-mono font-bold text-lg">
                                    {daysLeft - result.optimalSwitchDay}
                                </span>{" "}
                                days
                            </p>
                            <p className="text-xs text-zinc-500">
                                {switchDateStr} → Apr 4
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Big result: Max Island Levels ──────────────────── */}
                <div className="text-center py-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
                        Maximum Island Levels
                    </p>
                    <p className="text-4xl sm:text-5xl font-black font-mono bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                        {formatNumber(result.maxLevels)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">
                        {formatNumber(result.lodestoneCount)} lodestones ·{" "}
                        {formatMoney(result.moneyForLodestones)} total money
                    </p>
                </div>

                {/* ── Key Stats Grid ────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <Sword className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                        <p className="text-[10px] text-zinc-500 uppercase">Final Spawners</p>
                        <p className="font-mono text-lg font-bold text-cyan-400">
                            {formatNumber(result.finalSpawners)}
                        </p>
                        <p className="text-[10px] text-zinc-600">
                            +{formatNumber(result.finalSpawners - currentSpawners)} new
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <DollarSign className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                        <p className="text-[10px] text-zinc-500 uppercase">Money for Lodestones</p>
                        <p className="font-mono text-lg font-bold text-emerald-400">
                            {formatMoney(result.moneyForLodestones)}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <Gem className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                        <p className="text-[10px] text-zinc-500 uppercase">Lodestones</p>
                        <p className="font-mono text-lg font-bold text-purple-400">
                            {formatNumber(result.lodestoneCount)}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <Trophy className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                        <p className="text-[10px] text-zinc-500 uppercase">Switch Day</p>
                        <p className="font-mono text-lg font-bold text-yellow-400">
                            Day {result.optimalSwitchDay}
                        </p>
                    </div>
                </div>

                {/* ── Strategy Comparison ────────────────────────────── */}
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Strategy Comparison
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Never reinvest */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                                ❌ Never Reinvest
                            </p>
                            <p className="font-mono text-base font-bold text-zinc-400">
                                {formatNumber(neverReinvest.islandLevels)}
                            </p>
                            <p className="text-[10px] text-zinc-600">
                                {formatNumber(neverReinvest.spawnersAtSwitch)} spawners
                            </p>
                        </div>

                        {/* Optimal */}
                        <div className="p-3 rounded-xl bg-yellow-500/[0.06] border border-yellow-500/20">
                            <p className="text-[10px] uppercase tracking-wider text-yellow-400 mb-1">
                                ⭐ Optimal (Day {result.optimalSwitchDay})
                            </p>
                            <p className="font-mono text-base font-bold text-yellow-400">
                                {formatNumber(optimal.islandLevels)}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                                {formatNumber(optimal.spawnersAtSwitch)} spawners
                            </p>
                        </div>

                        {/* Always reinvest */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                                🔄 Always Reinvest
                            </p>
                            <p className="font-mono text-base font-bold text-zinc-400">
                                {formatNumber(alwaysReinvest.islandLevels)}
                            </p>
                            <p className="text-[10px] text-zinc-600">
                                {formatNumber(alwaysReinvest.spawnersAtSwitch)} spawners (no lodestones)
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Timeline */}
                <div className="flex items-center gap-2 text-xs text-zinc-600 pt-3 border-t border-white/[0.04]">
                    <span className="text-emerald-400">Buy Spawners</span>
                    <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden relative">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                            style={{
                                width: `${daysLeft > 0 ? (result.optimalSwitchDay / daysLeft) * 100 : 0}%`,
                            }}
                        />
                        <div
                            className="absolute inset-y-0 right-0 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                            style={{
                                width: `${daysLeft > 0 ? ((daysLeft - result.optimalSwitchDay) / daysLeft) * 100 : 0}%`,
                            }}
                        />
                    </div>
                    <span className="text-purple-400">Buy Lodestones</span>
                </div>
            </CardContent>
        </Card>
    );
}

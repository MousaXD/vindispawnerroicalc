"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CalendarClock,
    Trophy,
    Sword,
    DollarSign,
    Gem,
    Star,
    Zap,
    Timer,
    Users,
    Package,
    AlertTriangle,
} from "lucide-react";
import { useGameStore } from "@/lib/store";
import {
    optimizeForReset,
    minutesToCap,
    formatMoney,
    formatNumber,
    formatTime,
    calculateProfitPerMinute,
    type ResetDayBreakdown,
} from "@/lib/calculations";

// Server reset date
const RESET_DATE = new Date("2026-04-04T00:00:00");

const PRESET_INTERVALS = [1, 10, 15, 60] as const;

function formatInterval(min: number): string {
    if (min >= 60) return `${min / 60}h`;
    return `${min} min`;
}

function getDaysUntilReset(): number {
    const now = new Date();
    const diff = RESET_DATE.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getDateForDay(day: number): string {
    const d = new Date();
    d.setDate(d.getDate() + day);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
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
        sellChestCapacity,
        accountCount,
        setAccountCount,
    } = useGameStore();

    const daysLeft = getDaysUntilReset();
    const [customSwitchDay, setCustomSwitchDay] = useState<number | null>(null);
    const [spawnerBuyInterval, setSpawnerBuyInterval] = useState(10);
    const [lodestoneBuyInterval, setLodestoneBuyInterval] = useState(10);

    const effectiveCap = balanceLimit * accountCount;

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
                effectiveCap,
                lodestoneBuyInterval,
                spawnerBuyInterval,
            ),
        [
            currentSpawners,
            currentBalance,
            daysLeft,
            spawnerCost,
            spawnerRevenue,
            lodestoneCost,
            lodestoneValue,
            effectiveCap,
            lodestoneBuyInterval,
            spawnerBuyInterval,
        ]
    );

    // Active switch day
    const activeSwitchDay = customSwitchDay ?? result.optimalSwitchDay;
    const isUsingOptimal = customSwitchDay === null;

    const activeBreakdown: ResetDayBreakdown =
        result.breakdown[activeSwitchDay] ?? result.breakdown[0];
    const optimalBreakdown: ResetDayBreakdown =
        result.breakdown[result.optimalSwitchDay] ?? result.breakdown[0];

    const diffFromOptimal =
        activeBreakdown.islandLevels - optimalBreakdown.islandLevels;
    const pctOfOptimal =
        optimalBreakdown.islandLevels > 0
            ? (activeBreakdown.islandLevels / optimalBreakdown.islandLevels) * 100
            : 100;

    // Sell chests needed
    const sellChestsNeeded =
        sellChestCapacity > 0
            ? Math.ceil(currentSpawners / sellChestCapacity)
            : 0;
    const sellChestsAtSwitch =
        sellChestCapacity > 0
            ? Math.ceil(activeBreakdown.spawnersAtSwitch / sellChestCapacity)
            : 0;

    // Time to cap
    const minsToCap = minutesToCap(
        currentBalance,
        currentSpawners,
        spawnerRevenue,
        effectiveCap
    );
    const capWarning = minsToCap < 60; // less than 1 hour to cap
    const perMin = calculateProfitPerMinute(currentSpawners, spawnerRevenue);

    return (
        <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.03] to-amber-500/[0.02] backdrop-blur-xl shadow-2xl shadow-yellow-500/[0.05] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/[0.04] rounded-full blur-3xl" />

            <CardHeader className="pb-3 relative">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-zinc-200">
                    <CalendarClock className="h-5 w-5 text-yellow-400" />
                    Reset Day Optimizer
                    <span className="ml-auto text-xs font-normal text-zinc-500 font-mono">
                        Reset: Apr 4, 2026
                    </span>
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-mono font-bold">
                        <CalendarClock className="h-3 w-3" />
                        {daysLeft} days left
                    </span>
                    <span className="text-xs text-zinc-500">
                        <span className="text-cyan-400 font-mono">
                            {formatNumber(currentSpawners)}
                        </span>{" "}
                        spawners
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-5 relative">
                {/* ── Config Row: Accounts + Intervals ─────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Account Count */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-blue-400" />
                            Accounts
                        </label>
                        <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                            {[1, 2, 3, 4].map((n) => (
                                <Button
                                    key={n}
                                    variant={accountCount === n ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setAccountCount(n)}
                                    className={`flex-1 h-8 text-xs font-mono font-bold transition-all ${accountCount === n
                                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 shadow-sm shadow-blue-500/10"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                                        }`}
                                >
                                    {n}
                                </Button>
                            ))}
                        </div>
                        <p className="text-[10px] text-zinc-600">
                            Cap:{" "}
                            <span className="text-zinc-400 font-mono">
                                {formatMoney(effectiveCap)}
                            </span>
                        </p>
                    </div>

                    {/* Spawner Buy Interval */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <Sword className="h-3.5 w-3.5 text-emerald-400" />
                            Buy Spawners Every
                        </label>
                        <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                            {PRESET_INTERVALS.map((m) => (
                                <Button
                                    key={m}
                                    variant={spawnerBuyInterval === m ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setSpawnerBuyInterval(m)}
                                    className={`flex-1 h-8 text-xs font-medium transition-all ${spawnerBuyInterval === m
                                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 shadow-sm shadow-emerald-500/10"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                                        }`}
                                >
                                    {m >= 60 ? `${m / 60}h` : `${m}m`}
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min={1}
                                max={1440}
                                value={spawnerBuyInterval}
                                onChange={(e) => setSpawnerBuyInterval(Math.max(1, parseInt(e.target.value) || 1))}
                                className="bg-white/[0.04] border-white/[0.08] text-zinc-100 font-mono text-sm h-8 w-20"
                            />
                            <span className="text-[10px] text-zinc-500">min (custom)</span>
                        </div>
                    </div>

                    {/* Lodestone Buy Interval */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <Timer className="h-3.5 w-3.5 text-purple-400" />
                            Buy Lodestones Every
                        </label>
                        <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                            {PRESET_INTERVALS.map((m) => (
                                <Button
                                    key={m}
                                    variant={lodestoneBuyInterval === m ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setLodestoneBuyInterval(m)}
                                    className={`flex-1 h-8 text-xs font-medium transition-all ${lodestoneBuyInterval === m
                                        ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 shadow-sm shadow-purple-500/10"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                                        }`}
                                >
                                    {m >= 60 ? `${m / 60}h` : `${m}m`}
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min={1}
                                max={1440}
                                value={lodestoneBuyInterval}
                                onChange={(e) => setLodestoneBuyInterval(Math.max(1, parseInt(e.target.value) || 1))}
                                className="bg-white/[0.04] border-white/[0.08] text-zinc-100 font-mono text-sm h-8 w-20"
                            />
                            <span className="text-[10px] text-zinc-500">min (custom)</span>
                        </div>
                    </div>
                </div>

                {/* ── Time to Cap Warning ────────────────────────────── */}
                <div
                    className={`p-3 rounded-xl border flex items-start gap-3 ${capWarning
                        ? "bg-red-500/[0.06] border-red-500/20"
                        : "bg-white/[0.02] border-white/[0.06]"
                        }`}
                >
                    <AlertTriangle
                        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${capWarning ? "text-red-400" : "text-amber-400"
                            }`}
                    />
                    <div className="space-y-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-300">
                            Time until balance cap ({formatMoney(effectiveCap)})
                        </p>
                        <p
                            className={`font-mono text-lg font-bold ${capWarning ? "text-red-400" : "text-amber-400"
                                }`}
                        >
                            {minsToCap === Infinity
                                ? "Never (no spawners)"
                                : minsToCap === 0
                                    ? "Already at cap!"
                                    : formatTime(minsToCap)}
                        </p>
                        {perMin > 0 && minsToCap > 0 && minsToCap !== Infinity && (
                            <p className="text-[10px] text-zinc-500">
                                Earning{" "}
                                <span className="text-emerald-400 font-mono">
                                    {formatMoney(perMin * lodestoneBuyInterval)}
                                </span>{" "}
                                every {formatInterval(lodestoneBuyInterval)} — buy lodestones
                                before you hit the cap
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Sell Chests Info ───────────────────────────────── */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
                    <Package className="h-5 w-5 text-orange-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-400">
                            Sell chests needed (1 per{" "}
                            {formatNumber(sellChestCapacity)} spawners)
                        </p>
                        <div className="flex items-center gap-4 mt-0.5">
                            <span className="text-xs">
                                Now:{" "}
                                <span className="text-orange-400 font-mono font-bold text-base">
                                    {sellChestsNeeded}
                                </span>
                            </span>
                            <span className="text-xs">
                                At switch:{" "}
                                <span className="text-orange-400 font-mono font-bold text-base">
                                    {sellChestsAtSwitch}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Switch Day Slider ──────────────────────────────── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-zinc-400 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            When to stop buying spawners
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-lg font-bold text-yellow-400">
                                Day {activeSwitchDay}
                            </span>
                            <span className="text-xs text-zinc-500">
                                ({getDateForDay(activeSwitchDay)})
                            </span>
                        </div>
                    </div>

                    <Slider
                        value={[activeSwitchDay]}
                        onValueChange={([v]) => setCustomSwitchDay(v)}
                        min={0}
                        max={daysLeft}
                        step={1}
                        className="[&_[role=slider]]:bg-yellow-500 [&_[role=slider]]:border-yellow-400 [&_[role=slider]]:shadow-yellow-500/30 [&_[role=slider]]:shadow-lg"
                    />

                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                        <span>Day 0 (now)</span>
                        <span>Day {Math.floor(daysLeft / 2)}</span>
                        <span>Day {daysLeft} (reset)</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={isUsingOptimal ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCustomSwitchDay(null)}
                            className={`h-7 px-3 text-xs font-medium transition-all duration-200 ${isUsingOptimal
                                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/30"
                                : "text-zinc-400 hover:text-zinc-200 border-white/[0.08] hover:bg-white/[0.04]"
                                }`}
                        >
                            <Star className="h-3 w-3 mr-1" />
                            Use Optimal (Day {result.optimalSwitchDay})
                        </Button>
                        {!isUsingOptimal && (
                            <span
                                className={`text-xs font-mono ${diffFromOptimal < 0 ? "text-red-400" : "text-emerald-400"
                                    }`}
                            >
                                {diffFromOptimal < 0
                                    ? `${formatNumber(Math.abs(diffFromOptimal))} fewer levels`
                                    : diffFromOptimal > 0
                                        ? `+${formatNumber(diffFromOptimal)} more levels`
                                        : "Same as optimal"}{" "}
                                ({pctOfOptimal.toFixed(1)}%)
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Strategy Summary ───────────────────────────────── */}
                <div className="p-4 rounded-xl bg-yellow-500/[0.06] border border-yellow-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <h3 className="text-sm font-bold text-yellow-300 uppercase tracking-wider">
                            {isUsingOptimal ? "Optimal Strategy" : "Your Strategy"}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                Phase 1 — Buy Spawners (every{" "}
                                {formatInterval(spawnerBuyInterval)})
                            </p>
                            <p className="text-sm text-zinc-300">
                                Reinvest for{" "}
                                <span className="text-emerald-400 font-mono font-bold text-lg">
                                    {activeSwitchDay}
                                </span>{" "}
                                days
                            </p>
                            <p className="text-xs text-zinc-500">
                                Now → {getDateForDay(activeSwitchDay)}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                Phase 2 — Buy Lodestones (every{" "}
                                {formatInterval(lodestoneBuyInterval)})
                            </p>
                            <p className="text-sm text-zinc-300">
                                Buy for{" "}
                                <span className="text-purple-400 font-mono font-bold text-lg">
                                    {daysLeft - activeSwitchDay}
                                </span>{" "}
                                days
                            </p>
                            <p className="text-xs text-zinc-500">
                                {getDateForDay(activeSwitchDay)} → Apr 4
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Big result: Island Levels ──────────────────────── */}
                <div className="text-center py-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
                        Maximum Island Levels
                    </p>
                    <p className="text-4xl sm:text-5xl font-black font-mono bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                        {formatNumber(activeBreakdown.islandLevels)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">
                        {formatNumber(activeBreakdown.lodestones)} lodestones ·{" "}
                        {formatMoney(activeBreakdown.totalMoneyForLodestones)} spent ·{" "}
                        {accountCount > 1
                            ? `across ${accountCount} accounts`
                            : "1 account"}
                    </p>
                </div>

                {/* ── Key Stats Grid ────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <Sword className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                        <p className="text-[10px] text-zinc-500 uppercase">
                            Spawners at Switch
                        </p>
                        <p className="font-mono text-lg font-bold text-cyan-400">
                            {formatNumber(activeBreakdown.spawnersAtSwitch)}
                        </p>
                        <p className="text-[10px] text-zinc-600">
                            +{formatNumber(activeBreakdown.spawnersAtSwitch - currentSpawners)}{" "}
                            new
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <DollarSign className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                        <p className="text-[10px] text-zinc-500 uppercase">
                            Spent on Lodestones
                        </p>
                        <p className="font-mono text-lg font-bold text-emerald-400">
                            {formatMoney(activeBreakdown.totalMoneyForLodestones)}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <Gem className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                        <p className="text-[10px] text-zinc-500 uppercase">Lodestones</p>
                        <p className="font-mono text-lg font-bold text-purple-400">
                            {formatNumber(activeBreakdown.lodestones)}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                        <Trophy className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                        <p className="text-[10px] text-zinc-500 uppercase">Switch Day</p>
                        <p className="font-mono text-lg font-bold text-yellow-400">
                            Day {activeSwitchDay}
                        </p>
                    </div>
                </div>

                {/* ── Strategy Comparison ────────────────────────────── */}
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Strategy Comparison
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                                ❌ Never Reinvest
                            </p>
                            <p className="font-mono text-base font-bold text-zinc-400">
                                {formatNumber(result.breakdown[0].islandLevels)}
                            </p>
                            <p className="text-[10px] text-zinc-600">
                                {formatNumber(result.breakdown[0].spawnersAtSwitch)} spawners
                            </p>
                        </div>

                        <div className="p-3 rounded-xl bg-yellow-500/[0.06] border border-yellow-500/20">
                            <p className="text-[10px] uppercase tracking-wider text-yellow-400 mb-1">
                                ⭐ Optimal (Day {result.optimalSwitchDay})
                            </p>
                            <p className="font-mono text-base font-bold text-yellow-400">
                                {formatNumber(optimalBreakdown.islandLevels)}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                                {formatNumber(optimalBreakdown.spawnersAtSwitch)} spawners
                            </p>
                        </div>

                        {!isUsingOptimal ? (
                            <div
                                className={`p-3 rounded-xl border ${diffFromOptimal >= 0
                                    ? "bg-emerald-500/[0.06] border-emerald-500/20"
                                    : "bg-red-500/[0.04] border-red-500/15"
                                    }`}
                            >
                                <p
                                    className={`text-[10px] uppercase tracking-wider mb-1 ${diffFromOptimal >= 0 ? "text-emerald-400" : "text-red-400"
                                        }`}
                                >
                                    🎯 Your Pick (Day {activeSwitchDay})
                                </p>
                                <p
                                    className={`font-mono text-base font-bold ${diffFromOptimal >= 0 ? "text-emerald-400" : "text-red-400"
                                        }`}
                                >
                                    {formatNumber(activeBreakdown.islandLevels)}
                                </p>
                                <p className="text-[10px] text-zinc-500">
                                    {formatNumber(activeBreakdown.spawnersAtSwitch)} spawners
                                </p>
                            </div>
                        ) : (
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                                    🔄 Always Reinvest
                                </p>
                                <p className="font-mono text-base font-bold text-zinc-400">
                                    {formatNumber(
                                        result.breakdown[result.breakdown.length - 1].islandLevels
                                    )}
                                </p>
                                <p className="text-[10px] text-zinc-600">
                                    {formatNumber(
                                        result.breakdown[result.breakdown.length - 1]
                                            .spawnersAtSwitch
                                    )}{" "}
                                    spawners
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Timeline bar */}
                <div className="flex items-center gap-2 text-xs text-zinc-600 pt-3 border-t border-white/[0.04]">
                    <span className="text-emerald-400">Spawners</span>
                    <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden relative">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                            style={{
                                width: `${daysLeft > 0 ? (activeSwitchDay / daysLeft) * 100 : 0
                                    }%`,
                            }}
                        />
                        <div
                            className="absolute inset-y-0 right-0 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                            style={{
                                width: `${daysLeft > 0
                                    ? ((daysLeft - activeSwitchDay) / daysLeft) * 100
                                    : 0
                                    }%`,
                            }}
                        />
                    </div>
                    <span className="text-purple-400">Lodestones</span>
                </div>
            </CardContent>
        </Card>
    );
}

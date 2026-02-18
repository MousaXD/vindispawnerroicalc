"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Clock, Sword, DollarSign, TrendingUp } from "lucide-react";
import { useGameStore } from "@/lib/store";
import {
    simulateReinvestment,
    formatMoney,
    formatNumber,
} from "@/lib/calculations";

const INTERVALS = [
    { label: "Every 1h", hours: 1 },
    { label: "Every 12h", hours: 12 },
    { label: "Every 24h", hours: 24 },
] as const;

const DURATIONS = [
    { label: "7d", days: 7 },
    { label: "14d", days: 14 },
    { label: "30d", days: 30 },
] as const;

export default function ReinvestmentPlanner() {
    const {
        currentSpawners,
        currentBalance,
        spawnerCost,
        spawnerRevenue,
        balanceLimit,
    } = useGameStore();

    const [durationIdx, setDurationIdx] = useState(0);

    const results = useMemo(() => {
        const dur = DURATIONS[durationIdx];
        return INTERVALS.map((interval) => {
            const snapshots = simulateReinvestment(
                currentSpawners,
                currentBalance,
                dur.days,
                interval.hours,
                spawnerCost,
                spawnerRevenue,
                balanceLimit
            );
            const final = snapshots[snapshots.length - 1];
            return {
                interval,
                final,
                snapshots,
            };
        });
    }, [currentSpawners, currentBalance, spawnerCost, spawnerRevenue, balanceLimit, durationIdx]);

    const dur = DURATIONS[durationIdx];

    return (
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-cyan-500/[0.03]">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-zinc-200">
                        <ShoppingCart className="h-5 w-5 text-cyan-400" />
                        Spawner Reinvestment Planner
                    </CardTitle>
                    <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                        {DURATIONS.map((d, i) => (
                            <Button
                                key={d.label}
                                variant={i === durationIdx ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setDurationIdx(i)}
                                className={`h-7 px-3 text-xs font-medium transition-all duration-200 ${i === durationIdx
                                        ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 shadow-sm shadow-cyan-500/10"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                                    }`}
                            >
                                {d.label}
                            </Button>
                        ))}
                    </div>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                    If you reinvest all earnings into spawners at different intervals over{" "}
                    <span className="text-cyan-400 font-mono font-semibold">{dur.days} days</span>,
                    here&apos;s what you end up with:
                </p>
            </CardHeader>

            <CardContent className="pt-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {results.map(({ interval, final }) => {
                        const newSpawners = final.spawnersBought;
                        const multiplier = currentSpawners > 0 ? (final.spawners / currentSpawners).toFixed(1) : "—";

                        return (
                            <div
                                key={interval.hours}
                                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-300 space-y-3"
                            >
                                {/* Header */}
                                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                                    <Clock className="h-4 w-4 text-cyan-400" />
                                    <span className="text-sm font-semibold text-zinc-200">
                                        {interval.label}
                                    </span>
                                </div>

                                {/* Final Spawners */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                        Final Spawners
                                    </p>
                                    <p className="text-2xl font-bold font-mono text-cyan-400">
                                        {formatNumber(final.spawners)}
                                    </p>
                                    <p className="text-[10px] text-zinc-600">
                                        +{formatNumber(newSpawners)} new · {multiplier}x multiplier
                                    </p>
                                </div>

                                {/* Total Earned */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                        Total Earned
                                    </p>
                                    <p className="text-lg font-bold font-mono text-emerald-400">
                                        {formatMoney(final.totalEarned)}
                                    </p>
                                </div>

                                {/* Leftover Balance */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                        Leftover Balance
                                    </p>
                                    <p className="text-sm font-mono text-zinc-300">
                                        {formatMoney(final.balance)}
                                    </p>
                                </div>

                                {/* Money Spent on Spawners */}
                                <div className="pt-2 border-t border-white/[0.04]">
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                        Spent on Spawners
                                    </p>
                                    <p className="text-sm font-mono text-amber-400">
                                        {formatMoney(newSpawners * spawnerCost)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Comparison footer */}
                <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                    <p className="text-xs text-zinc-500">
                        Starting with{" "}
                        <span className="text-cyan-400 font-mono font-semibold">
                            {formatNumber(currentSpawners)}
                        </span>{" "}
                        spawner{currentSpawners !== 1 ? "s" : ""} and{" "}
                        <span className="text-emerald-400 font-mono font-semibold">
                            {formatMoney(currentBalance)}
                        </span>{" "}
                        balance — buying more frequently lets you compound faster
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

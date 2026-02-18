"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Mountain, Gem, Clock, DollarSign } from "lucide-react";
import { useGameStore } from "@/lib/store";
import {
    calculateLodestones,
    calculateProfitPerMinute,
    calculateTimeToGoal,
    formatMoney,
    formatTime,
    formatNumber,
} from "@/lib/calculations";

export default function LodestonePlanner() {
    const {
        currentSpawners,
        spawnerRevenue,
        lodestoneCost,
        lodestoneValue,
    } = useGameStore();

    const [targetLevel, setTargetLevel] = useState(300_000_000);

    const result = useMemo(
        () => calculateLodestones(targetLevel, lodestoneCost, lodestoneValue),
        [targetLevel, lodestoneCost, lodestoneValue]
    );

    const timeToEarn = useMemo(() => {
        const perMin = calculateProfitPerMinute(currentSpawners, spawnerRevenue);
        return calculateTimeToGoal(result.totalCost, 0, perMin);
    }, [currentSpawners, spawnerRevenue, result.totalCost]);

    return (
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-purple-500/[0.03]">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-zinc-200">
                    <Mountain className="h-5 w-5 text-purple-400" />
                    Lodestone Planner
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Target level slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-zinc-400">Target Island Level</label>
                        <span className="font-mono text-lg font-bold text-purple-400">
                            {formatNumber(targetLevel)}
                        </span>
                    </div>
                    <Slider
                        value={[targetLevel]}
                        onValueChange={([v]) => setTargetLevel(v)}
                        min={300_000}
                        max={50_000_000_000_000}
                        step={300_000}
                        className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400 [&_[role=slider]]:shadow-purple-500/30 [&_[role=slider]]:shadow-lg"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                        <span>300K</span>
                        <span>25T</span>
                        <span>50T</span>
                    </div>
                </div>

                {/* Results grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center gap-2 mb-1">
                            <Gem className="h-3.5 w-3.5 text-purple-400" />
                            <span className="text-xs text-zinc-500 uppercase tracking-wider">
                                Lodestones
                            </span>
                        </div>
                        <p className="font-mono text-lg font-bold text-purple-400">
                            {formatNumber(result.count)}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs text-zinc-500 uppercase tracking-wider">
                                Total Cost
                            </span>
                        </div>
                        <p className="font-mono text-lg font-bold text-emerald-400">
                            {formatMoney(result.totalCost)}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-xs text-zinc-500 uppercase tracking-wider">
                                Time to Earn
                            </span>
                        </div>
                        <p className="font-mono text-lg font-bold text-amber-400">
                            {formatTime(timeToEarn)}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">
                            with {currentSpawners} spawner{currentSpawners !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {/* Level-per-dollar info */}
                <div className="text-xs text-zinc-500 text-center pt-2 border-t border-white/[0.04]">
                    Each Lodestone costs{" "}
                    <span className="text-emerald-400 font-mono">
                        {formatMoney(lodestoneCost)}
                    </span>{" "}
                    and grants{" "}
                    <span className="text-purple-400 font-mono">
                        {formatNumber(lodestoneValue)}
                    </span>{" "}
                    Island Levels
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DollarSign,
    Clock,
    TrendingUp,
    Mountain,
    Timer,
    Zap,
} from "lucide-react";
import { useGameStore } from "@/lib/store";
import {
    calculateProfitPerMinute,
    calculateProfitPerHour,
    calculateProfitPerDay,
    calculateTimeToGoal,
    maxLevelsFromBalance,
    formatMoney,
    formatTime,
    formatNumber,
} from "@/lib/calculations";

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sublabel?: string;
    accentClass?: string;
}

function StatItem({
    icon,
    label,
    value,
    sublabel,
    accentClass = "text-emerald-400",
}: StatItemProps) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl glass-card hover:border-emerald-500/30 transition-all duration-300 group">
            <div
                className={`mt-0.5 p-2 rounded-lg bg-white/[0.05] ${accentClass} group-hover:scale-110 transition-transform duration-300`}
            >
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {label}
                </p>
                <p
                    className={`text-lg font-bold font-mono ${accentClass} mt-0.5 truncate`}
                >
                    {value}
                </p>
                {sublabel && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>
                )}
            </div>
        </div>
    );
}

export default function SpawnerRoiCard() {
    const {
        currentSpawners,
        currentBalance,
        spawnerCost,
        spawnerRevenue,
        lodestoneCost,
        lodestoneValue,
        balanceLimit,
    } = useGameStore();

    const stats = useMemo(() => {
        const perMin = calculateProfitPerMinute(currentSpawners, spawnerRevenue);
        const perHour = calculateProfitPerHour(currentSpawners, spawnerRevenue);
        const perDay = calculateProfitPerDay(currentSpawners, spawnerRevenue);
        const timeToNextSpawner = calculateTimeToGoal(
            spawnerCost,
            currentBalance,
            perMin
        );
        const timeToCap = calculateTimeToGoal(balanceLimit, currentBalance, perMin);
        const maxLevels = maxLevelsFromBalance(
            currentBalance,
            lodestoneCost,
            lodestoneValue
        );
        const roiMinutes = calculateTimeToGoal(spawnerCost, 0, perMin);

        return {
            perMin,
            perHour,
            perDay,
            timeToNextSpawner,
            timeToCap,
            maxLevels,
            roiMinutes,
        };
    }, [
        currentSpawners,
        currentBalance,
        spawnerCost,
        spawnerRevenue,
        lodestoneCost,
        lodestoneValue,
        balanceLimit,
    ]);

    return (
        <Card className="glass-card shadow-2xl shadow-emerald-500/[0.03]">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-zinc-200">
                    <Zap className="h-5 w-5 text-emerald-400" />
                    Spawner ROI &amp; Stats
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StatItem
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Income / Hour"
                    value={formatMoney(stats.perHour)}
                    sublabel={`${formatMoney(stats.perMin)}/min · ${formatMoney(stats.perDay)}/day`}
                />
                <StatItem
                    icon={<Timer className="h-4 w-4" />}
                    label="Next Spawner In"
                    value={formatTime(stats.timeToNextSpawner)}
                    sublabel={`Cost: ${formatMoney(spawnerCost)}`}
                />
                <StatItem
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Single Spawner ROI"
                    value={formatTime(stats.roiMinutes)}
                    sublabel="Time to break even on 1 spawner"
                />
                <StatItem
                    icon={<Clock className="h-4 w-4" />}
                    label="Time to Balance Cap"
                    value={formatTime(stats.timeToCap)}
                    sublabel={`Cap: ${formatMoney(balanceLimit)}`}
                />
                <StatItem
                    icon={<Mountain className="h-4 w-4" />}
                    label="Max Island Levels"
                    value={formatNumber(stats.maxLevels)}
                    sublabel="From current balance"
                    accentClass="text-purple-400"
                />
                <StatItem
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Daily Earnings"
                    value={formatMoney(stats.perDay)}
                    sublabel={`${currentSpawners} spawner${currentSpawners !== 1 ? "s" : ""} running 24/7`}
                />
            </CardContent>
        </Card>
    );
}

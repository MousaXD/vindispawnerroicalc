"use client";

import { useMemo, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useGameStore } from "@/lib/store";
import {
    simulateCompoundGrowth,
    formatMoney,
} from "@/lib/calculations";

const DURATIONS = [
    { label: "24h", hours: 24, sample: 10 },
    { label: "3d", hours: 72, sample: 30 },
    { label: "7d", hours: 168, sample: 60 },
] as const;

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const hours = Math.floor(label / 60);
    const mins = label % 60;
    return (
        <div className="rounded-lg border border-white/10 bg-zinc-900/95 backdrop-blur-xl p-3 shadow-xl">
            <p className="text-xs text-zinc-400 mb-2 font-medium">
                Time: {hours}h {mins}m
            </p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center gap-2 text-sm">
                    <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: p.color }}
                    />
                    <span className="text-zinc-300">{p.name}:</span>
                    <span className="font-mono font-semibold text-zinc-100">
                        {formatMoney(p.value)}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function CompoundGrowthChart() {
    const [durationIdx, setDurationIdx] = useState(0);
    const { currentSpawners, currentBalance, spawnerCost, spawnerRevenue, balanceLimit } =
        useGameStore();

    const dur = DURATIONS[durationIdx];

    const data = useMemo(
        () =>
            simulateCompoundGrowth(
                currentSpawners,
                currentBalance,
                dur.hours,
                spawnerCost,
                spawnerRevenue,
                balanceLimit,
                dur.sample
            ),
        [currentSpawners, currentBalance, dur, spawnerCost, spawnerRevenue, balanceLimit]
    );

    const formatAxis = (v: number) => {
        if (v >= 1e12) return `${(v / 1e12).toFixed(1)}T`;
        if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
        if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
        if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
        return v.toFixed(0);
    };

    const formatXAxis = (m: number) => {
        const h = Math.floor(m / 60);
        return `${h}h`;
    };

    // Get final stats for display
    const finalPoint = data[data.length - 1];
    const compoundGain = finalPoint ? finalPoint.balance - currentBalance : 0;
    const linearGain = finalPoint ? finalPoint.linearBalance - currentBalance : 0;
    const advantage = linearGain > 0 ? ((compoundGain / linearGain - 1) * 100) : 0;

    return (
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-emerald-500/[0.03]">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-zinc-200">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                        Compound Growth Projection
                    </CardTitle>
                    <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                        {DURATIONS.map((d, i) => (
                            <Button
                                key={d.label}
                                variant={i === durationIdx ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setDurationIdx(i)}
                                className={`h-7 px-3 text-xs font-medium transition-all duration-200 ${i === durationIdx
                                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 shadow-sm shadow-emerald-500/10"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                                    }`}
                            >
                                {d.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Summary badges */}
                <div className="flex flex-wrap gap-3 mt-3">
                    <div className="text-xs text-zinc-500">
                        Compound:{" "}
                        <span className="text-emerald-400 font-mono font-semibold">
                            {formatMoney(compoundGain)}
                        </span>
                    </div>
                    <div className="text-xs text-zinc-500">
                        Linear:{" "}
                        <span className="text-blue-400 font-mono font-semibold">
                            {formatMoney(linearGain)}
                        </span>
                    </div>
                    {advantage > 0 && (
                        <div className="text-xs text-zinc-500">
                            Advantage:{" "}
                            <span className="text-yellow-400 font-mono font-semibold">
                                +{advantage.toFixed(1)}%
                            </span>
                        </div>
                    )}
                    {finalPoint && (
                        <div className="text-xs text-zinc-500">
                            Final spawners:{" "}
                            <span className="text-purple-400 font-mono font-semibold">
                                {finalPoint.spawners}
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-2">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="compoundGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="linearGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.04)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="minute"
                                tickFormatter={formatXAxis}
                                stroke="rgba(255,255,255,0.2)"
                                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                            />
                            <YAxis
                                tickFormatter={formatAxis}
                                stroke="rgba(255,255,255,0.2)"
                                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                                width={55}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="linearBalance"
                                name="Linear (Save)"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#linearGrad)"
                                dot={false}
                                activeDot={{ r: 4, fill: "#3b82f6" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="balance"
                                name="Compound (Reinvest)"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                fill="url(#compoundGrad)"
                                dot={false}
                                activeDot={{ r: 4, fill: "#10b981" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp, History, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGameStore } from "@/lib/store";

import { simulateReinvestment } from "@/lib/calculations";
import { format, differenceInMinutes } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export default function DailyProgressTracker() {
    const {
        currentSpawners,
        spawnerCost,
        spawnerRevenue,
        balanceLimit,
        accountCount,
    } = useGameStore();

    // State
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState<string>("00:00");
    const [spawnersAtDate, setSpawnersAtDate] = useState<string>("");

    // Initialize with "yesterday" if empty (optional, but good UX)
    // We won't force it to allow empty state

    const effectiveCap = balanceLimit * accountCount;

    // Calculate scenarios
    const analysis = useMemo(() => {
        if (!date) return null;
        const start = parseInt(spawnersAtDate);
        if (isNaN(start) || start < 0) return null;

        // Combine date and time
        const [hours, minutes] = time.split(":").map(Number);
        const startDateTime = new Date(date);
        startDateTime.setHours(hours || 0, minutes || 0, 0, 0);

        const now = new Date();
        const minutesPassed = differenceInMinutes(now, startDateTime);

        if (minutesPassed <= 0) return null; // Future or same time

        const daysPassed = minutesPassed / 24 / 60;
        const actualGain = currentSpawners - start;

        // Simulate "Perfect" 1h reinvestment
        const sim1h = simulateReinvestment(
            start,
            0, // starting balance assumed 0
            daysPassed,
            1, // 1 hour interval
            spawnerCost,
            spawnerRevenue,
            effectiveCap
        );

        const theoreticalEnd = sim1h[sim1h.length - 1].spawners;
        const theoreticalGain = theoreticalEnd - start;

        // Efficiency
        const efficiency = theoreticalGain > 0 ? (actualGain / theoreticalGain) : 1;

        // Recommendations
        const recommendations: string[] = [];
        if (actualGain < theoreticalGain * 0.5) {
            recommendations.push("You are significantly underperforming. Try to buy spawners more frequently.");
            recommendations.push("Check if your balance is hitting the cap while you are away.");
        } else if (actualGain < theoreticalGain * 0.9) {
            recommendations.push("Good progress, but you could squeeze out a bit more by reinvesting strictly every hour.");
        } else if (actualGain >= theoreticalGain) {
            recommendations.push("Excellent work! You are matching or beating the hourly reinvestment strategy.");
        }

        if (effectiveCap < spawnerCost * 5) {
            recommendations.push("Consider adding more accounts to increase your balance limit.");
        }

        return {
            start,
            actualGain,
            theoreticalEnd,
            theoreticalGain,
            efficiency,
            recommendations,
            minutesPassed,
            chartData: sim1h.map(pt => ({
                time: format(new Date(startDateTime.getTime() + pt.hour * 3600 * 1000), "MMM d HH:mm"),
                spawners: pt.spawners,
                actual: null // We don't have intermediate actual data, only end point?
            }))
        };
    }, [date, time, spawnersAtDate, currentSpawners, spawnerCost, spawnerRevenue, effectiveCap]);

    return (
        <Card className="glass-card shadow-2xl shadow-emerald-500/[0.03]">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-zinc-200">
                    <History className="h-5 w-5 text-emerald-400" />
                    Progress Tracker
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-zinc-400">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-muted/50 border-input",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(date: Date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-zinc-400">Time</Label>
                        <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="bg-muted/50 border-input text-foreground font-mono text-sm"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="spawners-start" className="text-xs text-zinc-400">
                        Spawners you had then
                    </Label>
                    <Input
                        id="spawners-start"
                        type="number"
                        placeholder="e.g. 5000"
                        value={spawnersAtDate}
                        onChange={(e) => setSpawnersAtDate(e.target.value)}
                        className="bg-muted/50 border-input text-foreground font-mono text-sm"
                    />
                </div>

                {analysis && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Comparison Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-muted/30 border border-border">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                                    Actual Gain ({formatNumber(analysis.minutesPassed / 60, 1)}h)
                                </p>
                                <p className={`font-mono text-xl font-bold ${analysis.actualGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    {analysis.actualGain > 0 ? "+" : ""}{formatNumber(analysis.actualGain)}
                                </p>
                                <p className="text-[10px] text-zinc-500">
                                    {formatNumber(analysis.start)} → {formatNumber(currentSpawners)}
                                </p>
                            </div>

                            <div className="p-3 rounded-xl bg-muted/30 border border-border">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                                    Potential Gain (1h strat)
                                </p>
                                <p className="font-mono text-xl font-bold text-blue-400">
                                    +{formatNumber(analysis.theoreticalGain)}
                                </p>
                                <p className="text-[10px] text-zinc-500">
                                    If you bought every 1h
                                </p>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-[200px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analysis.chartData}>
                                    <defs>
                                        <linearGradient id="colorSpawners" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#666"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        stroke="#666"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#333", borderRadius: "8px" }}
                                        itemStyle={{ color: "#e4e4e7" }}
                                        formatter={(val: any) => [formatNumber(Number(val)), "Spawners"]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="spawners"
                                        stroke="#3b82f6"
                                        fillOpacity={1}
                                        fill="url(#colorSpawners)"
                                        strokeWidth={2}
                                        name="Theoretical Path"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Efficiency Badge */}
                        <div className={`p-3 rounded-xl border ${analysis.efficiency >= 0.9
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : analysis.efficiency >= 0.5
                                ? "bg-yellow-500/10 border-yellow-500/20"
                                : "bg-red-500/10 border-red-500/20"
                            }`}>
                            <div className="flex items-start gap-2">
                                {analysis.efficiency >= 0.9 ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                                ) : (
                                    <AlertCircle className={`h-4 w-4 mt-0.5 ${analysis.efficiency >= 0.5 ? "text-yellow-400" : "text-red-400"
                                        }`} />
                                )}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-zinc-200">
                                        Efficiency: {(analysis.efficiency * 100).toFixed(0)}%
                                    </p>
                                    <ul className="text-xs space-y-1 text-zinc-400 list-disc list-inside">
                                        {analysis.recommendations.map((rec, i) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Helper for formatting small/large numbers in UI
function formatNumber(n: number, decimals = 0): string {
    if (!isFinite(n)) return "∞";
    return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
}

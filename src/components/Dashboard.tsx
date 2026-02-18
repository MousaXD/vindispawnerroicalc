"use client";

import { useGameStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sword, Wallet } from "lucide-react";
import SettingsPanel from "@/components/SettingsPanel";
import SpawnerRoiCard from "@/components/calculators/SpawnerRoiCard";
import CompoundGrowthChart from "@/components/calculators/CompoundGrowthChart";
import LodestonePlanner from "@/components/calculators/LodestonePlanner";
import ReinvestmentPlanner from "@/components/calculators/ReinvestmentPlanner";
import ResetOptimizer from "@/components/calculators/ResetOptimizer";

export default function Dashboard() {
    const {
        currentSpawners,
        currentBalance,
        setCurrentSpawners,
        setCurrentBalance,
    } = useGameStore();

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100">
            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Sword className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                                VindicatorCalc
                            </h1>
                            <p className="text-[10px] text-zinc-500 -mt-0.5 font-medium tracking-wider uppercase">
                                Minecraft Tycoon Optimizer
                            </p>
                        </div>
                    </div>
                    <SettingsPanel />
                </div>
            </header>

            {/* ── Main Content ────────────────────────────────────────── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* ── User Input Section ─────────────────────────────── */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Current Spawners */}
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
                        <Label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                            <Sword className="h-4 w-4 text-emerald-400" />
                            Current Spawners
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            value={currentSpawners}
                            onChange={(e) =>
                                setCurrentSpawners(parseInt(e.target.value) || 0)
                            }
                            placeholder="1"
                            className="bg-white/[0.04] border-white/[0.08] text-zinc-100 font-mono text-2xl h-14 focus:border-emerald-500/50 focus:ring-emerald-500/20 placeholder:text-zinc-700"
                        />
                    </div>

                    {/* Current Balance */}
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
                        <Label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                            <Wallet className="h-4 w-4 text-emerald-400" />
                            Current Balance
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-zinc-500 font-mono">
                                $
                            </span>
                            <Input
                                type="number"
                                min={0}
                                value={currentBalance}
                                onChange={(e) =>
                                    setCurrentBalance(parseFloat(e.target.value) || 0)
                                }
                                placeholder="0"
                                className="bg-white/[0.04] border-white/[0.08] text-zinc-100 font-mono text-2xl h-14 pl-8 focus:border-emerald-500/50 focus:ring-emerald-500/20 placeholder:text-zinc-700"
                            />
                        </div>
                    </div>
                </section>

                {/* ── Reset Day Optimizer ──────────────────────────────── */}
                <ResetOptimizer />

                {/* ── Stats Cards ─────────────────────────────────────── */}
                <SpawnerRoiCard />

                {/* ── Compound Growth Chart ───────────────────────────── */}
                <CompoundGrowthChart />

                {/* ── Reinvestment Planner ─────────────────────────────── */}
                <ReinvestmentPlanner />

                {/* ── Lodestone Planner ────────────────────────────────── */}
                <LodestonePlanner />
            </main>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <footer className="border-t border-white/[0.04] mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-zinc-600">
                        VindicatorCalc — Optimize your Minecraft economy
                    </p>
                    <p className="text-[10px] text-zinc-700">
                        Not affiliated with Mojang. All values are server-specific.
                    </p>
                </div>
            </footer>
        </div>
    );
}

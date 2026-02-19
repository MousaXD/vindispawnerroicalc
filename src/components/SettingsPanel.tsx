"use client";

import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, RotateCcw } from "lucide-react";
import { useGameStore, DEFAULTS, type GameSettings } from "@/lib/store";

function SettingField({
    label,
    value,
    onChange,
    prefix = "$",
    suffix,
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    prefix?: string;
    suffix?: string;
}) {
    const id = label.replace(/\s+/g, '-').toLowerCase();
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                        {prefix}
                    </span>
                )}
                <Input
                    id={id}
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value) || 0)}
                    className="bg-muted/50 border-input text-foreground font-mono text-sm pl-7 pr-3 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function SettingsPanel() {
    const store = useGameStore();
    const [open, setOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                aria-label="Open Game Settings"
                disabled
            >
                <Settings className="h-5 w-5" />
            </Button>
        );
    }

    const handleUpdate = (key: keyof GameSettings, value: number) => {
        store.updateSettings({ [key]: value });
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                    aria-label="Open Game Settings"
                >
                    <Settings className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-background/95 backdrop-blur-2xl border-white/[0.08] w-[360px] overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="text-zinc-200 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-emerald-400" />
                        Game Constants
                    </SheetTitle>
                    <SheetDescription className="text-zinc-500 text-sm">
                        Adjust the server economy values. Changes apply instantly.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-4">
                    {/* Vindicator Spawner Section */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80 border-b border-white/[0.06] pb-2">
                            ⚔️ Vindicator Spawner
                        </h3>
                        <SettingField
                            label="Spawner Cost"
                            value={store.spawnerCost}
                            onChange={(v) => handleUpdate("spawnerCost", v)}
                        />
                        <SettingField
                            label="Revenue per Cycle"
                            value={store.spawnerRevenue}
                            onChange={(v) => handleUpdate("spawnerRevenue", v)}
                        />
                        <SettingField
                            label="Revenue Interval"
                            value={store.revenueInterval}
                            onChange={(v) => handleUpdate("revenueInterval", v)}
                            prefix=""
                            suffix="min"
                        />
                    </div>

                    {/* Lodestone Section */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400/80 border-b border-white/[0.06] pb-2">
                            🪨 Lodestone
                        </h3>
                        <SettingField
                            label="Lodestone Cost"
                            value={store.lodestoneCost}
                            onChange={(v) => handleUpdate("lodestoneCost", v)}
                        />
                        <SettingField
                            label="Island Levels per Lodestone"
                            value={store.lodestoneValue}
                            onChange={(v) => handleUpdate("lodestoneValue", v)}
                            prefix=""
                        />
                    </div>

                    {/* Server Limits */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/80 border-b border-white/[0.06] pb-2">
                            🌐 Server Limits
                        </h3>
                        <SettingField
                            label="Balance Cap"
                            value={store.balanceLimit}
                            onChange={(v) => handleUpdate("balanceLimit", v)}
                        />
                    </div>

                    {/* Reset button */}
                    <Button
                        variant="outline"
                        onClick={() => store.resetDefaults()}
                        className="w-full mt-4 border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset to Defaults
                    </Button>

                    {/* Default values reference */}
                    <div className="text-[10px] text-zinc-600 space-y-0.5 pt-2 border-t border-white/[0.04]">
                        <p>Default spawner cost: $67,000,000</p>
                        <p>Default spawner revenue: $26,161.38 / 4min</p>
                        <p>Default lodestone cost: $7,500,000</p>
                        <p>Default lodestone value: 300,000 levels</p>
                        <p>Default balance cap: $10,000,000,000,000</p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

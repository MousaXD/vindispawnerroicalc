import { create } from "zustand";

// ── Default game constants ──────────────────────────────────────────
export const DEFAULTS = {
    spawnerCost: 67_000_000,
    spawnerRevenue: 26_161.38,
    revenueInterval: 4, // minutes
    lodestoneCost: 7_500_000,
    lodestoneValue: 300_000,
    balanceLimit: 10_000_000_000_000, // 10 Trillion
} as const;

// ── Store shape ─────────────────────────────────────────────────────
export interface GameSettings {
    spawnerCost: number;
    spawnerRevenue: number;
    revenueInterval: number;
    lodestoneCost: number;
    lodestoneValue: number;
    balanceLimit: number;
}

export interface GameState extends GameSettings {
    // User inputs
    currentSpawners: number;
    currentBalance: number;

    // Actions
    setCurrentSpawners: (n: number) => void;
    setCurrentBalance: (n: number) => void;
    updateSettings: (patch: Partial<GameSettings>) => void;
    resetDefaults: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    // ── defaults
    ...DEFAULTS,

    // ── user inputs
    currentSpawners: 1,
    currentBalance: 0,

    // ── actions
    setCurrentSpawners: (n) => set({ currentSpawners: Math.max(0, n) }),
    setCurrentBalance: (n) => set({ currentBalance: Math.max(0, n) }),

    updateSettings: (patch) =>
        set((s) => ({
            ...s,
            ...patch,
        })),

    resetDefaults: () => set({ ...DEFAULTS }),
}));

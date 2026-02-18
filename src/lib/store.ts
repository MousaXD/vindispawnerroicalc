import { create } from "zustand";

// ── Default game constants ──────────────────────────────────────────
export const DEFAULTS = {
    spawnerCost: 67_000_000,
    spawnerRevenue: 26_161.38,
    revenueInterval: 4, // minutes
    lodestoneCost: 7_500_000,
    lodestoneValue: 300_000,
    balanceLimit: 10_000_000_000_000, // 10 Trillion per account
    sellChestCapacity: 10_000, // spawners per sell chest
} as const;

// ── Store shape ─────────────────────────────────────────────────────
export interface GameSettings {
    spawnerCost: number;
    spawnerRevenue: number;
    revenueInterval: number;
    lodestoneCost: number;
    lodestoneValue: number;
    balanceLimit: number;
    sellChestCapacity: number;
}

export interface GameState extends GameSettings {
    // User inputs
    currentSpawners: number;
    currentBalance: number;
    accountCount: number; // 1-4 accounts

    // Actions
    setCurrentSpawners: (n: number) => void;
    setCurrentBalance: (n: number) => void;
    setAccountCount: (n: number) => void;
    updateSettings: (patch: Partial<GameSettings>) => void;
    resetDefaults: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    // ── defaults
    ...DEFAULTS,

    // ── user inputs
    currentSpawners: 1,
    currentBalance: 0,
    accountCount: 1,

    // ── actions
    setCurrentSpawners: (n) => set({ currentSpawners: Math.max(0, n) }),
    setCurrentBalance: (n) => set({ currentBalance: Math.max(0, n) }),
    setAccountCount: (n) => set({ accountCount: Math.min(4, Math.max(1, n)) }),

    updateSettings: (patch) =>
        set((s) => ({
            ...s,
            ...patch,
        })),

    resetDefaults: () => set({ ...DEFAULTS }),
}));

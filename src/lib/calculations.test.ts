
import { simulateCompoundGrowth, simulateReinvestment, optimizeForReset } from './calculations';

describe('Performance Tests', () => {
    // This test simulates a high balance scenario that would cause the current implementation to hang due to while loops.
    // We expect it to complete almost instantly after the fix.
    test('simulateCompoundGrowth should handle high balance without hanging', () => {
        const startSpawners = 1;
        const startBalance = 10_000_000_000_000; // 10 Trillion
        const durationHours = 24;
        const spawnerCost = 10; // Very cheap spawner relative to balance to trigger massive looping
        const revenuePer4Min = 100;
        const balanceCap = 10_000_000_000_000;

        const start = performance.now();
        simulateCompoundGrowth(
            startSpawners,
            startBalance,
            durationHours,
            spawnerCost,
            revenuePer4Min,
            balanceCap
        );
        const end = performance.now();
        expect(end - start).toBeLessThan(1000); // Should take less than 1s
    });

    test('simulateReinvestment should handle high balance without hanging', () => {
        const startSpawners = 1;
        const startBalance = 10_000_000_000_000;
        const durationDays = 1;
        const intervalHours = 1;
        const spawnerCost = 10;
        const revenuePer4Min = 100;
        const balanceCap = 10_000_000_000_000;

        const start = performance.now();
        simulateReinvestment(
            startSpawners,
            startBalance,
            durationDays,
            intervalHours,
            spawnerCost,
            revenuePer4Min,
            balanceCap
        );
        const end = performance.now();
        expect(end - start).toBeLessThan(1000);
    });

    test('optimizeForReset should handle high balance without hanging', () => {
        const startSpawners = 1;
        const startBalance = 10_000_000_000_000;
        const totalDays = 5;
        const spawnerCost = 10;
        const revenuePer4Min = 100;
        const lodestoneCost = 1000;
        const lodestoneValue = 10;
        const effectiveCap = 10_000_000_000_000;

        const start = performance.now();
        optimizeForReset(
            startSpawners,
            startBalance,
            totalDays,
            spawnerCost,
            revenuePer4Min,
            lodestoneCost,
            lodestoneValue,
            effectiveCap
        );
        const end = performance.now();
        expect(end - start).toBeLessThan(1000);
    });
});

import { Pedometer } from "expo-sensors";
import { useCallback, useEffect, useState } from "react";

export interface DailyHealthSummary {
    steps: number;
    calories: number;
    todayWarnings: number;
}

export function useDailyHealthSummary() {
    const [summary, setSummary] = useState<DailyHealthSummary>({
        steps: 0,
        calories: 0,
        todayWarnings: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDailySummary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const isAvailable = await Pedometer.isAvailableAsync();

            if (!isAvailable) {
                setError("Thiết bị không hỗ trợ đếm bước chân");
                return;
            }

            const now = new Date();

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const result = await Pedometer.getStepCountAsync(
                startOfDay,
                now
            );

            const steps = result.steps ?? 0;

            const calories = Math.round(steps * 0.04);

            const todayWarnings = 1;

            setSummary({
                steps,
                calories,
                todayWarnings,
            });
        } catch (err) {
            console.error("Lỗi lấy dữ liệu sức khỏe:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể lấy dữ liệu sức khỏe"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDailySummary();
    }, [fetchDailySummary]);

    return {
        summary,
        loading,
        error,
        refreshSummary: fetchDailySummary,
    };
}

import { stepService } from "@/api/services/step.service";
import { alertService } from "@/api/services/alert.service";
import { useAuth } from "@/context/AuthContext";
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

    const { user } = useAuth();

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

            let todayWarnings = 0;
            if (user?.id) {
                const countResp = await alertService.getAtrialAlertCount(user.id);
                const count = Number(
                    countResp?.count ??
                    countResp?.total ??
                    countResp?.warning_count ??
                    countResp ??
                    0
                );
                todayWarnings = Number.isFinite(count) ? count : 0;
            }

            setSummary({
                steps,
                calories,
                todayWarnings,
            });

            // Gửi số bước lên server (định dạng theo locale vi-VN)
            try {
                const formatted = steps.toLocaleString("vi-VN");
                if (user?.id) {
                    void stepService
                        .saveSteps(user.id, formatted)
                        .catch((saveErr) => {
                            console.warn(
                                "Lỗi gửi bước chân lên server:",
                                saveErr
                            );
                        });
                }
            } catch (e) {
                // Không block luồng chính nếu gửi bị lỗi
                console.warn("Lỗi gửi bước chân lên server:", e);
            }
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
    }, [user?.id]);

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

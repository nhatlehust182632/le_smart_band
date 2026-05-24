import { alertService } from "@/api/services/alert.service";
import { healthService } from "@/api/services/health.service";

/**
 * Service gom các cuộc gọi BE liên quan đến tổng quan hàng ngày của user.
 * Tên hàm: syncDailySummary
 * - Gọi API push bước chân lên BE
 * - Gọi API lấy số cảnh báo rung nhĩ trong ngày
 * - Gọi API lấy số cảnh báo mất kết nối trong ngày
 *
 * Trường cần thiết:
 * - userId: string (id user trên hệ thống)
 * - date: string (định dạng YYYY-MM-DD)
 * - steps: number (số bước chân trong ngày theo điện thoại)
 *
 * Trả về: { atrialWarningCount: number, disconnectWarningCount: number }
 */

export async function syncDailySummary(userId: string, date: string, steps: number) {
    if (!userId) throw new Error("userId is required");
    if (!date) throw new Error("date is required");

    // Push step count lên BE (token dạng placeholder - callApi xử lý lấy token từ storage khi sử dụng key)
    await healthService.pushHealthData("USER_ACCESS_TOKEN", {
        userId,
        date,
        step_count: steps,
        source: "phone",
    });

    // Lấy số cảnh báo từ BE
    const [atrialResp, disconnectResp] = await Promise.all([
        alertService.getAtrialFibrillationWarningCount(userId, date),
        alertService.getDeviceDisconnectWarningCount(userId, date),
    ]);

    const normalize = (v: any) => Number(v?.count ?? v?.total ?? v ?? 0);

    return {
        atrialWarningCount: normalize(atrialResp),
        disconnectWarningCount: normalize(disconnectResp),
    };
}

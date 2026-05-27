// ======================================================
// CẤU HÌNH CHẾ ĐỘ NHẬN DỮ LIỆU BLE
//
// true:
// - Vẫn scan và connect thiết bị BLE thật.
// - Sau khi connect xong, KHÔNG đợi dữ liệu BLE thật.
// - Dùng packet Base64 demo để đưa vào printData().
//
// false:
// - Vẫn scan và connect thiết bị BLE thật.
// - Sau khi connect xong, nhận dữ liệu thật bằng notify/poll.
// ======================================================
export const USE_DEMO_BLE_DATA = false;

/**
 * Timeout của 1 tập packet.
 *
 * Thời gian bắt đầu tính từ packet đầu tiên của cùng packetId được nhận,
 * không tính từ thời điểm connect BLE.
 *
 * Nếu đủ index type 5 và type 6 trước 30 giây:
 * - batch được chốt ngay với trạng thái COMPLETE.
 *
 * Nếu hết 30 giây mà chưa đủ:
 * - batch được chốt với trạng thái INCOMPLETE/TIMEOUT.
 */
export const BLE_COLLECTION_WINDOW_MS = 30_000;

// Thời gian quét thiết bị BLE.
export const BLE_SCAN_DURATION_MS = 10_000;

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

// Thời gian thu packet sau khi connect xong
export const BLE_COLLECTION_WINDOW_MS = 30_000;

// Thời gian quét BLE
export const BLE_SCAN_DURATION_MS = 10_000;

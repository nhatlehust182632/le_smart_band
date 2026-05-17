import { DEMO_BLE_PACKET_SESSIONS } from "./demoBlePackets";

export type PrintBleDataFn = (
    source: string,
    serviceUUID: string,
    charUUID: string,
    value: string
) => void | Promise<void>;

/**
 * Dừng toàn bộ timer phát packet demo.
 * Dùng khi disconnect hoặc khi chạy lại session mới.
 */
export const stopDemoBlePacketTimers = (
    timers: ReturnType<typeof setTimeout>[]
) => {
    timers.forEach((timer) => clearTimeout(timer));
    timers.length = 0;
};

/**
 * Phát 1 session demo.
 *
 * Mỗi packet Base64 được đẩy vào printData()
 * giống như dữ liệu thật từ BLE đi vào.
 */
export const runDemoBlePacketSession = ({
    sessionIndex,
    printData,
    timers,
}: {
    sessionIndex: number;
    printData: PrintBleDataFn;
    timers: ReturnType<typeof setTimeout>[];
}) => {
    const session =
        DEMO_BLE_PACKET_SESSIONS[
        sessionIndex % DEMO_BLE_PACKET_SESSIONS.length
        ];

    console.log("========== BẮT ĐẦU PHÁT DỮ LIỆU DEMO BLE ==========");
    console.log("SESSION:", session.sessionNo);
    console.log("MAC DEMO:", session.macAddress);
    console.log("TỔNG GÓI:", session.totalPackets);
    console.log("GÓI LOẠI 5:", session.type5PacketCount);
    console.log("GÓI LOẠI 6:", session.type6PacketCount);
    console.log("===================================================");

    session.packets.forEach((packet) => {
        const timer = setTimeout(() => {
            printData(
                "DEMO",
                "DEMO_SERVICE_UUID",
                "DEMO_CHARACTERISTIC_UUID",
                packet.base64
            );
        }, packet.sendAtMs);

        timers.push(timer);
    });

    return session;
};
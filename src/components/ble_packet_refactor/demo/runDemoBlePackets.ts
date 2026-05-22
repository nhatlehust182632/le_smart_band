import { DEMO_BLE_PACKET_SESSIONS } from "./demoBlePackets";

export type PrintBleDataFn = (
    source: string,
    serviceUUID: string,
    charUUID: string,
    value: string
) => void | Promise<void>;

/**
 * Dừng toàn bộ timer đang phát packet demo.
 */
export const stopDemoBlePacketTimers = (
    timers: ReturnType<typeof setTimeout>[]
) => {
    timers.forEach((timer) => clearTimeout(timer));
    timers.length = 0;
};

/**
 * Phát 1 phiên dữ liệu demo.
 *
 * File này không log để tránh làm rối console.
 * Packet demo đi vào printData() giống packet BLE thật.
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

    session.packets.forEach((packet) => {
        const timer = setTimeout(() => {
            void printData(
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

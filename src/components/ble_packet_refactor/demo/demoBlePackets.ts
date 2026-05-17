import { Buffer } from "buffer";

export type DemoBlePacket = {
    packetType: 5 | 6;
    packetId: number;
    packetIndex: number;
    delayMs: number;
    sendAtMs: number;
    base64: string;
};

export type DemoBleSession = {
    sessionNo: number;
    macAddress: string;
    windowMs: number;
    packetIntervalMs: number;
    totalPackets: number;
    type5PacketCount: number;
    type6PacketCount: number;
    packets: DemoBlePacket[];
};

// ======================================================
// CẤU HÌNH DEMO
// ======================================================
const DEMO_SESSION_COUNT = 4;
const DEMO_WINDOW_MS = 30_000;
const DEMO_PACKET_INTERVAL_MS = 500;

const TYPE_5_PACKET_COUNT = 19;
const TYPE_6_PACKET_COUNT = 12;

const RANDOM_MIN = 175_000;
const RANDOM_MAX = 239_000;

// 6 byte MAC demo
const DEMO_MAC_BYTES = [0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6];

const DEMO_MAC_ADDRESS = DEMO_MAC_BYTES
    .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
    .join(":");

// ======================================================
// Sinh số ngẫu nhiên trong khoảng yêu cầu
// ======================================================
const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ======================================================
// Tạo 2 byte header:
//
// [4 bit packetType][7 bit packetId][5 bit packetIndex]
// ======================================================
const createHeaderBytes = (
    packetType: 5 | 6,
    packetId: number,
    packetIndex: number
): number[] => {
    const header16 =
        (packetType << 12) |
        (packetId << 5) |
        packetIndex;

    const byte1 = (header16 >> 8) & 0xff;
    const byte2 = header16 & 0xff;

    return [byte1, byte2];
};

// ======================================================
// Tạo payload cho gói loại 6
//
// 500 byte = 125 giá trị
// Mỗi giá trị = 4 byte
// ======================================================
const createType6Payload = (): number[] => {
    const payload: number[] = [];

    for (let i = 0; i < 125; i++) {
        const value = randomInt(RANDOM_MIN, RANDOM_MAX);

        const buffer = Buffer.alloc(4);
        buffer.writeUInt32BE(value, 0);

        payload.push(...Array.from(buffer));
    }

    return payload;
};

// ======================================================
// Tạo payload cho gói loại 5
//
// 500 byte payload:
// - 83 giá trị × 6 byte = 498 byte
// - thêm 2 byte đệm = 500 byte
// ======================================================
const createType5Payload = (): number[] => {
    const payload: number[] = [];

    for (let i = 0; i < 83; i++) {
        const value = randomInt(RANDOM_MIN, RANDOM_MAX);

        const buffer = Buffer.alloc(6);
        buffer.writeUIntBE(value, 0, 6);

        payload.push(...Array.from(buffer));
    }

    // 2 byte đệm để đủ 500 byte
    payload.push(0x00, 0x00);

    return payload;
};

// ======================================================
// Tạo 1 packet Base64
//
// Cấu trúc:
// - 6 byte MAC
// - 2 byte header
// - 500 byte payload
// => tổng 508 byte
// ======================================================
const createDemoPacketBase64 = (
    packetType: 5 | 6,
    packetId: number,
    packetIndex: number
): string => {
    const headerBytes = createHeaderBytes(
        packetType,
        packetId,
        packetIndex
    );

    const payload =
        packetType === 5
            ? createType5Payload()
            : createType6Payload();

    const packetBytes = [
        ...DEMO_MAC_BYTES,
        ...headerBytes,
        ...payload,
    ];

    const buffer = Buffer.from(packetBytes);

    return buffer.toString("base64");
};

// ======================================================
// Tạo 1 session demo
// - 19 packet loại 5
// - 12 packet loại 6
// - Trộn xen kẽ 6, 5, 6, 5...
// ======================================================
const createDemoSession = (sessionNo: number): DemoBleSession => {
    const type5PacketId = sessionNo;
    const type6PacketId = 50 + sessionNo;

    const type5Packets: DemoBlePacket[] = Array.from(
        { length: TYPE_5_PACKET_COUNT },
        (_, index) => ({
            packetType: 5,
            packetId: type5PacketId,
            packetIndex: index,
            delayMs: DEMO_PACKET_INTERVAL_MS,
            sendAtMs: 0,
            base64: createDemoPacketBase64(
                5,
                type5PacketId,
                index
            ),
        })
    );

    const type6Packets: DemoBlePacket[] = Array.from(
        { length: TYPE_6_PACKET_COUNT },
        (_, index) => ({
            packetType: 6,
            packetId: type6PacketId,
            packetIndex: index,
            delayMs: DEMO_PACKET_INTERVAL_MS,
            sendAtMs: 0,
            base64: createDemoPacketBase64(
                6,
                type6PacketId,
                index
            ),
        })
    );

    // Trộn xen kẽ packet 6 và 5
    const mixedPackets: DemoBlePacket[] = [];

    const maxLength = Math.max(
        type5Packets.length,
        type6Packets.length
    );

    for (let i = 0; i < maxLength; i++) {
        if (type6Packets[i]) {
            mixedPackets.push(type6Packets[i]);
        }

        if (type5Packets[i]) {
            mixedPackets.push(type5Packets[i]);
        }
    }

    // Gán thời gian gửi từng packet cách nhau 500ms
    mixedPackets.forEach((packet, index) => {
        packet.sendAtMs = index * DEMO_PACKET_INTERVAL_MS;
    });

    return {
        sessionNo,
        macAddress: DEMO_MAC_ADDRESS,
        windowMs: DEMO_WINDOW_MS,
        packetIntervalMs: DEMO_PACKET_INTERVAL_MS,
        totalPackets: mixedPackets.length,
        type5PacketCount: TYPE_5_PACKET_COUNT,
        type6PacketCount: TYPE_6_PACKET_COUNT,
        packets: mixedPackets,
    };
};

// ======================================================
// Tạo sẵn 4 phiên demo
// ======================================================
export const DEMO_BLE_PACKET_SESSIONS: DemoBleSession[] =
    Array.from(
        { length: DEMO_SESSION_COUNT },
        (_, index) => createDemoSession(index + 1)
    );
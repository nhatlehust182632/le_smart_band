import type { Buffer } from "buffer";

export type ReadTarget = {
    serviceUUID: string;
    charUUID: string;
};

export type ParsedBlePayload = {
    packetName?: "TYPE_5" | "TYPE_6";
    status?: string;

    expectedPayloadByteLength?: number;
    actualPayloadByteLength?: number;
    payloadByteLength?: number;

    bytesPerValue?: number;
    valueCount?: number;
    values?: number[];

    remainingByteCount?: number;
    remainingBytes?: number[];

    rawBytes: number[];
};

export type ParsedBlePacket = {
    isValid: boolean;
    error?: string;

    buffer: Buffer;
    bufferLength: number;

    hex: string;
    ascii: string;
    dec: number[];
    base64: string;

    mac?: {
        bytes: number[];
        address: string;
    };

    header?: {
        rawBytes: [number, number];
        decimal16: number;
        bits16: string;

        packetType: {
            bits: string;
            dec: number;
        };

        packetId: {
            bits: string;
            dec: number;
        };

        packetIndex: {
            bits: string;
            dec: number;
        };
    };

    payload?: ParsedBlePayload;
};

export type BlePacketItem = {
    index: number;
    source: string;
    serviceUUID: string;
    charUUID: string;
    receivedAt: string;
    elapsedFromConnectMs: number;
    data: ParsedBlePacket;
};

export type GroupedPacketSummary = {
    packetType: 5 | 6;

    expectedPacketCount: number;
    actualPacketCount: number;
    isEnoughPackets: boolean;

    macList: string[];
    macCount: number;

    packetIdList: number[];
    packetIndexList: number[];

    totalDataCount: number;
    totalPayloadByteLength: number;

    mergedValues: number[];
};

export type BlePacketSummary = {
    device: {
        id: string | null;
        name: string | null;
    };

    packetCount: number;

    collectStartedAt: string;
    collectEndedAt: string;
    collectWindowMs: number;

    firstPacketAt: string | null;
    lastPacketAt: string | null;
    receiveDurationMs: number;

    packets: BlePacketItem[];

    groupedPackets: {
        type5: GroupedPacketSummary;
        type6: GroupedPacketSummary;
    };
};

/**
 * 1 cụm nhỏ của type 6.
 *
 * Theo nghiệp vụ:
 * - smallGroup 1: index 1 -> 4
 * - smallGroup 2: index 5 -> 8
 * - smallGroup 3: index 9 -> 12
 *
 * Mỗi cụm nhỏ có:
 * - 4 packet
 * - 4 * 125 = 500 dữ liệu
 */
export type Type6MiniGroup = {
    packetId: number;
    miniGroupNo: 1 | 2 | 3;

    packetIndexes: number[];
    expectedPacketIndexes: number[];
    missingPacketIndexes: number[];

    macList: string[];

    packetCount: number;
    expectedPacketCount: 4;

    values: number[];
    totalDataCount: number;
    expectedDataCount: 500;

    isComplete: boolean;
};

/**
 * Cửa sổ trượt type 6 gồm 3 cụm nhỏ liên tiếp.
 *
 * Tổng dữ liệu:
 * 500 + 500 + 500 = 1500
 */
export type Type6SlidingWindow = {
    windowNo: number;

    miniGroups: [Type6MiniGroup, Type6MiniGroup, Type6MiniGroup];

    packetIds: number[];
    miniGroupNos: Array<1 | 2 | 3>;

    values: number[];
    totalDataCount: number;
    expectedDataCount: 1500;
};

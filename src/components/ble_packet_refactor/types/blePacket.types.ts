import type { Buffer } from "buffer";

export type ReadTarget = {
    serviceUUID: string;
    charUUID: string;
};

export type ParsedBlePayload = {
    packetName?: "TYPE_0" | "TYPE_1" | "TYPE_2" | "TYPE_5" | "TYPE_6";
    status?: string;

    expectedPayloadByteLength?: number;
    actualPayloadByteLength?: number;
    payloadByteLength?: number;

    bytesPerValue?: number;
    valueCount?: number;

    // TYPE 0 - pin
    batteryPercent?: number;

    // TYPE 1 - trạng thái sạc
    chargingRawValue?: number;
    isCharging?: boolean;

    // TYPE 2 - trạng thái gói tin / thiết bị
    statusCode?: number;
    statusName?: string;
    statusPayload?: number[];

    // TYPE 6
    values?: number[];

    // TYPE 5
    xValues?: number[];
    yValues?: number[];
    zValues?: number[];

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

export type BleSystemPacketDetail = {
    packetId: number | null;
    packetIndex: number | null;
    mac: string | null;
    receivedAt: string;

    payloadByteLength: number;
    rawBytes: number[];

    batteryPercent?: number;
    chargingRawValue?: number;
    isCharging?: boolean;
    statusCode?: number;
    statusName?: string;
    statusPayload?: number[];
};

export type GroupedPacketSummary = {
    packetType: 0 | 1 | 2 | 5 | 6;

    expectedPacketCount: number;
    actualPacketCount: number;
    isEnoughPackets: boolean;

    macList: string[];
    macCount: number;

    packetIdList: number[];
    packetIndexList: number[];

    totalDataCount: number;
    totalPayloadByteLength: number;

    // TYPE 0/1/2
    systemPacketDetails?: BleSystemPacketDetail[];

    latestBatteryPercent?: number | null;
    latestIsCharging?: boolean | null;
    latestStatusCode?: number | null;
    latestStatusName?: string | null;

    // TYPE 6
    mergedValues?: number[];

    // TYPE 5
    mergedXValues?: number[];
    mergedYValues?: number[];
    mergedZValues?: number[];
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

export type Type6SlidingWindow = {
    windowNo: number;

    miniGroups: [Type6MiniGroup, Type6MiniGroup, Type6MiniGroup];

    packetIds: number[];
    miniGroupNos: Array<1 | 2 | 3>;

    values: number[];
    totalDataCount: number;
    expectedDataCount: 1500;
};

export type Type5MiniGroup = {
    packetId: number;
    miniGroupNo: 1 | 2 | 3;

    sourcePacketIndexes: number[];
    macList: string[];

    xValues: number[];
    yValues: number[];
    zValues: number[];

    totalDataCountPerAxis: number;
    expectedDataCountPerAxis: 500;

    isComplete: boolean;
};

export type Type5SlidingWindow = {
    windowNo: number;

    miniGroups: [Type5MiniGroup, Type5MiniGroup, Type5MiniGroup];

    packetIds: number[];
    miniGroupNos: Array<1 | 2 | 3>;

    xValues: number[];
    yValues: number[];
    zValues: number[];

    totalDataCountPerAxis: number;
    expectedDataCountPerAxis: 1500;
};

export type SensorFusionModelInput = {
    modelInputNo: number;

    type5WindowNo: number;
    type6WindowNo: number;

    xValues: number[];
    yValues: number[];
    zValues: number[];
    type6Values: number[];

    totalType5DataCountPerAxis: number;
    totalType6DataCount: number;
};

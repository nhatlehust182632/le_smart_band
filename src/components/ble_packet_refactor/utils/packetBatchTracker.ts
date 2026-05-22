import type { BlePacketItem } from "../types/blePacket.types";

export type BleTrackedBatch = {
    packetId: number;
    startedAtMs: number;
    firstReceivedAt: string;
    lastReceivedAt: string;
    packets: BlePacketItem[];
};

export type BleBatchTypeCompleteness = {
    expectedIndexes: number[];
    receivedIndexes: number[];
    missingIndexes: number[];
    packetCount: number;
    isComplete: boolean;
};

export type BleBatchCompleteness = {
    packetId: number;
    isComplete: boolean;
    type5: BleBatchTypeCompleteness;
    type6: BleBatchTypeCompleteness;
};

const EXPECTED_TYPE_5_INDEXES = Array.from(
    { length: 19 },
    (_, index) => index + 1
);

const EXPECTED_TYPE_6_INDEXES = Array.from(
    { length: 12 },
    (_, index) => index + 1
);

const uniqueSortedNumbers = (values: number[]) => {
    return Array.from(new Set(values)).sort((a, b) => a - b);
};

const getPacketType = (packet: BlePacketItem) => {
    return packet.data.header?.packetType.dec;
};

const getPacketIndex = (packet: BlePacketItem) => {
    return packet.data.header?.packetIndex.dec;
};

/**
 * Tạo batch mới từ packet đầu tiên của packetId đó.
 */
export const createBleTrackedBatch = (
    packetId: number,
    firstPacket: BlePacketItem,
    startedAtMs: number
): BleTrackedBatch => {
    return {
        packetId,
        startedAtMs,
        firstReceivedAt: firstPacket.receivedAt,
        lastReceivedAt: firstPacket.receivedAt,
        packets: [firstPacket],
    };
};

/**
 * Thêm packet vào batch.
 *
 * Nếu cùng type + cùng index đã có rồi thì bỏ qua packet trùng,
 * để tránh việc duplicate BLE làm sai tổng hợp dữ liệu.
 */
export const appendPacketToBleTrackedBatch = (
    batch: BleTrackedBatch,
    packet: BlePacketItem
) => {
    const packetType = getPacketType(packet);
    const packetIndex = getPacketIndex(packet);

    const isDuplicate = batch.packets.some((existingPacket) => {
        return (
            getPacketType(existingPacket) === packetType &&
            getPacketIndex(existingPacket) === packetIndex
        );
    });

    if (!isDuplicate) {
        batch.packets.push(packet);
    }

    batch.lastReceivedAt = packet.receivedAt;
};

const getTypeCompleteness = (
    packets: BlePacketItem[],
    packetType: 5 | 6,
    expectedIndexes: number[]
): BleBatchTypeCompleteness => {
    const receivedIndexes = uniqueSortedNumbers(
        packets
            .filter((packet) => getPacketType(packet) === packetType)
            .map((packet) => getPacketIndex(packet))
            .filter((packetIndex): packetIndex is number => {
                return typeof packetIndex === "number";
            })
    );

    const missingIndexes = expectedIndexes.filter((expectedIndex) => {
        return !receivedIndexes.includes(expectedIndex);
    });

    return {
        expectedIndexes,
        receivedIndexes,
        missingIndexes,
        packetCount: receivedIndexes.length,
        isComplete: missingIndexes.length === 0,
    };
};

/**
 * Một batch được coi là hoàn tất khi:
 * - Type 5 đã có đủ index 1 -> 19
 * - Type 6 đã có đủ index 1 -> 12
 *
 * Các type khác có thể tồn tại trong cùng packetId,
 * nhưng hiện tại không được dùng để xác định batch COMPLETE.
 */
export const getBleTrackedBatchCompleteness = (
    batch: BleTrackedBatch
): BleBatchCompleteness => {
    const type5 = getTypeCompleteness(
        batch.packets,
        5,
        EXPECTED_TYPE_5_INDEXES
    );

    const type6 = getTypeCompleteness(
        batch.packets,
        6,
        EXPECTED_TYPE_6_INDEXES
    );

    return {
        packetId: batch.packetId,
        isComplete: type5.isComplete && type6.isComplete,
        type5,
        type6,
    };
};

/**
 * Helper mô tả vòng packetId mà firmware đang nói tới.
 * Batch-completion hiện tại không cần phụ thuộc vào helper này,
 * vì nó phân biệt batch bằng chính packetId thực tế nhận được.
 */
export const getExpectedNextPacketIdModulo255 = (currentPacketId: number) => {
    return currentPacketId >= 127 ? 0 : currentPacketId + 1;
};

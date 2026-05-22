import type {
    BlePacketItem,
    Type5MiniGroup,
    Type5SlidingWindow,
} from "../types/blePacket.types";

const TYPE_5_PACKET_COUNT = 19;
const TYPE_5_VALUES_PER_FULL_PACKET = 83;
const TYPE_5_VALUES_TO_KEEP_FROM_LAST_PACKET = 6;
const TYPE_5_TARGET_SAMPLE_COUNT_PER_AXIS = 1500;
const TYPE_5_MINI_GROUP_SAMPLE_COUNT_PER_AXIS = 500;

const EXPECTED_TYPE_5_PACKET_INDEXES = Array.from(
    { length: TYPE_5_PACKET_COUNT },
    (_, index) => index + 1
);

type AxisValues = {
    xValues: number[];
    yValues: number[];
    zValues: number[];
};

/**
 * Với type 5:
 * - Packet index 1 -> 18: giữ toàn bộ 83 mẫu/trục.
 * - Packet index 19: packet vẫn đủ 83 mẫu/trục,
 *   nhưng chỉ giữ 6 mẫu đầu và bỏ 77 mẫu dư.
 */
const getRetainedType5AxisValues = (
    packet: BlePacketItem
): AxisValues => {
    const packetIndex = packet.data.header?.packetIndex.dec;

    const rawXValues = packet.data.payload?.xValues ?? [];
    const rawYValues = packet.data.payload?.yValues ?? [];
    const rawZValues = packet.data.payload?.zValues ?? [];

    const keepCount =
        packetIndex === 19
            ? TYPE_5_VALUES_TO_KEEP_FROM_LAST_PACKET
            : TYPE_5_VALUES_PER_FULL_PACKET;

    return {
        xValues: rawXValues.slice(0, keepCount),
        yValues: rawYValues.slice(0, keepCount),
        zValues: rawZValues.slice(0, keepCount),
    };
};

/**
 * Tổng hợp type 5 của 1 tập dữ liệu 30 giây.
 *
 * Quy ước:
 * - Có 19 packet type 5 cùng packetId.
 * - Cả 19 packet đều đủ 506 byte, parse ra 83 mẫu/trục.
 * - Khi tổng hợp:
 *      + packet 1 -> 18: giữ toàn bộ 83 mẫu/trục.
 *      + packet 19: chỉ giữ 6 mẫu đầu/trục, bỏ 77 mẫu dư.
 * - Tổng sau khi bỏ dư:
 *      18 * 83 + 6 = 1500 mẫu/trục.
 *
 * Sau khi có 1500 mẫu/trục:
 * - Chia thành 3 mini group.
 * - Mỗi mini group có 500 mẫu/trục.
 */
export const buildType5MiniGroupsFromPackets = (
    packets: BlePacketItem[]
): Type5MiniGroup[] => {
    const type5Packets = packets.filter((packet) => {
        return (
            packet.data.isValid &&
            packet.data.header?.packetType.dec === 5
        );
    });

    const packetsById = new Map<number, BlePacketItem[]>();

    type5Packets.forEach((packet) => {
        const packetId = packet.data.header?.packetId.dec;

        if (typeof packetId !== "number") {
            return;
        }

        const current = packetsById.get(packetId) ?? [];
        current.push(packet);
        packetsById.set(packetId, current);
    });

    const miniGroups: Type5MiniGroup[] = [];

    packetsById.forEach((packetsOfSameId, packetId) => {
        const sortedPackets = packetsOfSameId.sort((a, b) => {
            const indexA = a.data.header?.packetIndex.dec ?? 0;
            const indexB = b.data.header?.packetIndex.dec ?? 0;
            return indexA - indexB;
        });

        const sourcePacketIndexes = sortedPackets
            .map((packet) => packet.data.header?.packetIndex.dec)
            .filter(
                (packetIndex): packetIndex is number =>
                    typeof packetIndex === "number"
            );

        const missingPacketIndexes = EXPECTED_TYPE_5_PACKET_INDEXES.filter(
            (expectedIndex) => !sourcePacketIndexes.includes(expectedIndex)
        );

        const unexpectedPacketIndexes = sourcePacketIndexes.filter(
            (packetIndex) =>
                !EXPECTED_TYPE_5_PACKET_INDEXES.includes(packetIndex)
        );

        const macList = Array.from(
            new Set(
                sortedPackets
                    .map((packet) => packet.data.mac?.address)
                    .filter((mac): mac is string => Boolean(mac))
            )
        );

        const retainedAxisValues = sortedPackets.map((packet) => {
            return getRetainedType5AxisValues(packet);
        });

        const mergedXValues = retainedAxisValues.flatMap((values) => {
            return values.xValues;
        });

        const mergedYValues = retainedAxisValues.flatMap((values) => {
            return values.yValues;
        });

        const mergedZValues = retainedAxisValues.flatMap((values) => {
            return values.zValues;
        });

        const hasExactly19Packets =
            sortedPackets.length === TYPE_5_PACKET_COUNT;

        const hasFullExpectedIndexes =
            missingPacketIndexes.length === 0 &&
            unexpectedPacketIndexes.length === 0;

        const hasExactly1500Samples =
            mergedXValues.length === TYPE_5_TARGET_SAMPLE_COUNT_PER_AXIS &&
            mergedYValues.length === TYPE_5_TARGET_SAMPLE_COUNT_PER_AXIS &&
            mergedZValues.length === TYPE_5_TARGET_SAMPLE_COUNT_PER_AXIS;

        for (let miniGroupIndex = 0; miniGroupIndex < 3; miniGroupIndex++) {
            const start =
                miniGroupIndex *
                TYPE_5_MINI_GROUP_SAMPLE_COUNT_PER_AXIS;

            const end =
                start +
                TYPE_5_MINI_GROUP_SAMPLE_COUNT_PER_AXIS;

            const xValues = mergedXValues.slice(start, end);
            const yValues = mergedYValues.slice(start, end);
            const zValues = mergedZValues.slice(start, end);

            const hasEnough500Samples =
                xValues.length === TYPE_5_MINI_GROUP_SAMPLE_COUNT_PER_AXIS &&
                yValues.length === TYPE_5_MINI_GROUP_SAMPLE_COUNT_PER_AXIS &&
                zValues.length === TYPE_5_MINI_GROUP_SAMPLE_COUNT_PER_AXIS;

            miniGroups.push({
                packetId,
                miniGroupNo: (miniGroupIndex + 1) as 1 | 2 | 3,

                sourcePacketIndexes,
                macList,

                xValues,
                yValues,
                zValues,

                totalDataCountPerAxis: Math.min(
                    xValues.length,
                    yValues.length,
                    zValues.length
                ),

                expectedDataCountPerAxis: 500,

                isComplete:
                    hasExactly19Packets &&
                    hasFullExpectedIndexes &&
                    hasExactly1500Samples &&
                    hasEnough500Samples,
            });
        }
    });

    return miniGroups.sort((a, b) => {
        if (a.packetId !== b.packetId) {
            return a.packetId - b.packetId;
        }

        return a.miniGroupNo - b.miniGroupNo;
    });
};

/**
 * Ghép 3 mini group type 5 thành 1 cửa sổ 1500 mẫu/trục.
 */
export const createType5SlidingWindow = (
    windowNo: number,
    miniGroups: [Type5MiniGroup, Type5MiniGroup, Type5MiniGroup]
): Type5SlidingWindow => {
    const xValues = miniGroups.flatMap((miniGroup) => miniGroup.xValues);
    const yValues = miniGroups.flatMap((miniGroup) => miniGroup.yValues);
    const zValues = miniGroups.flatMap((miniGroup) => miniGroup.zValues);

    return {
        windowNo,
        miniGroups,

        packetIds: miniGroups.map((miniGroup) => miniGroup.packetId),
        miniGroupNos: miniGroups.map((miniGroup) => miniGroup.miniGroupNo),

        xValues,
        yValues,
        zValues,

        totalDataCountPerAxis: Math.min(
            xValues.length,
            yValues.length,
            zValues.length
        ),

        expectedDataCountPerAxis: 1500,
    };
};

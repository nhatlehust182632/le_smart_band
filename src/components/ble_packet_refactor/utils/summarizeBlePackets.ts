import type {
    BlePacketItem,
    GroupedPacketSummary,
} from "../types/blePacket.types";

const TYPE_5_VALUES_PER_FULL_PACKET = 83;
const TYPE_5_VALUES_TO_KEEP_FROM_LAST_PACKET = 6;

const uniqueNumberList = (values: number[]) => Array.from(new Set(values));

type AxisValues = {
    xValues: number[];
    yValues: number[];
    zValues: number[];
};

/**
 * Để log và summary phản ánh đúng dữ liệu sẽ đi vào model:
 * - Packet type 5 index 1 -> 18: giữ 83 mẫu/trục.
 * - Packet type 5 index 19: chỉ giữ 6 mẫu đầu/trục, bỏ 77 mẫu dư.
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

export const buildGroupedPacketSummary = (
    packets: BlePacketItem[],
    packetType: 5 | 6
): GroupedPacketSummary => {
    const expectedPacketCount = packetType === 5 ? 19 : 12;

    const filteredPackets = packets
        .filter((packet) => {
            return (
                packet.data.isValid &&
                packet.data.header?.packetType.dec === packetType
            );
        })
        .sort((a, b) => {
            const indexA = a.data.header?.packetIndex.dec ?? 0;
            const indexB = b.data.header?.packetIndex.dec ?? 0;
            return indexA - indexB;
        });

    const macList = Array.from(
        new Set(
            filteredPackets
                .map((packet) => packet.data.mac?.address)
                .filter((mac): mac is string => Boolean(mac))
        )
    );

    const packetIdList = uniqueNumberList(
        filteredPackets
            .map((packet) => packet.data.header?.packetId.dec)
            .filter((packetId): packetId is number => typeof packetId === "number")
    );

    const packetIndexList = filteredPackets
        .map((packet) => packet.data.header?.packetIndex.dec)
        .filter((packetIndex): packetIndex is number => typeof packetIndex === "number");

    const totalPayloadByteLength = filteredPackets.reduce((sum, packet) => {
        return sum + (packet.data.payload?.actualPayloadByteLength ?? 0);
    }, 0);

    if (packetType === 5) {
        const retainedAxisValues = filteredPackets.map((packet) => {
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

        return {
            packetType,
            expectedPacketCount,
            actualPacketCount: filteredPackets.length,
            isEnoughPackets: filteredPackets.length === expectedPacketCount,

            macList,
            macCount: macList.length,
            packetIdList,
            packetIndexList,

            totalDataCount: mergedXValues.length,
            totalPayloadByteLength,
            mergedXValues,
            mergedYValues,
            mergedZValues,
        };
    }

    const mergedValues = filteredPackets.flatMap((packet) => {
        const values = packet.data.payload?.values;
        return Array.isArray(values) ? values : [];
    });

    return {
        packetType,
        expectedPacketCount,
        actualPacketCount: filteredPackets.length,
        isEnoughPackets: filteredPackets.length === expectedPacketCount,

        macList,
        macCount: macList.length,
        packetIdList,
        packetIndexList,

        totalDataCount: mergedValues.length,
        totalPayloadByteLength,
        mergedValues,
    };
};

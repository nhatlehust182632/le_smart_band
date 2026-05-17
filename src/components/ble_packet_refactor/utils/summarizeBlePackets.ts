import type {
    BlePacketItem,
    GroupedPacketSummary,
} from "../types/blePacket.types";

/**
 * Gom packet cùng loại:
 * - Lọc theo packetType
 * - Sắp xếp theo packetIndex
 * - Gộp payload.values thành 1 mảng liên tục
 */
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

    // =========================
    // 1. Danh sách MAC xuất hiện
    // =========================
    const macList = Array.from(
        new Set(
            filteredPackets
                .map((packet) => packet.data.mac?.address)
                .filter((mac): mac is string => Boolean(mac))
        )
    );

    // =========================
    // 2. Danh sách packet ID
    // =========================
    const packetIdList = filteredPackets
        .map((packet) => packet.data.header?.packetId.dec)
        .filter((id): id is number => typeof id === "number");

    // =========================
    // 3. Danh sách packet index
    // =========================
    const packetIndexList = filteredPackets
        .map((packet) => packet.data.header?.packetIndex.dec)
        .filter((index): index is number => typeof index === "number");

    // =========================
    // 4. Gộp dữ liệu của các packet cùng loại
    // =========================
    const mergedValues = filteredPackets.flatMap((packet) => {
        const values = packet.data.payload?.values;

        return Array.isArray(values) ? values : [];
    });

    // =========================
    // 5. Tổng số byte payload của loại gói đó
    // =========================
    const totalPayloadByteLength = filteredPackets.reduce(
        (sum, packet) => {
            return (
                sum +
                (packet.data.payload?.actualPayloadByteLength ?? 0)
            );
        },
        0
    );

    return {
        packetType,

        expectedPacketCount,
        actualPacketCount: filteredPackets.length,
        isEnoughPackets:
            filteredPackets.length === expectedPacketCount,

        macList,
        macCount: macList.length,

        packetIdList,
        packetIndexList,

        totalDataCount: mergedValues.length,
        totalPayloadByteLength,

        mergedValues,
    };
};

/**
 * Log gọn phần tổng hợp của 1 loại gói.
 */
export const logGroupedPacketSummary = (
    title: string,
    summary: GroupedPacketSummary
) => {
    console.log(`========== ${title} ==========`);

    console.log("MAC LIST:", summary.macList);
    console.log("SỐ MAC:", summary.macCount);

    console.log("PACKET ID LIST:", summary.packetIdList);
    console.log("PACKET INDEX LIST:", summary.packetIndexList);

    console.log("SỐ GÓI NHẬN ĐƯỢC:", summary.actualPacketCount);
    console.log("SỐ GÓI KỲ VỌNG:", summary.expectedPacketCount);
    console.log("ĐỦ GÓI:", summary.isEnoughPackets);

    console.log("TỔNG SỐ DỮ LIỆU:", summary.totalDataCount);
    console.log("TỔNG BYTE PAYLOAD:", summary.totalPayloadByteLength);

    console.log("DỮ LIỆU ĐÃ GỘP:", summary.mergedValues);

    console.log("=================================");
};
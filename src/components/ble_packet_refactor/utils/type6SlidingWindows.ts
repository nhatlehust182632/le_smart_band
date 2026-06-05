import type {
    BlePacketItem,
    Type6MiniGroup,
    Type6SlidingWindow,
} from "../types/blePacket.types";

type Type6MiniGroupSpec = {
    miniGroupNo: 1 | 2 | 3;
    expectedPacketIndexes: number[];
};

const TYPE_6_MINI_GROUP_SPECS: Type6MiniGroupSpec[] = [
    {
        miniGroupNo: 1,
        expectedPacketIndexes: [0, 1, 2, 3],
    },
    {
        miniGroupNo: 2,
        expectedPacketIndexes: [4, 5, 6, 7],
    },
    {
        miniGroupNo: 3,
        expectedPacketIndexes: [8, 9, 10, 11],
    },
];

/**
 * Tách packet type 6 của một phiên 30 giây thành các cụm nhỏ.
 *
 * Mỗi packetId đại diện cho một tập type 6 trong chu kỳ đó.
 * Với từng packetId:
 * - nhóm 1: index 1 -> 4
 * - nhóm 2: index 5 -> 8
 * - nhóm 3: index 9 -> 12
 */
export const buildType6MiniGroupsFromPackets = (
    packets: BlePacketItem[]
): Type6MiniGroup[] => {
    const type6Packets = packets.filter((packet) => {
        return (
            packet.data.isValid &&
            packet.data.header?.packetType.dec === 6
        );
    });

    const packetsById = new Map<number, BlePacketItem[]>();

    type6Packets.forEach((packet) => {
        const packetId = packet.data.header?.packetId.dec;

        if (typeof packetId !== "number") {
            return;
        }

        const current = packetsById.get(packetId) ?? [];
        current.push(packet);
        packetsById.set(packetId, current);
    });

    const miniGroups: Type6MiniGroup[] = [];

    packetsById.forEach((packetsOfSameId, packetId) => {
        TYPE_6_MINI_GROUP_SPECS.forEach((spec) => {
            const groupPackets = packetsOfSameId
                .filter((packet) => {
                    const packetIndex = packet.data.header?.packetIndex.dec;
                    return (
                        typeof packetIndex === "number" &&
                        spec.expectedPacketIndexes.includes(packetIndex)
                    );
                })
                .sort((a, b) => {
                    const indexA = a.data.header?.packetIndex.dec ?? 0;
                    const indexB = b.data.header?.packetIndex.dec ?? 0;
                    return indexA - indexB;
                });

            const packetIndexes = groupPackets
                .map((packet) => packet.data.header?.packetIndex.dec)
                .filter((packetIndex): packetIndex is number => typeof packetIndex === "number");

            const missingPacketIndexes = spec.expectedPacketIndexes.filter(
                (expectedIndex) => !packetIndexes.includes(expectedIndex)
            );

            const values = groupPackets.flatMap((packet) => {
                const packetValues = packet.data.payload?.values;
                return Array.isArray(packetValues) ? packetValues : [];
            });

            const macList = Array.from(
                new Set(
                    groupPackets
                        .map((packet) => packet.data.mac?.address)
                        .filter((mac): mac is string => Boolean(mac))
                )
            );

            const isComplete =
                groupPackets.length === 4 &&
                missingPacketIndexes.length === 0 &&
                values.length === 500;

            miniGroups.push({
                packetId,
                miniGroupNo: spec.miniGroupNo,

                packetIndexes,
                expectedPacketIndexes: spec.expectedPacketIndexes,
                missingPacketIndexes,

                macList,

                packetCount: groupPackets.length,
                expectedPacketCount: 4,

                values,
                totalDataCount: values.length,
                expectedDataCount: 500,

                isComplete,
            });
        });
    });

    return miniGroups.sort((a, b) => {
        if (a.packetId !== b.packetId) {
            return a.packetId - b.packetId;
        }

        return a.miniGroupNo - b.miniGroupNo;
    });
};

/**
 * Tạo 1 cửa sổ trượt 1500 dữ liệu từ 3 cụm nhỏ liên tiếp.
 */
export const createType6SlidingWindow = (
    windowNo: number,
    miniGroups: [Type6MiniGroup, Type6MiniGroup, Type6MiniGroup]
): Type6SlidingWindow => {
    const values = miniGroups.flatMap((miniGroup) => miniGroup.values);

    return {
        windowNo,
        miniGroups,

        packetIds: miniGroups.map((miniGroup) => miniGroup.packetId),
        miniGroupNos: miniGroups.map((miniGroup) => miniGroup.miniGroupNo),

        values,
        totalDataCount: values.length,
        expectedDataCount: 1500,
    };
};

/**
 * Hàm demo xử lý 1500 dữ liệu type 6.
 *
 * Sau này bạn thay nội dung hàm này bằng:
 * - tiền xử lý tín hiệu
 * - gọi model TinyTCN
 * - trả về xác suất AF
 *
 * Tôi để async để sau này bạn thay model thật vào
 * mà không cần sửa lại luồng xử lý queue.
 */
export const processType6SlidingWindowDemo = async (
    window: Type6SlidingWindow
): Promise<number> => {
    if (window.values.length === 0) {
        return 0;
    }

    const sum = window.values.reduce((total, value) => total + value, 0);
    const average = sum / window.values.length;

    return Number(average.toFixed(2));
};

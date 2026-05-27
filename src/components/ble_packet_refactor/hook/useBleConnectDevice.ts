import { useEffect, useRef, useState } from "react";
import {
    AppState,
    PermissionsAndroid,
    Platform,
} from "react-native";
import {
    BleManager,
    Device,
    State,
    Subscription,
} from "react-native-ble-plx";

import {
    BLE_COLLECTION_WINDOW_MS,
    BLE_SCAN_DURATION_MS,
    USE_DEMO_BLE_DATA,
} from "../config/ble.config";

import type {
    BlePacketItem,
    GroupedPacketSummary,
    ReadTarget,
    SensorFusionModelInput,
    Type5MiniGroup,
    Type5SlidingWindow,
    Type6MiniGroup,
    Type6SlidingWindow,
} from "../types/blePacket.types";

import { devicesSource } from "@/data-sources/devicesSource";
import { decodeBlePacket } from "../utils/decodeBlePacket";

import {
    buildGroupedPacketSummary,
} from "../utils/summarizeBlePackets";

import {
    buildType5MiniGroupsFromPackets,
    createType5SlidingWindow,
} from "../utils/type5SlidingWindows";

import {
    buildType6MiniGroupsFromPackets,
    createType6SlidingWindow,
} from "../utils/type6SlidingWindows";

import { alertService } from "@/api/services/alert.service";
import { heartRateSource } from "@/data-sources/heartRateSource";
import { calculateHeartRateFromType6 } from "../utils/sensorSignalProcessing";

import {
    createSensorFusionModelInput,
    processSensorFusionModelDemo,
} from "../utils/sensorFusionModelDemo";

import {
    runDemoBlePacketSession,
    stopDemoBlePacketTimers,
} from "../demo/runDemoBlePackets";

import {
    appendPacketToBleTrackedBatch,
    createBleTrackedBatch,
    getBleTrackedBatchCompleteness,
    type BleTrackedBatch,
} from "../utils/packetBatchTracker";

/**
 * Hook điều phối toàn bộ nghiệp vụ BLE:
 *
 * 1. Scan và connect thiết bị.
 * 2. Sau connect:
 *      - DEMO: bơm packet Base64 demo vào printData().
 *      - REAL: nhận packet thật qua Notify/Poll.
 * 3. Batch packet được gom theo packetId:
 *      - Batch bắt đầu tại thời điểm packet đầu tiên của packetId đó xuất hiện.
 *      - Một batch được coi là COMPLETE khi:
 *          + Type 5 đủ index 1 -> 19
 *          + Type 6 đủ index 1 -> 12
 *      - Nếu packetId mới tới khi batch cũ chưa đủ:
 *          + Batch cũ được chốt INCOMPLETE.
 *      - Nếu hết 30 giây từ packet đầu tiên mà chưa đủ:
 *          + Batch cũ được chốt TIMEOUT.
 * 4. Sau khi batch được chốt:
 *      - Tổng hợp type 5 / type 6
 *      - Tạo sliding window
 *      - Ghép 4 mảng đầu vào model demo
 * 5. Model input chạy tuần tự, BLE vẫn tiếp tục nhận batch mới.
 */
export const useBleConnectDevice = (
    autoConnectDeviceId?: string,
    autoConnectUserId?: string
) => {
    const bleManagerRef = useRef(new BleManager());

    const deviceRef = useRef<Device | null>(null);
    const notifySubscriptionsRef = useRef<Subscription[]>([]);

    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const activeBatchTimeoutRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const demoPacketTimersRef =
        useRef<ReturnType<typeof setTimeout>[]>([]);

    const demoNextBatchTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const demoSessionIndexRef = useRef(0);
    const isAutoConnectingRef = useRef(false);
    const userRequestedDisconnectRef = useRef(false);
    const lastAutoConnectDeviceIdRef = useRef<string | undefined>(undefined);
    const connectionActionIdRef = useRef(0);

    /**
     * Batch đang được thu theo packetId.
     */
    const activePacketBatchRef = useRef<BleTrackedBatch | null>(null);

    /**
     * Dùng để bỏ qua packet trễ/duplicate của batch đã COMPLETE
     * trong phần thời gian còn lại của chu kỳ 30 giây.
     */
    const lastFinalizedBatchRef = useRef<{
        packetId: number;
        startedAtMs: number;
        finalizedAtMs: number;
    } | null>(null);

    /**
     * Thứ tự packet đi vào app, dùng để debug nội bộ và giữ thứ tự ổn định.
     */
    const packetItemSequenceRef = useRef(0);

    /**
     * Queue mini group type 5.
     * Chỉ giữ tối đa 2 group gần nhất sau khi tạo xong 1 window,
     * để group mới tiếp theo có thể tạo sliding window:
     * A1+A2+A3, A2+A3+B1, A3+B1+B2, ...
     */
    const type5MiniGroupQueueRef = useRef<Type5MiniGroup[]>([]);
    const type5SlidingWindowQueueRef = useRef<Type5SlidingWindow[]>([]);
    const type5WindowCounterRef = useRef(0);

    /**
     * Queue mini group type 6.
     * Cách chạy sliding window giống type 5.
     */
    const type6MiniGroupQueueRef = useRef<Type6MiniGroup[]>([]);
    const type6SlidingWindowQueueRef = useRef<Type6SlidingWindow[]>([]);
    const type6WindowCounterRef = useRef(0);

    /**
     * Queue đầu vào cuối cùng cho hàm demo/model.
     *
     * Mỗi item gồm 4 mảng:
     * - xValues: 1500 mẫu type 5
     * - yValues: 1500 mẫu type 5
     * - zValues: 1500 mẫu type 5
     * - type6Values: 1500 mẫu type 6
     */
    const sensorFusionProcessingQueueRef =
        useRef<SensorFusionModelInput[]>([]);

    const sensorFusionModelInputCounterRef = useRef(0);
    const isProcessingSensorFusionQueueRef = useRef(false);
    const lastAtrialNotificationAtRef = useRef(0);

    const [scanModalVisible, setScanModalVisible] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState("Chưa kết nối");
    const [connectedDevice, setConnectedDevice] =
        useState<Device | null>(null);

    const currentUserIdRef = useRef<string | null>(null);
    const connectedUserDeviceRef = useRef<{
        user_device_id?: string;
        device_id?: string;
    } | null>(null);
    const type6MacAddressRef = useRef<string | null>(null);

    /**
     * Reset batch packet đang active.
     * Không xóa queue model/sliding-window.
     */
    const resetActivePacketBatch = () => {
        activePacketBatchRef.current = null;

        if (activeBatchTimeoutRef.current) {
            clearTimeout(activeBatchTimeoutRef.current);
            activeBatchTimeoutRef.current = null;
        }
    };

    /**
     * Xóa toàn bộ queue xử lý model/window.
     * Dùng khi người dùng chủ động ngắt kết nối hoặc màn hình unmount.
     */
    const resetProcessingQueues = () => {
        type5MiniGroupQueueRef.current = [];
        type5SlidingWindowQueueRef.current = [];
        type5WindowCounterRef.current = 0;

        type6MiniGroupQueueRef.current = [];
        type6SlidingWindowQueueRef.current = [];
        type6WindowCounterRef.current = 0;

        sensorFusionProcessingQueueRef.current = [];
        sensorFusionModelInputCounterRef.current = 0;
        isProcessingSensorFusionQueueRef.current = false;

        lastFinalizedBatchRef.current = null;
        type6MacAddressRef.current = null;
    };


    /**
     * Hiển thị 1 giá trị đơn nếu danh sách chỉ có 1 phần tử,
     * ngược lại giữ nguyên danh sách để dễ phát hiện nhiều ID/MAC khác nhau.
     */
    const compactSingleOrList = <T,>(values: T[]): T | T[] | [] => {
        if (values.length === 0) {
            return [];
        }

        if (values.length === 1) {
            return values[0];
        }

        return values;
    };

    /**
     * Log tóm tắt dữ liệu thu được của từng loại gói sau mỗi cửa sổ 30 giây.
     *
     * Chỉ log các thông tin cần theo dõi:
     * - type
     * - MAC
     * - packetIds
     * - packetIndexes
     * - tổng số dữ liệu
     * - thời gian nhận được theo type
     */
    const logBleTypeCollectionSummary = (
        packets: BlePacketItem[],
        groupedSummary: GroupedPacketSummary
    ) => {
        const packetsOfType = packets.filter((packet) => {
            return (
                packet.data.header?.packetType.dec === groupedSummary.packetType
            );
        });

        const receivedTimestamps = packetsOfType
            .map((packet) => Date.parse(packet.receivedAt))
            .filter((timestamp) => Number.isFinite(timestamp));

        const firstReceivedAt =
            receivedTimestamps.length > 0
                ? new Date(Math.min(...receivedTimestamps)).toISOString()
                : null;

        const lastReceivedAt =
            receivedTimestamps.length > 0
                ? new Date(Math.max(...receivedTimestamps)).toISOString()
                : null;

        const receiveDurationMs =
            receivedTimestamps.length > 1
                ? Math.max(...receivedTimestamps) -
                Math.min(...receivedTimestamps)
                : 0;

        /**
         * Với type 5, các độ dài bên dưới là số lượng SAU KHI:
         * - giữ toàn bộ 18 gói đầu
         * - gói index 19 chỉ giữ 6 mẫu đầu
         * - bỏ 77 mẫu dư
         *
         * Vì vậy type5x/type5y/type5z phải là 1500 khi dữ liệu đủ.
         */
        const totalData =
            groupedSummary.packetType === 5
                ? {
                    type5x: groupedSummary.mergedXValues?.length ?? 0,
                    type5y: groupedSummary.mergedYValues?.length ?? 0,
                    type5z: groupedSummary.mergedZValues?.length ?? 0,
                }
                : {
                    type6: groupedSummary.mergedValues?.length ?? 0,
                };

        // console.log("[BLE TYPE SUMMARY]", {
        //     type: groupedSummary.packetType,
        //     mac: compactSingleOrList(groupedSummary.macList),
        //     packetIds: compactSingleOrList(groupedSummary.packetIdList),
        //     packetIndexes: groupedSummary.packetIndexList,
        //     totalData,
        //     receiveTime: {
        //         firstReceivedAt,
        //         lastReceivedAt,
        //         receiveDurationMs,
        //     },
        // });
    };

    /**
     * Dừng các tác vụ BLE phụ:
     * - scan
     * - timeout scan
     * - notify subscriptions
     * - poll interval
     */
    const stopAll = () => {
        bleManagerRef.current.stopDeviceScan();

        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
        }

        notifySubscriptionsRef.current.forEach((subscription) => {
            subscription.remove();
        });
        notifySubscriptionsRef.current = [];

        if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
        }

        setScanning(false);
    };

    /**
     * Ngắt kết nối BLE hoàn toàn.
     */
    const disconnect = async () => {
        userRequestedDisconnectRef.current = true;
        connectionActionIdRef.current += 1;

        try {
            stopAll();
            stopDemoBlePacketTimers(demoPacketTimersRef.current);

            if (demoNextBatchTimerRef.current) {
                clearTimeout(demoNextBatchTimerRef.current);
                demoNextBatchTimerRef.current = null;
            }

            resetActivePacketBatch();
            resetProcessingQueues();

            currentUserIdRef.current = null;
            connectedUserDeviceRef.current = null;

            if (deviceRef.current) {
                await deviceRef.current.cancelConnection();
            }

            deviceRef.current = null;
            setConnectedDevice(null);
            setStatus("Đã ngắt kết nối");
        } catch {
        }
    };

    const submitHeartRateActive = async (bpm: number) => {
        const idUser = currentUserIdRef.current;

        if (!idUser) {
            return;
        }

        try {
            const response = await heartRateSource.saveHeartRateActive(
                idUser,
                bpm,
                type6MacAddressRef.current ?? undefined,
                connectedUserDeviceRef.current?.device_id,
            );

            // console.log("[HEART RATE ACTIVE SAVED]", response);
        } catch (error) {
            console.warn("[HEART RATE ACTIVE SAVE FAILED]", error);
        }
    };

    const notifyAtrialAlertInBackground = async (thresholdValue: number) => {
        const appState = AppState.currentState;
        if (appState === "active") {
            return;
        }

        const now = Date.now();
        if (now - lastAtrialNotificationAtRef.current < 30000) {
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const Notifications = require("expo-notifications");

            if (!Notifications?.scheduleNotificationAsync) {
                return;
            }

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Cảnh báo rung nhĩ",
                    body: `Phát hiện chỉ số bất thường (${thresholdValue.toFixed(4)}). Vui lòng mở ứng dụng để kiểm tra.`,
                    sound: "default",
                },
                trigger: null,
            });

            lastAtrialNotificationAtRef.current = now;
        } catch (error) {
            console.warn("[ATRIAL BACKGROUND NOTIFY FAILED]", error);
        }
    };

    const submitAtrialAlertIfNeeded = async (modelProbability: number) => {
        const userId = currentUserIdRef.current;

        if (!userId) {
            return;
        }

        if (modelProbability <= 0.05) {
            return;
        }

        try {
            await alertService.saveAtrialAlert(userId, modelProbability);
            await notifyAtrialAlertInBackground(modelProbability);
        } catch (error) {
            console.warn("[ATRIAL ALERT SAVE FAILED]", error);
        }
    };

    /**
     * Chạy queue model tuần tự.
     *
     * Nếu đang có 1 input model chạy rồi, hàm sẽ return.
     * Khi input đang chạy xong, input kế tiếp mới được lấy ra.
     *
     * Trong lúc này BLE vẫn tiếp tục ghi packet vào buffer 30 giây mới.
     */
    const processSensorFusionQueueSequentially = async () => {
        if (isProcessingSensorFusionQueueRef.current) {
            return;
        }

        isProcessingSensorFusionQueueRef.current = true;

        try {
            while (sensorFusionProcessingQueueRef.current.length > 0) {
                const modelInput =
                    sensorFusionProcessingQueueRef.current.shift();

                if (!modelInput) {
                    continue;
                }
                // console.log("[MODEL INPUT SENT]", {
                //     modelCallCount: modelInput.modelInputNo,
                //     arrayLengths: {
                //         type6: modelInput.type6Values.length,
                //         type5x: modelInput.xValues.length,
                //         type5y: modelInput.yValues.length,
                //         type5z: modelInput.zValues.length,
                //     },
                // });

                /**
                 * Đây là vị trí duy nhất đưa 4 mảng vào hàm demo/model.
                 *
                 * Sau này bạn chỉ cần thay phần thân của:
                 * processSensorFusionModelDemo(...)
                 * bằng model thật.
                 */
                const modelProbability =
                    await processSensorFusionModelDemo(modelInput);
                await submitAtrialAlertIfNeeded(modelProbability);

                if (modelInput.type6Values.length >= 1500) {
                    const bpm = calculateHeartRateFromType6(
                        modelInput.type6Values,
                    );

                    if (bpm !== null) {
                        await submitHeartRateActive(bpm);
                    }
                }



                /**
                 * Sau khi xử lý xong:
                 * - modelInput đã bị shift khỏi queue
                 * - local variable sẽ tự được giải phóng khi sang vòng lặp mới
                 * => dữ liệu cũ không còn giữ trong queue xử lý nữa.
                 */
            }
        } catch {
        } finally {
            isProcessingSensorFusionQueueRef.current = false;
        }
    };

    /**
     * Khi đã có sliding window type 5 và type 6,
     * ghép chúng theo thứ tự tạo ra để thành đầu vào model.
     */
    const pairType5AndType6WindowsForModel = () => {
        while (
            type5SlidingWindowQueueRef.current.length > 0 &&
            type6SlidingWindowQueueRef.current.length > 0
        ) {
            const type5Window =
                type5SlidingWindowQueueRef.current.shift();

            const type6Window =
                type6SlidingWindowQueueRef.current.shift();

            if (!type5Window || !type6Window) {
                continue;
            }

            sensorFusionModelInputCounterRef.current += 1;

            const modelInput = createSensorFusionModelInput(
                sensorFusionModelInputCounterRef.current,
                type5Window,
                type6Window
            );

            sensorFusionProcessingQueueRef.current.push(modelInput);
        }

        void processSensorFusionQueueSequentially();
    };

    /**
     * Nhận các mini group type 5 hoàn chỉnh,
     * tạo sliding window 1500 mẫu/trục.
     */
    const appendType5MiniGroupsAndBuildWindows = (
        miniGroups: Type5MiniGroup[]
    ) => {
        const completeMiniGroups = miniGroups.filter((miniGroup) => {
            return miniGroup.isComplete;
        });

        completeMiniGroups.forEach((miniGroup) => {
            type5MiniGroupQueueRef.current.push(miniGroup);

            if (type5MiniGroupQueueRef.current.length >= 3) {
                const lastThreeGroups =
                    type5MiniGroupQueueRef.current.slice(-3) as [
                        Type5MiniGroup,
                        Type5MiniGroup,
                        Type5MiniGroup
                    ];

                type5WindowCounterRef.current += 1;

                const slidingWindow = createType5SlidingWindow(
                    type5WindowCounterRef.current,
                    lastThreeGroups
                );

                type5SlidingWindowQueueRef.current.push(slidingWindow);

                /**
                 * Chỉ giữ lại 2 mini group gần nhất để tạo cửa sổ trượt tiếp theo.
                 */
                type5MiniGroupQueueRef.current =
                    type5MiniGroupQueueRef.current.slice(-2);
            }
        });
    };

    /**
     * Nhận các mini group type 6 hoàn chỉnh,
     * tạo sliding window 1500 giá trị.
     */
    const appendType6MiniGroupsAndBuildWindows = (
        miniGroups: Type6MiniGroup[]
    ) => {
        const completeMiniGroups = miniGroups.filter((miniGroup) => {
            return miniGroup.isComplete;
        });

        completeMiniGroups.forEach((miniGroup) => {
            type6MiniGroupQueueRef.current.push(miniGroup);

            if (type6MiniGroupQueueRef.current.length >= 3) {
                const lastThreeGroups =
                    type6MiniGroupQueueRef.current.slice(-3) as [
                        Type6MiniGroup,
                        Type6MiniGroup,
                        Type6MiniGroup
                    ];

                type6WindowCounterRef.current += 1;

                const slidingWindow = createType6SlidingWindow(
                    type6WindowCounterRef.current,
                    lastThreeGroups
                );

                type6SlidingWindowQueueRef.current.push(slidingWindow);

                /**
                 * Chỉ giữ lại 2 mini group gần nhất để tạo cửa sổ trượt tiếp theo.
                 */
                type6MiniGroupQueueRef.current =
                    type6MiniGroupQueueRef.current.slice(-2);
            }
        });
    };

    /**
     * Lên lịch demo batch tiếp theo đúng chu kỳ 30 giây tính từ batch start.
     * Chỉ áp dụng khi USE_DEMO_BLE_DATA = true.
     */
    const scheduleNextDemoBatchFromBatchStart = (batchStartedAtMs: number) => {
        if (!USE_DEMO_BLE_DATA) {
            return;
        }

        if (demoNextBatchTimerRef.current) {
            clearTimeout(demoNextBatchTimerRef.current);
            demoNextBatchTimerRef.current = null;
        }

        const elapsedMs = Date.now() - batchStartedAtMs;
        const delayMs = Math.max(0, BLE_COLLECTION_WINDOW_MS - elapsedMs);

        demoNextBatchTimerRef.current = setTimeout(() => {
            runSelectedDemoBlePacketSession();
        }, delayMs);
    };

    type FinalizeBatchReason =
        | "complete"
        | "timeout"
        | "packet_id_changed";

    /**
     * Chốt batch đang active, sau đó đẩy dữ liệu vào pipeline xử lý.
     */
    const finalizeActivePacketBatch = (
        reason: FinalizeBatchReason
    ) => {
        const activeBatch = activePacketBatchRef.current;

        if (!activeBatch) {
            return;
        }
        const completeness = getBleTrackedBatchCompleteness(activeBatch);

        if (activeBatchTimeoutRef.current) {
            clearTimeout(activeBatchTimeoutRef.current);
            activeBatchTimeoutRef.current = null;
        }

        activePacketBatchRef.current = null;

        lastFinalizedBatchRef.current = {
            packetId: activeBatch.packetId,
            startedAtMs: activeBatch.startedAtMs,
            finalizedAtMs: Date.now(),
        };

        // console.log("[BLE BATCH STATUS]", {
        //     packetId: activeBatch.packetId,
        //     status: completeness.isComplete ? "COMPLETE" : "INCOMPLETE",
        //     finalizeReason: reason,
        //     totalPackets: activeBatch.packets.length,
        //     type5MissingIndexes: completeness.type5.missingIndexes,
        //     type6MissingIndexes: completeness.type6.missingIndexes,
        //     firstReceivedAt: activeBatch.firstReceivedAt,
        //     lastReceivedAt: activeBatch.lastReceivedAt,
        //     durationMs:
        //         new Date(activeBatch.lastReceivedAt).getTime() -
        //         new Date(activeBatch.firstReceivedAt).getTime(),
        // });

        const packetsOfFinishedBatch = [...activeBatch.packets];

        const groupedType5 = buildGroupedPacketSummary(
            packetsOfFinishedBatch,
            5
        );

        const groupedType6 = buildGroupedPacketSummary(
            packetsOfFinishedBatch,
            6
        );

        const type5MiniGroups =
            buildType5MiniGroupsFromPackets(packetsOfFinishedBatch);

        const type6MiniGroups =
            buildType6MiniGroupsFromPackets(packetsOfFinishedBatch);

        logBleTypeCollectionSummary(
            packetsOfFinishedBatch,
            groupedType5
        );

        logBleTypeCollectionSummary(
            packetsOfFinishedBatch,
            groupedType6
        );

        appendType5MiniGroupsAndBuildWindows(type5MiniGroups);
        appendType6MiniGroupsAndBuildWindows(type6MiniGroups);

        pairType5AndType6WindowsForModel();

        scheduleNextDemoBatchFromBatchStart(activeBatch.startedAtMs);
    };

    /**
     * Bắt đầu batch mới tại thời điểm nhận packet đầu tiên của packetId đó.
     */
    const startPacketBatchFromFirstPacket = (
        packetId: number,
        firstPacket: BlePacketItem,
        startedAtMs: number
    ) => {
        const newBatch = createBleTrackedBatch(
            packetId,
            firstPacket,
            startedAtMs
        );

        activePacketBatchRef.current = newBatch;

        activeBatchTimeoutRef.current = setTimeout(() => {
            finalizeActivePacketBatch("timeout");
        }, BLE_COLLECTION_WINDOW_MS);

        const completeness = getBleTrackedBatchCompleteness(newBatch);

        if (completeness.isComplete) {
            finalizeActivePacketBatch("complete");
        }
    };

    /**
     * Thêm packet vào batch active.
     * Nếu đủ index type 5/type 6 thì batch hoàn tất ngay.
     */
    const appendPacketToActiveBatch = (packet: BlePacketItem) => {
        const activeBatch = activePacketBatchRef.current;

        if (!activeBatch) {
            return;
        }

        appendPacketToBleTrackedBatch(activeBatch, packet);

        const completeness = getBleTrackedBatchCompleteness(activeBatch);

        if (completeness.isComplete) {
            finalizeActivePacketBatch("complete");
        }
    };

    /**
     * Điểm vào chung cho mọi packet:
     * - DEMO
     * - NOTIFY thật
     * - READ_NOW thật
     * - POLL thật
     */
    const printData = async (
        source: string,
        serviceUUID: string,
        charUUID: string,
        value: string
    ) => {
        const data = decodeBlePacket(value);
        // console.log("[BLE DECODED]", {
        //     source,
        //     serviceUUID,
        //     charUUID,
        //     // rawValue: value,
        //     bufferLength: data.bufferLength,
        //     dec: data.dec,
        //     hex: data.hex,
        //     // decoded: data,
        // });
        const packetId = data.header?.packetId.dec;

        if (data.header?.packetType.dec === 6 && data.mac?.address) {
            type6MacAddressRef.current = data.mac.address;
        }

        if (typeof packetId !== "number") {
            return;
        }

        const receivedAtMs = Date.now();

        /**
         * Nếu batch trước đã COMPLETE và vẫn còn nằm trong chu kỳ 30 giây,
         * packet cùng packetId xuất hiện muộn sẽ được coi là duplicate/trễ và bỏ qua.
         */
        const lastFinalizedBatch = lastFinalizedBatchRef.current;

        if (
            !activePacketBatchRef.current &&
            lastFinalizedBatch &&
            lastFinalizedBatch.packetId === packetId &&
            receivedAtMs - lastFinalizedBatch.startedAtMs <
            BLE_COLLECTION_WINDOW_MS
        ) {
            return;
        }

        /**
         * Nếu packetId đổi trong lúc batch cũ chưa hoàn tất,
         * chốt batch cũ INCOMPLETE rồi mở batch mới.
         */
        const currentActiveBatch = activePacketBatchRef.current;

        if (
            currentActiveBatch &&
            currentActiveBatch.packetId !== packetId
        ) {
            finalizeActivePacketBatch("packet_id_changed");
        }

        const batchStartedAtMs =
            activePacketBatchRef.current?.startedAtMs ?? receivedAtMs;

        packetItemSequenceRef.current += 1;

        const packetItem: BlePacketItem = {
            index: packetItemSequenceRef.current,
            source,
            serviceUUID,
            charUUID,
            receivedAt: new Date(receivedAtMs).toISOString(),
            elapsedFromConnectMs: receivedAtMs - batchStartedAtMs,
            data,
        };

        if (!activePacketBatchRef.current) {
            startPacketBatchFromFirstPacket(
                packetId,
                packetItem,
                receivedAtMs
            );
            return;
        }

        appendPacketToActiveBatch(packetItem);
    };

    /**
     * Phát 1 session demo vào luồng printData().
     * Mỗi lần gọi sẽ lấy session kế tiếp.
     */
    const runSelectedDemoBlePacketSession = () => {
        stopDemoBlePacketTimers(demoPacketTimersRef.current);

        runDemoBlePacketSession({
            sessionIndex: demoSessionIndexRef.current,
            printData,
            timers: demoPacketTimersRef.current,
        });
        // console.log("timers", demoPacketTimersRef.current);
        demoSessionIndexRef.current += 1;
    };

    /**
     * Xin quyền BLE trên Android.
     */
    const requestPermissions = async () => {
        if (Platform.OS !== "android") {
            return true;
        }

        if (Platform.Version >= 31) {
            const scanPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
            );

            const connectPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
            );

            return (
                scanPermission === PermissionsAndroid.RESULTS.GRANTED &&
                connectPermission === PermissionsAndroid.RESULTS.GRANTED
            );
        }

        const locationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        return locationPermission === PermissionsAndroid.RESULTS.GRANTED;
    };

    /**
     * Quét thiết bị BLE.
     */
    const startScan = async () => {
        userRequestedDisconnectRef.current = false;
        connectionActionIdRef.current += 1;

        const granted = await requestPermissions();

        if (!granted) {
            setStatus("Chưa được cấp quyền BLE");
            return;
        }

        const managerState = await bleManagerRef.current.state();

        if (managerState !== State.PoweredOn) {
            setStatus("Bluetooth chưa bật");
            return;
        }

        stopAll();

        setDevices([]);
        setScanning(true);
        setScanModalVisible(true);
        setStatus("Đang quét thiết bị...");

        bleManagerRef.current.startDeviceScan(
            null,
            null,
            (error, device) => {
                if (error) {
                    setScanning(false);
                    setStatus("Quét thiết bị thất bại");
                    return;
                }

                if (!device) {
                    return;
                }

                setDevices((currentDevices) => {
                    const existed = currentDevices.some(
                        (item) => item.id === device.id
                    );

                    if (existed) {
                        return currentDevices;
                    }

                    return [...currentDevices, device];
                });
            }
        );

        scanTimeoutRef.current = setTimeout(() => {
            bleManagerRef.current.stopDeviceScan();
            setScanning(false);
            setStatus("Đã hoàn tất quét thiết bị");
        }, BLE_SCAN_DURATION_MS);
    };

    /**
     * Nhận dữ liệu thật từ thiết bị BLE:
     * - Subscribe notify/indicate
     * - Read ngay 1 lần nếu characteristic readable
     * - Poll readable characteristic mỗi 1 giây
     */
    const startReceivingRealBleData = async (connected: Device) => {
        const services = await connected.services();
        const readableTargets: ReadTarget[] = [];
        for (const service of services) {
            const characteristics = await service.characteristics();

            for (const characteristic of characteristics) {
                if (
                    characteristic.isNotifiable ||
                    characteristic.isIndicatable
                ) {
                    try {
                        const subscription = characteristic.monitor(
                            (error, monitoredCharacteristic) => {
                                if (error) {
                                    return;
                                }

                                if (monitoredCharacteristic?.value) {
                                    // console.log("[BLE RECEIVE]", {
                                    //     source: "NOTIFY",
                                    //     serviceUUID: service.uuid,
                                    //     charUUID: characteristic.uuid,
                                    //     value: monitoredCharacteristic.value,
                                    // });

                                    void printData(
                                        "NOTIFY",
                                        service.uuid,
                                        characteristic.uuid,
                                        monitoredCharacteristic.value
                                    );
                                }
                            }
                        );

                        notifySubscriptionsRef.current.push(subscription);
                    } catch {
                    }
                }

                if (characteristic.isReadable) {
                    readableTargets.push({
                        serviceUUID: service.uuid,
                        charUUID: characteristic.uuid,
                    });

                    try {
                        const readNow =
                            await connected.readCharacteristicForService(
                                service.uuid,
                                characteristic.uuid
                            );

                        if (readNow?.value) {
                            // console.log("[BLE RECEIVE]", {
                            //     source: "READ_NOW",
                            //     serviceUUID: service.uuid,
                            //     charUUID: characteristic.uuid,
                            //     value: readNow.value,
                            // });

                            void printData(
                                "READ_NOW",
                                service.uuid,
                                characteristic.uuid,
                                readNow.value
                            );
                        }
                    } catch {
                    }
                }
            }
        }

        if (readableTargets.length > 0) {
            pollTimerRef.current = setInterval(async () => {
                const currentDevice = deviceRef.current;

                if (!currentDevice) {
                    return;
                }

                for (const target of readableTargets) {
                    try {
                        const characteristic =
                            await currentDevice.readCharacteristicForService(
                                target.serviceUUID,
                                target.charUUID
                            );

                        if (characteristic?.value) {
                            // console.log("[BLE RECEIVE]", {
                            //     source: "POLL",
                            //     serviceUUID: target.serviceUUID,
                            //     charUUID: target.charUUID,
                            //     value: characteristic.value,
                            // });

                            void printData(
                                "POLL",
                                target.serviceUUID,
                                target.charUUID,
                                characteristic.value
                            );
                        }
                    } catch {
                        // Không spam log khi poll thất bại
                    }
                }
            }, 1000);
        }
    };

    /**
     * Connect vào thiết bị người dùng chọn.
     */
    const finalizeConnectedDevice = async (
        connected: Device,
        userId?: string
    ) => {
        await connected.discoverAllServicesAndCharacteristics();

        setConnectedDevice(connected);
        setStatus("Đã kết nối");

        currentUserIdRef.current = userId ?? null;
        connectedUserDeviceRef.current = null;

        if (userId) {
            const idDevices = connected.id;
            const nameDevice = connected.name ?? undefined;

            try {
                const savedData = await devicesSource.saveDevicesWithUser(
                    idDevices,
                    userId,
                    nameDevice,
                );

                // console.log("[BLE DEVICE SAVED]", savedData);

                const saved = savedData as any;
                connectedUserDeviceRef.current = {
                    user_device_id:
                        saved?.user_device_id ?? saved?.id ?? undefined,
                    device_id:
                        saved?.device_id ?? saved?.deviceId ?? idDevices,
                };
            } catch (error) {
                console.warn("[BLE DEVICE SAVE FAILED]", error);
            }
        }

        if (USE_DEMO_BLE_DATA) {
            runSelectedDemoBlePacketSession();
            return;
        }

        await startReceivingRealBleData(connected);
    };

    const connectDevice = async (device: Device, userId?: string) => {
        userRequestedDisconnectRef.current = false;
        const actionId = ++connectionActionIdRef.current;

        try {
            stopAll();
            stopDemoBlePacketTimers(demoPacketTimersRef.current);

            if (demoNextBatchTimerRef.current) {
                clearTimeout(demoNextBatchTimerRef.current);
                demoNextBatchTimerRef.current = null;
            }

            resetActivePacketBatch();
            resetProcessingQueues();

            setScanModalVisible(false);
            setScanning(false);
            setStatus("Đang kết nối...");

            const connected = await device.connect();

            if (userRequestedDisconnectRef.current || actionId !== connectionActionIdRef.current) {
                await connected.cancelConnection();
                return;
            }

            deviceRef.current = connected;

            await finalizeConnectedDevice(connected, userId);
        } catch {
            setStatus("Kết nối thất bại");
        }
    };

    const connectDeviceById = async (deviceId: string, userId?: string) => {
        if (isAutoConnectingRef.current) {
            return;
        }

        isAutoConnectingRef.current = true;
        const actionId = ++connectionActionIdRef.current;

        try {
            stopAll();
            stopDemoBlePacketTimers(demoPacketTimersRef.current);

            if (demoNextBatchTimerRef.current) {
                clearTimeout(demoNextBatchTimerRef.current);
                demoNextBatchTimerRef.current = null;
            }

            resetActivePacketBatch();
            resetProcessingQueues();

            setScanModalVisible(false);
            setScanning(false);
            setStatus("Đang kết nối...");

            const connected = await bleManagerRef.current.connectToDevice(deviceId);

            if (userRequestedDisconnectRef.current || actionId !== connectionActionIdRef.current) {
                await connected.cancelConnection();
                return;
            }

            deviceRef.current = connected;

            await finalizeConnectedDevice(connected, userId);
        } catch {
            setStatus("Kết nối thất bại");
        } finally {
            isAutoConnectingRef.current = false;
        }
    };

    /**
     * Cleanup khi màn hình unmount.
     */
    useEffect(() => {
        return () => {
            stopAll();
            stopDemoBlePacketTimers(demoPacketTimersRef.current);
            resetActivePacketBatch();
            resetProcessingQueues();

            if (deviceRef.current) {
                void deviceRef.current.cancelConnection();
            }

            bleManagerRef.current.destroy();
        };
    }, []);

    useEffect(() => {
        if (lastAutoConnectDeviceIdRef.current !== autoConnectDeviceId) {
            lastAutoConnectDeviceIdRef.current = autoConnectDeviceId;
            userRequestedDisconnectRef.current = false;
        }

        // console.log("autoConnectDeviceId", autoConnectDeviceId);
        // console.log("connectedDevice", connectedDevice);
        // console.log("scanning", scanning);
        // console.log("isAutoConnecting", isAutoConnectingRef.current);
        if (
            autoConnectDeviceId &&
            !connectedDevice &&
            !scanning &&
            !isAutoConnectingRef.current &&
            !userRequestedDisconnectRef.current
        ) {
            void connectDeviceById(autoConnectDeviceId, autoConnectUserId);
        }
    }, [autoConnectDeviceId, autoConnectUserId, connectedDevice, scanning]);

    return {
        scanModalVisible,
        setScanModalVisible,
        devices,
        scanning,
        status,
        connectedDevice,

        startScan,
        connectDevice,
        connectDeviceById,
        disconnect,
    };
};

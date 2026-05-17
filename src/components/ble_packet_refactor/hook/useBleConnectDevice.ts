import { useEffect, useRef, useState } from "react";
import {
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
    BlePacketSummary,
    ReadTarget,
    Type6MiniGroup,
    Type6SlidingWindow,
} from "../types/blePacket.types";

import { decodeBlePacket } from "../utils/decodeBlePacket";

import {
    buildGroupedPacketSummary,
    logGroupedPacketSummary,
} from "../utils/summarizeBlePackets";

import {
    buildType6MiniGroupsFromPackets,
    createType6SlidingWindow,
    processType6SlidingWindowDemo,
} from "../utils/type6SlidingWindows";

import {
    runDemoBlePacketSession,
    stopDemoBlePacketTimers,
} from "../demo/runDemoBlePackets";

export const useBleConnectDevice = () => {
    const bleManagerRef = useRef(new BleManager());

    const deviceRef = useRef<Device | null>(null);
    const notifySubscriptionsRef = useRef<Subscription[]>([]);

    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const bleCollectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const demoPacketTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const demoSessionIndexRef = useRef(0);

    const blePacketsRef = useRef<BlePacketItem[]>([]);
    const bleCollectStartAtRef = useRef<number | null>(null);
    const bleFirstPacketAtRef = useRef<number | null>(null);
    const bleLastPacketAtRef = useRef<number | null>(null);
    const blePacketIndexRef = useRef(0);

    /**
     * Hàng đợi chỉ giữ tối đa 2 cụm nhỏ cuối cùng.
     * Khi có cụm nhỏ mới, ta ghép:
     * [2 cụm cũ gần nhất] + [cụm mới]
     * để tạo một cửa sổ 1500 dữ liệu.
     */
    const type6MiniGroupQueueRef = useRef<Type6MiniGroup[]>([]);
    const type6WindowCounterRef = useRef(0);

    /**
 * Queue các window 1500 dữ liệu type 6 đang chờ đưa vào hàm xử lý.
 */
    const type6ProcessingQueueRef = useRef<Type6SlidingWindow[]>([]);

    /**
     * Đảm bảo mỗi lần chỉ xử lý 1 window.
     * Window sau phải chờ window trước trả kết quả xong.
     */
    const isProcessingType6WindowRef = useRef(false);

    const [scanModalVisible, setScanModalVisible] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState("Chưa kết nối");
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

    const resetBlePacketCollection = () => {
        blePacketsRef.current = [];
        bleCollectStartAtRef.current = null;
        bleFirstPacketAtRef.current = null;
        bleLastPacketAtRef.current = null;
        blePacketIndexRef.current = 0;

        if (bleCollectionTimeoutRef.current) {
            clearTimeout(bleCollectionTimeoutRef.current);
            bleCollectionTimeoutRef.current = null;
        }
    };

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

    const disconnect = async () => {
        try {
            stopAll();
            stopDemoBlePacketTimers(demoPacketTimersRef.current);
            resetBlePacketCollection();

            if (deviceRef.current) {
                await deviceRef.current.cancelConnection();
            }

            deviceRef.current = null;
            setConnectedDevice(null);
            setStatus("Đã ngắt kết nối");
        } catch (error) {
            console.log("DISCONNECT ERROR:", error);
        }
    };

    /**
 * Xử lý tuần tự các cửa sổ type 6.
 *
 * Nghiệp vụ:
 * - Lấy window đầu queue
 * - Đưa vào hàm demo/model
 * - Await kết quả
 * - Log kết quả
 * - Xóa window đó khỏi queue
 * - Tiếp tục window kế tiếp nếu còn
 *
 * Trong lúc hàm này chạy:
 * - BLE vẫn tiếp tục nhận packet mới
 * - Buffer 30 giây mới vẫn tiếp tục được ghi
 */
    const processType6WindowQueueSequentially = async () => {
        if (isProcessingType6WindowRef.current) {
            return;
        }

        isProcessingType6WindowRef.current = true;

        try {
            while (type6ProcessingQueueRef.current.length > 0) {
                const currentWindow = type6ProcessingQueueRef.current.shift();

                if (!currentWindow) {
                    continue;
                }

                console.log("========== BẮT ĐẦU XỬ LÝ TYPE 6 WINDOW ==========");
                console.log("WINDOW NO:", currentWindow.windowNo);
                console.log("PACKET IDS:", currentWindow.packetIds);
                console.log("MINI GROUP NOS:", currentWindow.miniGroupNos);
                console.log("TỔNG DỮ LIỆU ĐẦU VÀO:", currentWindow.totalDataCount);
                console.log("==================================================");

                /**
                 * Đây chính là chỗ đưa 1500 dữ liệu vào hàm demo/model.
                 * Sau này bạn thay hàm này bằng model thật.
                 */
                const result =
                    await processType6SlidingWindowDemo(currentWindow);

                console.log("========== KẾT QUẢ TYPE 6 WINDOW ==========");
                console.log("WINDOW NO:", currentWindow.windowNo);
                console.log("KẾT QUẢ HÀM DEMO:", result);
                console.log("============================================");

                /**
                 * Sau khi xử lý xong:
                 * - currentWindow không còn nằm trong queue
                 * - biến local currentWindow sẽ được JS giải phóng khi vòng lặp sang lượt mới
                 * => dữ liệu cũ coi như đã được bỏ đi.
                 */
            }
        } catch (error) {
            console.log("PROCESS TYPE 6 WINDOW ERROR:", error);
        } finally {
            isProcessingType6WindowRef.current = false;
        }
    };

    /**
     * Đưa các cụm nhỏ type 6 hoàn chỉnh vào hàng đợi trượt.
     *
     * Mỗi khi có đủ 3 cụm nhỏ liên tiếp:
     * - tạo 1 cửa sổ 1500 dữ liệu
     * - gọi hàm demo processType6SlidingWindowDemo()
     * - giữ lại 2 cụm nhỏ cuối để ghép với cụm mới tiếp theo
     */
    const appendType6MiniGroupsAndProcessWindows = (
        miniGroups: Type6MiniGroup[]
    ) => {
        const completeMiniGroups = miniGroups.filter((miniGroup) => {
            return miniGroup.isComplete;
        });

        const incompleteMiniGroups = miniGroups.filter((miniGroup) => {
            return !miniGroup.isComplete;
        });

        if (incompleteMiniGroups.length > 0) {
            console.warn("TYPE 6 MINI GROUP CHƯA ĐỦ DỮ LIỆU:", incompleteMiniGroups);
        }

        completeMiniGroups.forEach((miniGroup) => {
            type6MiniGroupQueueRef.current.push(miniGroup);

            if (type6MiniGroupQueueRef.current.length >= 3) {
                const lastThreeGroups = type6MiniGroupQueueRef.current.slice(-3) as [
                    Type6MiniGroup,
                    Type6MiniGroup,
                    Type6MiniGroup
                ];

                type6WindowCounterRef.current += 1;

                const slidingWindow = createType6SlidingWindow(
                    type6WindowCounterRef.current,
                    lastThreeGroups
                );

                /**
                 * Không xử lý ngay tại đây.
                 * Đưa window vào queue để đảm bảo:
                 * - xử lý tuần tự
                 * - window sau đợi window trước xong
                 * - BLE vẫn nhận dữ liệu mới song song
                 */
                type6ProcessingQueueRef.current.push(slidingWindow);

                void processType6WindowQueueSequentially();

                /**
                 * Chỉ giữ lại 2 cụm gần nhất.
                 * Ví dụ:
                 * - Sau A1,A2,A3 -> xử lý A1+A2+A3, giữ A2,A3
                 * - Có B1 -> xử lý A2+A3+B1, giữ A3,B1
                 */
                type6MiniGroupQueueRef.current =
                    type6MiniGroupQueueRef.current.slice(-2);
            }
        });
    };

    const finishBlePacketCollection = async () => {
        const endAt = Date.now();
        const startAt = bleCollectStartAtRef.current ?? endAt;

        /**
         * Snapshot dữ liệu của phiên 30 giây vừa kết thúc.
         * Từ đây trở đi xử lý trên snapshot này,
         * không động vào buffer nhận packet mới nữa.
         */
        const packetsOfFinishedWindow = [...blePacketsRef.current];
        const firstPacketAt = bleFirstPacketAtRef.current;
        const lastPacketAt = bleLastPacketAtRef.current;

        /**
         * QUAN TRỌNG:
         * Mở ngay cửa sổ nhận packet 30 giây tiếp theo.
         *
         * Nhờ vậy:
         * - BLE vẫn tiếp tục ghi dữ liệu mới
         * - xử lý snapshot cũ diễn ra độc lập
         */
        startBlePacketCollection();

        /**
         * Bắt đầu xử lý tập dữ liệu cũ vừa chốt.
         */
        const groupedType5 = buildGroupedPacketSummary(
            packetsOfFinishedWindow,
            5
        );

        const groupedType6 = buildGroupedPacketSummary(
            packetsOfFinishedWindow,
            6
        );

        const type6MiniGroups =
            buildType6MiniGroupsFromPackets(packetsOfFinishedWindow);

        const summary: BlePacketSummary = {
            device: {
                id: deviceRef.current?.id ?? connectedDevice?.id ?? null,
                name: deviceRef.current?.name ?? connectedDevice?.name ?? null,
            },

            packetCount: packetsOfFinishedWindow.length,

            collectStartedAt: new Date(startAt).toISOString(),
            collectEndedAt: new Date(endAt).toISOString(),
            collectWindowMs: endAt - startAt,

            firstPacketAt: firstPacketAt
                ? new Date(firstPacketAt).toISOString()
                : null,

            lastPacketAt: lastPacketAt
                ? new Date(lastPacketAt).toISOString()
                : null,

            receiveDurationMs:
                firstPacketAt && lastPacketAt
                    ? lastPacketAt - firstPacketAt
                    : 0,

            packets: packetsOfFinishedWindow,

            groupedPackets: {
                type5: groupedType5,
                type6: groupedType6,
            },
        };

        console.log("========== TỔNG HỢP BLE SAU 30 GIÂY ==========");
        console.log("THIẾT BỊ:", summary.device);
        console.log("TỔNG GÓI NHẬN:", summary.packetCount);
        console.log("THỜI GIAN THU:", summary.collectWindowMs, "ms");
        console.log(
            "THỜI GIAN TỪ GÓI ĐẦU ĐẾN GÓI CUỐI:",
            summary.receiveDurationMs,
            "ms"
        );
        console.log("================================================");

        logGroupedPacketSummary("GÓI LOẠI 5", groupedType5);
        logGroupedPacketSummary("GÓI LOẠI 6", groupedType6);

        console.log("========== TYPE 6 MINI GROUPS ==========");
        console.log(type6MiniGroups);
        console.log("========================================");

        /**
         * Từ các mini group type 6:
         * - tạo window 1500 dữ liệu
         * - đưa vào queue xử lý tuần tự
         */
        appendType6MiniGroupsAndProcessWindows(type6MiniGroups);

        /**
         * Nếu dùng DEMO:
         * Sau khi mở cửa sổ mới ở đầu hàm,
         * phát tiếp session demo kế tiếp vào cửa sổ mới đó.
         */
        if (USE_DEMO_BLE_DATA) {
            runSelectedDemoBlePacketSession();
        }

        /**
         * Không disconnect.
         * Không reset lại lần nữa.
         * Buffer cũ đã được tách snapshot,
         * buffer mới đang tiếp tục nhận dữ liệu.
         */
    };

    const startBlePacketCollection = () => {
        resetBlePacketCollection();

        const startAt = Date.now();
        bleCollectStartAtRef.current = startAt;

        // console.log("BẮT ĐẦU THU BLE:", new Date(startAt).toISOString());

        bleCollectionTimeoutRef.current = setTimeout(() => {
            void finishBlePacketCollection();
        }, BLE_COLLECTION_WINDOW_MS);
    };

    const printData = async (
        source: string,
        serviceUUID: string,
        charUUID: string,
        value: string
    ) => {
        const data = decodeBlePacket(value);

        // console.log("BLE PACKET:", {
        //     source,
        //     packetType: data.header?.packetType.dec,
        //     packetId: data.header?.packetId.dec,
        //     packetIndex: data.header?.packetIndex.dec,
        //     bufferLength: data.bufferLength,
        // });

        if (bleCollectStartAtRef.current === null) {
            return;
        }

        const receivedAt = Date.now();

        if (bleFirstPacketAtRef.current === null) {
            bleFirstPacketAtRef.current = receivedAt;
        }

        bleLastPacketAtRef.current = receivedAt;
        blePacketIndexRef.current += 1;

        blePacketsRef.current.push({
            index: blePacketIndexRef.current,
            source,
            serviceUUID,
            charUUID,
            receivedAt: new Date(receivedAt).toISOString(),
            elapsedFromConnectMs:
                receivedAt - bleCollectStartAtRef.current,
            data,
        });
    };

    const runSelectedDemoBlePacketSession = () => {
        stopDemoBlePacketTimers(demoPacketTimersRef.current);

        runDemoBlePacketSession({
            sessionIndex: demoSessionIndexRef.current,
            printData,
            timers: demoPacketTimersRef.current,
        });

        demoSessionIndexRef.current += 1;
    };

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

    const startScan = async () => {
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
                    console.log("SCAN ERROR:", error);
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
                                    console.log("NOTIFY ERROR:", {
                                        serviceUUID: service.uuid,
                                        charUUID: characteristic.uuid,
                                        message: error.message,
                                    });
                                    return;
                                }

                                if (monitoredCharacteristic?.value) {
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
                    } catch (error) {
                        console.log("SUBSCRIBE FAILED:", {
                            serviceUUID: service.uuid,
                            charUUID: characteristic.uuid,
                            error,
                        });
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
                            void printData(
                                "READ_NOW",
                                service.uuid,
                                characteristic.uuid,
                                readNow.value
                            );
                        }
                    } catch (error) {
                        console.log("READ NOW ERROR:", {
                            serviceUUID: service.uuid,
                            charUUID: characteristic.uuid,
                            error,
                        });
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

    const connectDevice = async (device: Device) => {
        try {
            stopAll();
            stopDemoBlePacketTimers(demoPacketTimersRef.current);
            resetBlePacketCollection();

            setScanModalVisible(false);
            setScanning(false);
            setStatus("Đang kết nối...");

            const connected = await device.connect();
            deviceRef.current = connected;

            await connected.discoverAllServicesAndCharacteristics();

            setConnectedDevice(connected);
            setStatus("Đã kết nối");

            console.log("CONNECTED:", connected.name || connected.id);

            startBlePacketCollection();

            if (USE_DEMO_BLE_DATA) {
                console.log(
                    "USE_DEMO_BLE_DATA = true → Dùng dữ liệu demo sau khi connect"
                );

                runSelectedDemoBlePacketSession();
                return;
            }

            console.log(
                "USE_DEMO_BLE_DATA = false → Nhận dữ liệu thật từ thiết bị"
            );

            await startReceivingRealBleData(connected);
        } catch (error) {
            console.log("CONNECT ERROR:", error);
            setStatus("Kết nối thất bại");
        }
    };

    useEffect(() => {
        return () => {
            stopAll();
            stopDemoBlePacketTimers(demoPacketTimersRef.current);
            resetBlePacketCollection();

            if (deviceRef.current) {
                void deviceRef.current.cancelConnection();
            }

            bleManagerRef.current.destroy();
        };
    }, []);

    return {
        scanModalVisible,
        setScanModalVisible,
        devices,
        scanning,
        status,
        connectedDevice,

        startScan,
        connectDevice,
        disconnect,
    };
};

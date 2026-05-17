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
} from "../types/blePacket.types";

import { decodeBlePacket } from "../utils/decodeBlePacket";

import {
    buildGroupedPacketSummary,
    logGroupedPacketSummary,
} from "../utils/summarizeBlePackets";

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

    const finishBlePacketCollection = async () => {
        const endAt = Date.now();
        const startAt = bleCollectStartAtRef.current ?? endAt;

        const packets = [...blePacketsRef.current];
        const firstPacketAt = bleFirstPacketAtRef.current;
        const lastPacketAt = bleLastPacketAtRef.current;

        const groupedType5 = buildGroupedPacketSummary(packets, 5);
        const groupedType6 = buildGroupedPacketSummary(packets, 6);

        const summary: BlePacketSummary = {
            device: {
                id: deviceRef.current?.id ?? connectedDevice?.id ?? null,
                name: deviceRef.current?.name ?? connectedDevice?.name ?? null,
            },

            packetCount: packets.length,

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

            packets,

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

        await disconnect();
    };

    const startBlePacketCollection = () => {
        resetBlePacketCollection();

        const startAt = Date.now();
        bleCollectStartAtRef.current = startAt;

        console.log("BẮT ĐẦU THU BLE:", new Date(startAt).toISOString());

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

        console.log("BLE PACKET:", {
            source,
            packetType: data.header?.packetType.dec,
            packetId: data.header?.packetId.dec,
            packetIndex: data.header?.packetIndex.dec,
            bufferLength: data.bufferLength,
        });

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

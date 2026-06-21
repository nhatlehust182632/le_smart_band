import { useEffect, useMemo, useRef, useState } from "react";
import {
    bleEmitter,
    connectNativeBle,
    disconnectNativeBle,
    getNativeBleState,
    startNativeBleScan,
    stopNativeBleScan,
    writeNativeBleBytes,
    type BLEDeviceConnectedEvent,
    type BLEDeviceDisconnectedEvent,
    type BLEDeviceDiscoveredEvent,
    type BLELogEvent,
    type BLEPacketReceivedEvent,
} from "../native/bleModule";
import { showDisconnectNotification } from "../services/notification.service";

export type NativeBleDevice = {
    id: string;
    name: string;
    localName: string;
    rssi: number;
};

type UseNativeBleDeviceResult = {
    devices: NativeBleDevice[];
    isScanning: boolean;
    connectedDeviceId: string | null;
    connectedName: string;
    isConnected: boolean;
    lastPacket: BLEPacketReceivedEvent | null;
    logs: BLELogEvent[];
    startScan: () => Promise<void>;
    stopScan: () => Promise<void>;
    connectToDevice: (deviceId: string) => Promise<void>;
    disconnect: () => Promise<void>;
    writeBytes: (bytes: number[]) => Promise<void>;
    clearLogs: () => void;
};

export function useNativeBleDevice(): UseNativeBleDeviceResult {
    const [devices, setDevices] = useState<NativeBleDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(
        null
    );
    const [lastPacket, setLastPacket] = useState<BLEPacketReceivedEvent | null>(
        null
    );
    const [logs, setLogs] = useState<BLELogEvent[]>([]);

    const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastConnectedDeviceIdRef = useRef<string | null>(null);
    const manualDisconnectRef = useRef(false);
    const disconnectNotificationDeviceIdRef = useRef<string | null>(null);

    useEffect(() => {
        const loadInitialState = async () => {
            try {
                const state = await getNativeBleState();

                if (state?.connectedDeviceId) {
                    setConnectedDeviceId(state.connectedDeviceId);
                }

                if (state?.connectedDeviceId) {
                    lastConnectedDeviceIdRef.current = state.connectedDeviceId;
                }

                console.log("[RN] initial native BLE state =", state);
            } catch (error) {
                console.log("[RN] getNativeBleState error =", error);
            }
        };

        loadInitialState();
    }, []);

    useEffect(() => {
        if (!bleEmitter) {
            console.log("[RN] bleEmitter not available");
            return;
        }

        const subDiscovered = bleEmitter.addListener(
            "BLEDeviceDiscovered",
            (event: BLEDeviceDiscoveredEvent) => {
                setDevices((prev) => {
                    const index = prev.findIndex((d) => d.id === event.deviceId);

                    const nextDevice: NativeBleDevice = {
                        id: event.deviceId,
                        name: event.deviceName || "",
                        localName: event.localName || "",
                        rssi: event.rssi ?? 0,
                    };

                    if (index === -1) {
                        return [...prev, nextDevice];
                    }

                    const next = [...prev];
                    next[index] = nextDevice;
                    return next;
                });
            }
        );

        const subConnected = bleEmitter.addListener(
            "BLEDeviceConnected",
            (event: BLEDeviceConnectedEvent) => {
                console.log("[RN] BLEDeviceConnected =", event);
                manualDisconnectRef.current = false;
                lastConnectedDeviceIdRef.current = event.deviceId;
                disconnectNotificationDeviceIdRef.current = null;
                setConnectedDeviceId(event.deviceId);
                setLogs((prev) =>
                    [
                        {
                            message: "BLEDeviceConnected",
                            ...event,
                        },
                        ...prev,
                    ].slice(0, 100)
                );
            }
        );

        const subDisconnected = bleEmitter.addListener(
            "BLEDeviceDisconnected",
            (event: BLEDeviceDisconnectedEvent) => {
                console.log("[RN] BLEDeviceDisconnected =", event);
                const disconnectedDeviceId = event.deviceId;
                setConnectedDeviceId((prev) =>
                    prev === disconnectedDeviceId ? null : prev
                );

                if (!manualDisconnectRef.current && disconnectedDeviceId) {
                    lastConnectedDeviceIdRef.current = disconnectedDeviceId;

                    if (
                        disconnectNotificationDeviceIdRef.current !==
                        disconnectedDeviceId
                    ) {
                        disconnectNotificationDeviceIdRef.current =
                            disconnectedDeviceId;
                        showDisconnectNotification({
                            title: "Mất kết nối thiết bị",
                            body: "Thiết bị đã mất kết nối. Vui lòng kiểm tra nguồn điện hoặc khoảng cách Bluetooth.",
                        }).catch((error) => {
                            console.log(
                                "[RN] showDisconnectNotification error =",
                                error
                            );
                        });
                    }
                }

                setLogs((prev) =>
                    [
                        {
                            message: "BLEDeviceDisconnected",
                            ...event,
                        },
                        ...prev,
                    ].slice(0, 100)
                );
            }
        );

        const subPacket = bleEmitter.addListener(
            "BLEPacketReceived",
            (event: BLEPacketReceivedEvent) => {
                console.log("[RN] BLEPacketReceived =", event);
                setLastPacket(event);
            }
        );

        const subLog = bleEmitter.addListener("BLELog", (event: BLELogEvent) => {
            console.log("[RN] BLELog =", event);
            setLogs((prev) => [event, ...prev].slice(0, 100));
        });

        const subState = bleEmitter.addListener(
            "BLEStateChanged",
            (event: { state: string; rawState: number }) => {
                console.log("[RN] BLEStateChanged =", event);
                setLogs((prev) =>
                    [
                        {
                            message: "BLEStateChanged",
                            ...event,
                        },
                        ...prev,
                    ].slice(0, 100)
                );
            }
        );

        return () => {
            subDiscovered.remove();
            subConnected.remove();
            subDisconnected.remove();
            subPacket.remove();
            subLog.remove();
            subState.remove();
        };
    }, []);

    useEffect(() => {
        return () => {
            if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
                scanTimeoutRef.current = null;
            }
        };
    }, []);

    const connectedName = useMemo(() => {
        const found = devices.find((d) => d.id === connectedDeviceId);
        return found?.name || found?.localName || "Chưa kết nối";
    }, [devices, connectedDeviceId]);

    const startScan = async () => {
        try {
            setDevices([]);
            setIsScanning(true);

            if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
                scanTimeoutRef.current = null;
            }

            await startNativeBleScan();

            scanTimeoutRef.current = setTimeout(() => {
                setIsScanning(false);
                scanTimeoutRef.current = null;
            }, 10000);
        } catch (error) {
            console.log("[RN] startScan error =", error);
            setIsScanning(false);
        }
    };

    const stopScan = async () => {
        try {
            await stopNativeBleScan();
        } catch (error) {
            console.log("[RN] stopScan error =", error);
        } finally {
            if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
                scanTimeoutRef.current = null;
            }
            setIsScanning(false);
        }
    };

    const connectToDevice = async (deviceId: string) => {
        try {
            manualDisconnectRef.current = false;
            lastConnectedDeviceIdRef.current = deviceId;
            await stopScan();
            await connectNativeBle(deviceId);
        } catch (error) {
            console.log("[RN] connectToDevice error =", error);
            throw error;
        }
    };

    const disconnect = async () => {
        try {
            manualDisconnectRef.current = true;
            lastConnectedDeviceIdRef.current = null;
            disconnectNotificationDeviceIdRef.current = null;
            await disconnectNativeBle();
            setConnectedDeviceId(null);
        } catch (error) {
            console.log("[RN] disconnect error =", error);
            throw error;
        }
    };

    const writeBytes = async (bytes: number[]) => {
        try {
            await writeNativeBleBytes(bytes);
        } catch (error) {
            console.log("[RN] writeBytes error =", error);
            throw error;
        }
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return {
        devices,
        isScanning,
        connectedDeviceId,
        connectedName,
        isConnected: !!connectedDeviceId,
        lastPacket,
        logs,
        startScan,
        stopScan,
        connectToDevice,
        disconnect,
        writeBytes,
        clearLogs,
    };
}
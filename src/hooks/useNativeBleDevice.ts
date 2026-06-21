import { useEffect, useMemo, useRef, useState } from "react";
import {
    bleEmitter,
    connectNativeBle,
    disconnectNativeBle,
    startNativeBleScan,
    stopNativeBleScan,
    writeNativeBleBytes,
    type BLEDeviceDiscoveredEvent,
    type BLELogEvent,
    type BLEPacketReceivedEvent,
} from "../native/bleModule";
import { showDisconnectNotification } from "../services/notification.service";

type NativeBleDevice = {
    id: string;
    name: string;
    localName: string;
    rssi: number;
};

export function useNativeBleDevice() {
    const [devices, setDevices] = useState<NativeBleDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);
    const [lastPacket, setLastPacket] = useState<BLEPacketReceivedEvent | null>(null);
    const [logs, setLogs] = useState<BLELogEvent[]>([]);

    const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastConnectedDeviceIdRef = useRef<string | null>(null);
    const manualDisconnectRef = useRef(false);
    const disconnectNotificationDeviceIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!bleEmitter) return;

        const subDiscovered = bleEmitter.addListener(
            "BLEDeviceDiscovered",
            (event: BLEDeviceDiscoveredEvent) => {
                setDevices((prev) => {
                    const index = prev.findIndex((d) => d.id === event.deviceId);
                    const nextDevice = {
                        id: event.deviceId,
                        name: event.deviceName,
                        localName: event.localName,
                        rssi: event.rssi,
                    };

                    if (index === -1) return [...prev, nextDevice];

                    const next = [...prev];
                    next[index] = nextDevice;
                    return next;
                });
            }
        );

        const subConnected = bleEmitter.addListener(
            "BLEDeviceConnected",
            (event: { deviceId: string }) => {
                manualDisconnectRef.current = false;
                lastConnectedDeviceIdRef.current = event.deviceId;
                disconnectNotificationDeviceIdRef.current = null;
                setConnectedDeviceId(event.deviceId);
            }
        );

        const subDisconnected = bleEmitter.addListener(
            "BLEDeviceDisconnected",
            (event: { deviceId?: string }) => {
                const disconnectedDeviceId =
                    event.deviceId || lastConnectedDeviceIdRef.current;

                setConnectedDeviceId((prev) =>
                    disconnectedDeviceId && prev === disconnectedDeviceId ? null : prev
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
            }
        );

        const subPacket = bleEmitter.addListener(
            "BLEPacketReceived",
            (event: BLEPacketReceivedEvent) => {
                setLastPacket(event);
            }
        );

        const subLog = bleEmitter.addListener("BLELog", (event: BLELogEvent) => {
            setLogs((prev) => [event, ...prev].slice(0, 100));
        });

        return () => {
            subDiscovered.remove();
            subConnected.remove();
            subDisconnected.remove();
            subPacket.remove();
            subLog.remove();
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
    };

    const stopScan = async () => {
        setIsScanning(false);
        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
        }
        await stopNativeBleScan();
    };

    const connectToDevice = async (deviceId: string) => {
        manualDisconnectRef.current = false;
        lastConnectedDeviceIdRef.current = deviceId;
        await connectNativeBle(deviceId);
    };

    const disconnect = async () => {
        manualDisconnectRef.current = true;
        lastConnectedDeviceIdRef.current = null;
        disconnectNotificationDeviceIdRef.current = null;
        await disconnectNativeBle();
        setConnectedDeviceId(null);
    };

    const writeBytes = async (bytes: number[]) => {
        await writeNativeBleBytes(bytes);
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
    };
}
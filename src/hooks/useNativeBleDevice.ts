import { useEffect, useMemo, useState } from "react";
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
                setConnectedDeviceId(event.deviceId);
            }
        );

        const subDisconnected = bleEmitter.addListener(
            "BLEDeviceDisconnected",
            () => {
                setConnectedDeviceId(null);
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
        };
    }, []);

    const connectedName = useMemo(() => {
        const found = devices.find((d) => d.id === connectedDeviceId);
        return found?.name || found?.localName || "Chưa kết nối";
    }, [devices, connectedDeviceId]);

    const startScan = async () => {
        setDevices([]);
        setIsScanning(true);
        await startNativeBleScan();

        setTimeout(() => {
            setIsScanning(false);
        }, 10000);
    };

    const stopScan = async () => {
        setIsScanning(false);
        await stopNativeBleScan();
    };

    const connectToDevice = async (deviceId: string) => {
        await connectNativeBle(deviceId);
    };

    const disconnect = async () => {
        await disconnectNativeBle();
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
import { NativeEventEmitter, NativeModules } from "react-native";

console.log("[BLE] NativeModules.BLEModule =", NativeModules.BLEModule);

const { BLEModule } = NativeModules;

if (!BLEModule) {
    console.warn("[BLE] BLEModule native module not found");
}

export const bleModule = BLEModule;

export const bleEmitter = BLEModule
    ? new NativeEventEmitter(BLEModule)
    : null;

export type BLEDeviceDiscoveredEvent = {
    deviceId: string;
    deviceName: string;
    localName: string;
    rssi: number;
};

export type BLEDeviceConnectedEvent = {
    deviceId: string;
    deviceName: string;
    timestamp: string;
};

export type BLEDeviceDisconnectedEvent = {
    deviceId: string;
    deviceName: string;
    reason: string;
    timestamp: string;
};

export type BLEPacketReceivedEvent = {
    deviceId: string;
    deviceName: string;
    serviceUuid: string;
    characteristicUuid: string;
    byteCount: number;
    hex: string;
    ascii: string | null;
    utf8: string | null;
    decimal: number[];
    base64: string;
    timestamp: string;
};

export type BLELogEvent = {
    message: string;
    [key: string]: unknown;
};

export async function startNativeBleScan() {
    bleModule?.startScan();
}

export async function stopNativeBleScan() {
    bleModule?.stopScan();
}

export async function connectNativeBle(deviceId: string) {
    bleModule?.connect(deviceId);
}

export async function disconnectNativeBle() {
    bleModule?.disconnect();
}

export async function writeNativeBleBytes(bytes: number[]) {
    bleModule?.writeBytes(bytes);
}

export async function getNativeBleState() {
    return bleModule?.getState();
}
import { callApi } from "../api/core/apiClient";

export const deviceStatusSource = {
    async sendType2DeviceStatusPacket(packetHex: string) {
        const rawData = await callApi("postDeviceStatusPacket", {
            body: {
                packetHex,
            },
        });

        return rawData;
    },
};
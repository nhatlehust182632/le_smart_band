import { callApi } from "@/api";

export const devicesSource = {
    async checkDeviceExist(idDevices: string, idUser: string) {
        const rawData = await callApi("getDevicesCheck", {
            query: { idDevices: idDevices, userId: idUser },
        });

        return rawData;
    },

    async saveDevicesWithUser(
        idDevices: string,
        idUser: string,
        nameDevice?: string
    ) {
        const body: { idDevices: string; userId: string; nameDevice?: string } = {
            idDevices,
            userId: idUser,
        };

        if (nameDevice) {
            body.nameDevice = nameDevice;
        }

        const rawData = await callApi("postSaveDevicesWithUser", {
            body,
        });

        return rawData;
    },


    async saveBatteryLog(
        userId: string,
        userDeviceId: string,
        batteryPercent: number,
        isCharging: number
    ) {
        const rawData = await callApi("postSaveBatteryLog", {
            body: {
                user_id: userId,
                user_device_id: userDeviceId,
                battery_percent: batteryPercent,
                is_charging: isCharging ? 1 : 0,
            },
        });

        return rawData;
    },

    async disconnectActiveDevice(userId: string) {
        const rawData = await callApi("postDisconnectActiveDevice", {
            body: {
                user_id: userId,
            },
        });

        return rawData;
    },

};

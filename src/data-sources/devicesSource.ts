import { callApi } from "@/api";

export const devicesSource = {
    async checkDeviceExist(idDevices: string, idUser: string) {
        const rawData = await callApi("getDevicesCheck", {
            query: { idDevices: idDevices, userId: idUser },
        });

        return rawData;
    },

    async saveDevicesWithUser(idDevices: string, idUser: string, nameDevice: string) {
        const rawData = await callApi("postSaveDevicesWithUser", {
            body: { idDevices: idDevices, userId: idUser, nameDevice: nameDevice },
        });

        return rawData;
    },

};

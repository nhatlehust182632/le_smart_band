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

};

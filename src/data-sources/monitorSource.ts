import { callApi } from "../api/core/apiClient";

export const monitorSources = {
    async getMonitorSourceByUser(id: string) {
        const rawData = await callApi("getMonitorByUser", {
            query: { id },
        });

        return rawData;
    },

    async getMonitorIdDetailSoure(id: string) {
        const rawData = await callApi("getMonitorIdDetailSoure", {
            query: { id },
        });

        return rawData;
    },

};

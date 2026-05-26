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

    async getMonitorConfirmRequests(userId: string) {
        const rawData = await callApi("getMonitorConfirmRequests", {
            query: { userId },
        });

        return rawData;
    },

    async getMonitorNotifications(userId: string) {
        const rawData = await callApi("getMonitorNotifications", {
            query: { userId },
        });

        return rawData;
    },

    async getUsersMonitoringMe(userId: string) {
        const rawData = await callApi("getUsersMonitoringMe", {
            query: { userId },
        });

        return rawData;
    },

    async stopMonitoring(userId: string, monitoredId: string) {
        const rawData = await callApi("stopMonitoring", {
            body: { userId, monitoredId },
        });

        return rawData;
    },

    async removeMonitorFromMe(userId: string, monitorId: string) {
        const rawData = await callApi("removeMonitorFromMe", {
            body: { userId, monitorId },
        });

        return rawData;
    },

    async addMonitorByPhone(payload: { userId: string; phone: string }) {
        const rawData = await callApi("addMonitorByPhone", {
            body: payload,
        });

        return rawData;
    },

};

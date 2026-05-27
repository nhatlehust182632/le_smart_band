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

    async getPendingRequests(id: string) {
        const rawData = await callApi("getPendingRequests", {
            query: { id },
        });

        return rawData;
    },

    async getFollowing(id: string) {
        const rawData = await callApi("getFollowing", {
            query: { id },
        });

        return rawData;
    },

    async getFollowers(id: string) {
        const rawData = await callApi("getFollowers", {
            query: { id },
        });

        return rawData;
    },

    async approveRequest(id: string, requestId: string) {
        const rawData = await callApi("approveRequest", {
            body: { id, request_id: requestId },
        });

        return rawData;
    },

    async sendFollowRequestByPhone(payload: { id: string; phone: string }) {
        const rawData = await callApi("sendFollowRequestByPhone", {
            body: payload,
        });

        return rawData;
    },

};

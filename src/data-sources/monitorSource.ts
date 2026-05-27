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
            query: { idUser: id },
        });

        return rawData;
    },

    async getFollowing(id: string) {
        const rawData = await callApi("getFollowing", {
            query: { idUser: id },
        });

        return rawData;
    },

    async getFollowers(id: string) {
        const rawData = await callApi("getFollowers", {
            query: { idUser: id },
        });

        return rawData;
    },

    async approveRequest(id: string, requestId: string) {
        const rawData = await callApi("approveRequest", {
            body: {
                idUser: id,
                relationId: requestId,
            },
        });

        return rawData;
    },

    async sendFollowRequestByPhone(payload: { id: string; phone: string }) {
        const rawData = await callApi("sendFollowRequestByPhone", {
            body: {
                idUser: payload.id,
                phone: payload.phone,
            },
        });

        return rawData;
    }

};

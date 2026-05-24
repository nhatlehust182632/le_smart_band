import { callApi } from "../core/apiClient";

export const alertService = {
    getAtrialFibrillationWarningCount(userId: string, date?: string) {
        return callApi("getAtrialFibrillationWarningCount", {
            query: {
                userId,
                date,
            },
        });
    },

    getDeviceDisconnectWarningCount(userId: string, date?: string) {
        return callApi("getDeviceDisconnectWarningCount", {
            query: {
                userId,
                date,
            },
        });
    },
};

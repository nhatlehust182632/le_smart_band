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

    saveAtrialAlert(userId: string, thresholdValue: number) {
        return callApi("saveAtrialAlert", {
            body: {
                user_id: userId,
                threshold_value: thresholdValue,
            },
        });
    },

    getAtrialAlertCount(id: string) {
        return callApi("getAtrialAlertCount", {
            query: {
                id,
            },
        });
    },
};

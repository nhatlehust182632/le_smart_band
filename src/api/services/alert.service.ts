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

    saveAtrialAlert(userId: string, thresholdValue: number, message?: string) {
        const body = {
            user_id: userId,
            threshold_value: thresholdValue,
            message: message || `Phát hiện nguy cơ rung nhĩ. Xác suất AI: ${thresholdValue}`,
        };

        console.log("[ATRIAL ALERT API BODY]", body);

        return callApi("saveAtrialAlert", {
            body,
        });
    },

    getAtrialAlertCount(id: string) {
        return callApi("getAtrialAlertCount", {
            query: {
                idUser: id,
            },
        });
    },

    getAtrialAlertsToday(id: string, date?: string) {
        return callApi("getAtrialAlertsToday", {
            query: {
                idUser: id,
                date,
            },
        });
    },
};

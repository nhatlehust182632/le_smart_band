import { callApi } from "../core/apiClient";

export const locationService = {
    saveLocationPlace(data: any) {
        return callApi("saveLocationPlaceNow", {
            body: {
                id: data.id,
                latitude: data.latitude,
                longitude: data.longitude,
                place_key: data.place_key,
                place_name: data.place_name,
                days: data.days || 1,
            },
        });
    },

    getHistoryData(id: string, days: number) {
        return callApi("getListHistoryUser", {
            query: {
                id,
                days,
            },
        });
    },

    getTopLocationData(id: string, days: number) {
        return callApi("getTopLocationUser", {
            query: {
                id,
                days,
            },
        });
    },
};
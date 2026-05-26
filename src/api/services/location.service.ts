import { callApi } from "../core/apiClient";

export const locationService = {
    saveLocationPlace(data: any) {
        return callApi("saveLocationPlaceNow", {
            body: {
                id: data.id,
                latitude: data.latitude,
                longitude: data.longitude,
                place_name: data.place_name,
            },
        });
    },
    getHistoryData(id: string) {
        return callApi("getListHistoryUser", {
            pathParams: { id },
            query: { id },
        });
    },
};

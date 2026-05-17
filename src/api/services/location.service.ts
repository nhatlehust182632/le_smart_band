import { callApi } from "../core/apiClient";

export const locationService = {
    saveLocationPlace(data: any) {
        return callApi("saveLocationPlaceNowApi", {
            body: { ...data },
        });
    },
    getHistoryData(id: string) {
        return callApi("getListHistoryUser", {
            pathParams: { id },
            query: { id },
        });
    },
};

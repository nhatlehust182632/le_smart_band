import { ENV } from "../../constants/env";
import { ApiConfig } from "../core/types";

export const locationApis: Record<string, ApiConfig> = {
    saveLocationPlaceNowApi: {
        name: "saveLocationPlaceNowApi",
        baseUrl: ENV.USER_API_BASE_URL,
        endpoint: "/api/location/placeNow",
        method: "POST",
        timeout: ENV.DEFAULT_TIMEOUT,
        retries: 2,
        authType: "bearer",
        headers: {
            "Content-Type": "application/json",
        },
        token: "USER_ACCESS_TOKEN",
        transformResponse: (data) => data?.data || data,
    },
    getListHistoryUser: {
        name: "getListHistoryUser",
        baseUrl: ENV.USER_API_BASE_URL,
        endpoint: "/api/location/getListHistoryUser",
        method: "GET",
        timeout: ENV.DEFAULT_TIMEOUT,
        retries: 2,
        authType: "bearer",
        headers: {
            "Content-Type": "application/json",
        },
        token: "USER_ACCESS_TOKEN",
        transformResponse: (data) => data?.data || data,
    }
};

import { ENV } from "../../constants/env";
import { ApiConfig } from "../core/types";

export const monitorApiS: Record<string, ApiConfig> = {
    getMonitorByUser: {
        name: "getMonitorByUser",
        baseUrl: ENV.USER_API_BASE_URL,
        endpoint: "/api/monitor/getListMonitor",
        method: "GET",
        timeout: ENV.DEFAULT_TIMEOUT,
        retries: 2,
        authType: "bearer",
        headers: {
            "Content-Type": "application/json",
        },
        token: "USER_ACCESS_TOKEN",
        transformResponse: (data) => data?.data || data,
    },

    getMonitorIdDetailSoure: {
        name: "getMonitorIdDetailSoure",
        baseUrl: ENV.USER_API_BASE_URL,
        endpoint: "/api/monitor/getMonitorIdDetail",
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

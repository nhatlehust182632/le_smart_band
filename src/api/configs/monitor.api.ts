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
    },
    getMonitorConfirmRequests: {
        name: "getMonitorConfirmRequests",
        baseUrl: ENV.USER_API_BASE_URL,
        endpoint: "/api/monitor/getConfirmRequests",
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
    getMonitorNotifications: {
        name: "getMonitorNotifications",
        baseUrl: ENV.USER_API_BASE_URL,
        endpoint: "/api/monitor/getMonitorNotifications",
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
    addMonitorByPhone: {
        name: "addMonitorByPhone",
        baseUrl: ENV.USER_API_BASE_URL,
        endpoint: "/api/monitor/addMonitorByPhone",
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
    getUsersMonitoringMe: {
        name: "getUsersMonitoringMe",
        baseUrl: ENV.USER_API_BASE_URL,
        endpoint: "/api/monitor/getUsersMonitoringMe",
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
    stopMonitoring: {
        name: "stopMonitoring",
        baseUrl: ENV.USER_API_BASE_URL,
        endpoint: "/api/monitor/stopMonitoring",
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
    removeMonitorFromMe: {
        name: "removeMonitorFromMe",
        baseUrl: ENV.USER_API_BASE_URL,
        endpoint: "/api/monitor/removeMonitorFromMe",
        method: "POST",
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

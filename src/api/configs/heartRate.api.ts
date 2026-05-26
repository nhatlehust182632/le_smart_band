import { ENV } from "../../constants/env";
import { ApiConfig } from "../core/types";

export const heartRateApi: Record<string, ApiConfig> = {
  getHeartRateByUser: {
    name: "getHeartRateByUser",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/heartRate/getInfo",
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
  getHeartRateByTimes: {
    name: "getHeartRateByTimes",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/heartRate/ChartTime",
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
  getHeartRateHistory: {
    name: "getHeartRateHistory",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/heartRate/history",
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
  postSaveHeartRateActive: {
    name: "postSaveHeartRateActive",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/heartRate/saveHeartRateActive",
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
};

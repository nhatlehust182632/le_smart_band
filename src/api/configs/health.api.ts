import { ENV } from "../../constants/env";
import { ApiConfig } from "../core/types";

export const healthApis: Record<string, ApiConfig> = {
  getHeartRate: {
    name: "getHeartRate",
    baseUrl: ENV.HEALTH_API_BASE_URL,
    endpoint: "/api/sensors",
    method: "POST",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    transformResponse: (data) => data?.data || data,
  },

  getSteps: {
    name: "getSteps",
    baseUrl: ENV.HEALTH_API_BASE_URL,
    endpoint: "/v1/steps/{deviceId}",
    method: "GET",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    transformResponse: (data) => data?.data || data,
  },

  getSleepData: {
    name: "getSleepData",
    baseUrl: ENV.HEALTH_API_BASE_URL,
    endpoint: "/v1/sleep/{deviceId}",
    method: "GET",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    transformResponse: (data) => data?.data || data,
  },

  getSpo2: {
    name: "getSpo2",
    baseUrl: ENV.HEALTH_API_BASE_URL,
    endpoint: "/v1/spo2/{deviceId}",
    method: "GET",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    transformResponse: (data) => data?.data || data,
  },

  pushHealthData: {
    name: "pushHealthData",
    baseUrl: ENV.HEALTH_API_BASE_URL,
    endpoint: "/v1/health/push",
    method: "POST",
    timeout: 15000,
    retries: 1,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    transformResponse: (data) => data,
  },
};

import { ENV } from "../../constants/env";
import { ApiConfig } from "../core/types";

export const deviceApis: Record<string, ApiConfig> = {
  getDeviceInfo: {
    name: "getDeviceInfo",
    baseUrl: ENV.SMART_BAND_API_BASE_URL,
    endpoint: "/v1/devices/{deviceId}",
    method: "GET",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    transformResponse: (data) => data?.data || data,
  },

  getDeviceBattery: {
    name: "getDeviceBattery",
    baseUrl: ENV.SMART_BAND_API_BASE_URL,
    endpoint: "/v1/devices/{deviceId}/battery",
    method: "GET",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    transformResponse: (data) => data?.data || data,
  },
};

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

  getInfoDevices: {
    name: "getInfoDevices",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/device/getDeviceByUser",
    method: "GET",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    transformResponse: (data) => data?.data || data,
  },

  getDevicesCheck: {
    name: "getDevicesCheck",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/device/checkDeviceExist",
    method: "GET",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    transformResponse: (data) => data?.data || data,
  },

  postSaveDevicesWithUser: {
    name: "postSaveDevicesWithUser",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/device/saveDevicesWithUser",
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

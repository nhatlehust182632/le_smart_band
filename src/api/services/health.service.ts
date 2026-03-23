import { getHeartRate, healthSource } from "../../data-sources/healthSource";
import { callApi } from "../core/apiClient";
import { SensorData } from "../models/health.model";

export const healthService = {
  // getHeartRate(deviceId: string, token: string, from?: string, to?: string) {
  getHeartRate(deviceId: string, token: string, sensorData: SensorData) {
    // return healthSource.getHeartRate(deviceId, token, from, to);
    // return getHeartRate(deviceId, token, from, to);
    return getHeartRate(deviceId, token, sensorData);
  },

  getSteps(deviceId: string, token: string, date?: string) {
    return healthSource.getSteps(deviceId, token, date);
  },

  getSleepData(deviceId: string, token: string, date?: string) {
    return callApi("getSleepData", {
      pathParams: { deviceId },
      query: { date },
      token,
    });
  },

  getSpo2(deviceId: string, token: string, date?: string) {
    return callApi("getSpo2", {
      pathParams: { deviceId },
      query: { date },
      token,
    });
  },

  pushHealthData(token: string, payload: any) {
    return callApi("pushHealthData", {
      body: payload,
      token,
    });
  },
};

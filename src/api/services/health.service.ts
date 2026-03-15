import { getHeartRate, healthSource } from "../../data-sources/healthSource";
import { callApi } from "../core/apiClient";

export const healthService = {
  getHeartRate(deviceId: string, token: string, from?: string, to?: string) {
    // return healthSource.getHeartRate(deviceId, token, from, to);
    return getHeartRate(deviceId, token, from, to);
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

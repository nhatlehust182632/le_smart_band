import { callApi } from "../api/core/apiClient";
import {
    mapHeartRateResponse,
    mapStepsResponse,
} from "../api/mappers/health.mapper";

export const healthApiSource = {
  async getHeartRate(
    deviceId: string,
    token: string,
    from?: string,
    to?: string,
  ) {
    const rawData = await callApi("getHeartRate", {
      pathParams: { deviceId },
      query: { from, to },
      token,
    });

    return mapHeartRateResponse(rawData);
  },

  async getSteps(deviceId: string, token: string, date?: string) {
    const rawData = await callApi("getSteps", {
      pathParams: { deviceId },
      query: { date },
      token,
    });

    return mapStepsResponse(rawData);
  },
};

import { SensorData } from "@/api/models/health.model";
import { callApi } from "../api/core/apiClient";
import {
  mapHeartRateResponse,
  mapStepsResponse,
} from "../api/mappers/health.mapper";

export const healthApiSource = {
  async getHeartRate(
    deviceId: string,
    token: string,
    sensorData: SensorData,
    // from?: string,
    // to?: string,
  ) {
    const rawData = await callApi("getHeartRate", {
      // pathParams: { deviceId },
      body: { ...sensorData },
      // query: { from, to },
      query: sensorData,
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

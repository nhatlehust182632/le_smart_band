import { callApi } from "../api/core/apiClient";

export const heartRateSource = {
  async getHeartRateByUser(id: string) {
    const rawData = await callApi("getHeartRateByUser", {
      query: { id },
    });

    return rawData;
  },

  async getHeartRateByTimes(id: string, type: string) {
    const rawData = await callApi("getHeartRateByTimes", {
      query: { id, type },
    });

    return rawData;
  },

  async getHeartRateHistory(id: string) {
    const rawData = await callApi("getHeartRateHistory", {
      query: { id },
    });

    return rawData;
  },
};

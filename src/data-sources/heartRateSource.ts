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

  async saveHeartRateActive(
    idUser: string,
    bpm: number,
    macAddress?: string,
    idDevices?: string
  ) {
    const body: {
      idUser: string;
      bpm: number;
      mac_address?: string;
      idDevices?: string;
    } = {
      idUser,
      bpm,
    };

    if (macAddress) {
      body.mac_address = macAddress;
    }

    if (idDevices) {
      body.idDevices = idDevices;
    }
    console.log("[HEART RATE SOURCE] Saving heart rate active with data:", body);
    const rawData = await callApi("postSaveHeartRateActive", {
      body,
    });

    return rawData;
  },
};

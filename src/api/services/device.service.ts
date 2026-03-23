import { callApi } from "../core/apiClient";

export const deviceService = {
  getDeviceInfo(deviceId: string, token: string) {
    return callApi("getDeviceInfo", {
      pathParams: { deviceId },
      token,
    });
  },

  getDeviceBattery(deviceId: string, token: string) {
    return callApi("getDeviceBattery", {
      pathParams: { deviceId },
      token,
    });
  },

  getInfoDevices(idUser: string) {
    return callApi("getInfoDevices", {
      pathParams: { idUser },
      query: { id: idUser },
    });
  },
};

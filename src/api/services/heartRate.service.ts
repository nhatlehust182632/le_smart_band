import { heartRateSource } from "@/data-sources/heartRateSource";

export const heartRateSourceUser = {
  getInfoUserIdHeartRate(id: string) {
    return heartRateSource.getHeartRateByUser(id);
  },
  getHeartRateSourceTimes(id: string, type: string) {
    return heartRateSource.getHeartRateByTimes(id, type);
  },
  getHeartRateSourceHistory(id: string) {
    return heartRateSource.getHeartRateHistory(id);
  },
  saveHeartRateActive(
    idUser: string,
    bpm: number,
    macAddress?: string,
    deviceId?: string
  ) {
    return heartRateSource.saveHeartRateActive(
      idUser,
      bpm,
      macAddress,
      deviceId,
    );
  },
};

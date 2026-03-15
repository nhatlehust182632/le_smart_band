import {
    mapHeartRateResponse,
    mapSleepResponse,
} from "../api/mappers/health.mapper";

import heartRateMockJson from "../api/mocks/heart-rate.json";
import sleepMockJson from "../api/mocks/sleep.json";

function mockDelay<T>(data: T, delay = 500): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

export const healthMockSource = {
  async getHeartRate() {
    const mapped = mapHeartRateResponse(heartRateMockJson);
    return mockDelay(mapped, 600);
  },

  async getSteps() {
    const mapped = mapSleepResponse(sleepMockJson);
    return mockDelay(mapped, 700);
  },
};

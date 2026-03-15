import { ENV, ENV_DATA } from "../constants/env";
import { healthApiSource } from "./healthApiSource";
import { healthMockSource } from "./healthMockSource";

export const healthSource =
  ENV.DATA_SOURCE === "mock" ? healthMockSource : healthApiSource;

export const getHeartRate = ENV_DATA.USE_MOCK_HEART_RATE
  ? healthApiSource.getHeartRate
  : healthMockSource.getHeartRate;

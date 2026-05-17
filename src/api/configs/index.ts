import { deviceApis } from "./device.api";
import { healthApis } from "./health.api";
import { heartRateApi } from "./heartRate.api";
import { locationApis } from "./location.api";
import { monitorApiS } from "./monitor.api";
import { userApis } from "./user.api";

export const apiConfigs = {
  ...deviceApis,
  ...healthApis,
  ...userApis,
  ...heartRateApi,
  ...locationApis,
  ...monitorApiS
};

import { healthService } from "./api";
import { SensorData } from "./api/models/health.model";
import { logger } from "./utils/logger";

async function main() {
  const sensorData: SensorData = {
    id: 2,
    heart_rate: 80,
    spo2: 98,
    steps: 1200,
    created_at: "2026-03-17T10:30:00Z",
  };
  try {
    const data = await healthService.getHeartRate(
      "BAND001",
      "USER_ACCESS_TOKEN",
      sensorData,
      // "2026-03-14T00:00:00Z",
      // "2026-03-14T23:59:59Z",
    );

    console.log("Heart rate:", data);
  } catch (error) {
    logger.error("Main app error", error);
  }
}

main();
//  file này chỉ là file dùng để test API

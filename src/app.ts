import { healthService } from "./api";
import { logger } from "./utils/logger";

async function main() {
  try {
    const data = await healthService.getHeartRate(
      "BAND001",
      "USER_ACCESS_TOKEN",
      "2026-03-14T00:00:00Z",
      "2026-03-14T23:59:59Z",
    );

    console.log("Heart rate:", data);
  } catch (error) {
    logger.error("Main app error", error);
  }
}

main();
//  file này chỉ là file dùng để test API

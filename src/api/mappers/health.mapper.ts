import { HeartRateData, SleepData, StepsData } from "../models/health.model";

export function mapHeartRateResponse(raw: any): HeartRateData {
  const data = raw?.data || raw || {};

  return {
    averageHeartRate: Number(data?.hr_avg ?? data?.averageHeartRate ?? 0),
    maxHeartRate: Number(data?.hr_max ?? data?.maxHeartRate ?? 0),
    minHeartRate: Number(data?.hr_min ?? data?.minHeartRate ?? 0),
    measuredAt: String(data?.measure_time ?? data?.measuredAt ?? ""),
  };
}

export function mapStepsResponse(raw: any): StepsData {
  const data = raw?.data || raw || {};

  return {
    totalSteps: Number(data?.steps ?? data?.totalSteps ?? 0),
    distance: Number(data?.distance ?? 0),
    calories: Number(data?.calories ?? 0),
    measuredAt: String(data?.measure_time ?? data?.measuredAt ?? ""),
  };
}

export function mapSleepResponse(raw: any): SleepData {
  const data = raw?.data || raw || {};

  return {
    totalSleepMinutes: Number(
      data?.total_sleep_minutes ?? data?.totalSleepMinutes ?? 0,
    ),
    deepSleepMinutes: Number(
      data?.deep_sleep_minutes ?? data?.deepSleepMinutes ?? 0,
    ),
    lightSleepMinutes: Number(
      data?.light_sleep_minutes ?? data?.lightSleepMinutes ?? 0,
    ),
    awakeMinutes: Number(data?.awake_minutes ?? data?.awakeMinutes ?? 0),
    measuredAt: String(data?.measure_time ?? data?.measuredAt ?? ""),
  };
}

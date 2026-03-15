import { HeartRateData, StepsData } from "../models/health.model";

export const mockHeartRateData: HeartRateData = {
  averageHeartRate: 78,
  maxHeartRate: 120,
  minHeartRate: 62,
  measuredAt: "2026-03-15T10:00:00Z",
};

export const mockStepsData: StepsData = {
  totalSteps: 5421,
  distance: 3.8,
  calories: 214,
  measuredAt: "2026-03-15T10:00:00Z",
};

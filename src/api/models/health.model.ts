export interface HeartRateData {
  averageHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  measuredAt: string;
}

export interface StepsData {
  totalSteps: number;
  distance: number;
  calories: number;
  measuredAt: string;
}

export interface SleepData {
  totalSleepMinutes: number;
  deepSleepMinutes: number;
  lightSleepMinutes: number;
  awakeMinutes: number;
  measuredAt: string;
}

export interface SensorData {
  id: number;
  heart_rate: number;
  spo2: number;
  steps: number;
  created_at: string;
}

export type CurrentLocation = {
  latitude: number;
  longitude: number;
  updatedAt: string;
  placeName?: string;
};

export type HeartRate = {
  model_name: string;
  max_bpm: string;
  min_bpm: string;
  avg_bpm: string;
  latest_bpm: string;
};

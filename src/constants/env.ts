const APP_ENV = "development" as "development" | "staging" | "production";
export const ENV = {
  SMART_BAND_API_BASE_URL: "https://api.smartband.com",
  HEALTH_API_BASE_URL: "https://api.healthdata.com",
  USER_API_BASE_URL: "https://api.usercenter.com",
  DEFAULT_TIMEOUT: 10000,
  APP_ENV,
  // DATA_SOURCE: APP_ENV === "production" ? "api" : "mock", // theo môi trường
  DATA_SOURCE: "mock" as "mock" | "api", //Dùng mock
  // DATA_SOURCE: "api" as "mock" | "api", // Dùng api
};

// tách nhỏ cho từng API, khi API nào chưa có thì sẽ chuyển qua mock
// mock: false, api: true
export const ENV_DATA = {
  USE_MOCK_HEART_RATE: false,
  USE_MOCK_STEPS: false,
  USE_MOCK_SLEEP: false,
};

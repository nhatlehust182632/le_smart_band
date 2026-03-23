const APP_ENV = "development" as "development" | "staging" | "production";
export const ENV = {
  SMART_BAND_API_BASE_URL: "https://api.smartband.com",
  HEALTH_API_BASE_URL: "http://192.168.1.248:3000",
  // USER_API_BASE_URL: "http://192.168.1.52:3000",
  USER_API_BASE_URL: "http://192.168.1.248:3000",
  // USER_API_BASE_URL: "http://172.20.10.2:3000",
  DEFAULT_TIMEOUT: 10000,
  APP_ENV,
  USER_ACCESS_TOKEN: "USER_ACCESS_TOKEN",
  // DATA_SOURCE: APP_ENV === "production" ? "api" : "mock", // theo môi trường
  DATA_SOURCE: "mock" as "mock" | "api", //Dùng mock
  // DATA_SOURCE: "api" as "mock" | "api", // Dùng api
};

// tách nhỏ cho từng API, khi API nào chưa có thì sẽ chuyển qua mock
// mock: false, api: true
export const ENV_DATA = {
  USE_MOCK_HEART_RATE: true,
  USE_MOCK_STEPS: false,
  USE_MOCK_SLEEP: false,
  USE_USER_REGISTER: true,
  USE_USER_LOGIN: true,
};

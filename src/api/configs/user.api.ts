import { ENV } from "../../constants/env";
import { ApiConfig } from "../core/types";

export const userApis: Record<string, ApiConfig> = {
  getUserProfile: {
    name: "getUserProfile",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/v1/users/{userId}",
    method: "GET",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    transformResponse: (data) => data?.data || data,
  },
};

import { ENV } from "../../constants/env";
import { ApiConfig } from "../core/types";

export const userApis: Record<string, ApiConfig> = {
  getUser: {
    name: "getUser",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/user/login",
    method: "GET",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    token: "USER_ACCESS_TOKEN",
    transformResponse: (data) => data?.data || data,
  },

  postUser: {
    name: "postUser",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/user/register",
    method: "POST",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    token: "USER_ACCESS_TOKEN",
    transformResponse: (data) => data?.data || data,
  },

  getProfile: {
    name: "getProfile",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/user/selectInfo",
    method: "GET",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    token: "USER_ACCESS_TOKEN",
    transformResponse: (data) => data?.data || data,
  },

  // postUpdateProfile: {
  //   name: "postUpdateProfile",
  //   baseUrl: ENV.USER_API_BASE_URL,
  //   endpoint: "/api/profile/updateInfo",
  //   method: "POST",
  //   timeout: ENV.DEFAULT_TIMEOUT,
  //   retries: 2,
  //   authType: "bearer",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   token: "USER_ACCESS_TOKEN",
  //   transformResponse: (data) => data?.data || data,
  // },

  getUserEdit: {
    name: "getUserEdit",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/user/getInfoEdit",
    method: "GET",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    token: "USER_ACCESS_TOKEN",
    transformResponse: (data) => data?.data || data,
  },

  postUserSave: {
    name: "postUserSave",
    baseUrl: ENV.USER_API_BASE_URL,
    endpoint: "/api/user/updateInfo",
    method: "POST",
    timeout: ENV.DEFAULT_TIMEOUT,
    retries: 2,
    authType: "bearer",
    headers: {
      "Content-Type": "application/json",
    },
    token: "USER_ACCESS_TOKEN",
    transformResponse: (data) => data?.data || data,
  },
};
